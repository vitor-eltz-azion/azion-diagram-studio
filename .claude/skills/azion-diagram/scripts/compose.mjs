#!/usr/bin/env node
// Lays out a column-based spec on the Azion template grid and lints diagrams against Azion naming.
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

const NODE_W = 152
const NODE_H = 96
const MARGIN = 48
const PAD_X = 40
const GAP = 88
const GROUP_GAP = 176
const BAND_TOP = 104
const NODE_TOP = 140
const PAD_BOTTOM = 48
const FOOTER = 108
const MIN_INNER = 304
const ROW_PITCH = 104
const MIN_W = 1120
const MIN_H = 600
const MAX_SIZE = 4096
const CATEGORIES = ['Delivery', 'Compute', 'Storage', 'Data', 'AI', 'Security', 'Observability']

const PRODUCT_ICONS = {
  'ai-edge-application': ['Applications'],
  'ai-edge-firewall': ['Firewall'],
  'ai-edge-connectors': ['Connectors'],
  'ai-edge-ai': ['AI Inference'],
  'ai-edge-functions': ['Functions'],
  'ai-edge-orchestrator': ['Orchestrator'],
  'ai-edge-kv': ['KV Store'],
  'ai-edge-storage': ['Object Storage'],
  'ai-edge-sql': ['SQL Database'],
  'ai-edge-dns': ['Edge DNS'],
  'ai-edge-pulse': ['Edge Pulse'],
  'ai-data-stream': ['Data Stream'],
  'ai-real-time-events': ['Real-Time Events'],
  'ai-real-time-metrics': ['Real-Time Metrics'],
  'ai-real-time-purge': ['Real-Time Purge'],
  'ai-load-balancer': ['Load Balancer'],
  'ai-origin-shield': ['Origin Shield'],
  'ai-waf-rules': ['WAF', 'Web Application Firewall'],
  'ai-tiered-cache': ['Cache', 'Tiered Cache'],
  'ai-live-ingest': ['Live Ingest'],
  'ai-lora': ['LoRA Fine-Tune'],
  'ai-digital-certificates': ['Certificate Manager'],
  'ai-custom-pages': ['Custom Pages'],
  'ai-workloads': ['Workloads'],
  'ai-azion-api': ['API', 'Azion API'],
  'ai-azion-cli': ['CLI', 'Azion CLI'],
  'ai-terraform': ['Terraform Provider'],
  'ai-network-lists': ['Network Lists'],
  'ai-variables': ['Variables'],
  'ai-marketplace': ['Marketplace'],
}
const ICONLESS_PRODUCTS = [
  'Application Accelerator',
  'Image Processor',
  'Bot Manager',
  'Network Shield',
  'DDoS Protection',
  'Console',
  'Copilot',
]
const PRODUCT_NAMES = new Set([...Object.values(PRODUCT_ICONS).flat(), ...ICONLESS_PRODUCTS])
const RETIRED_ICONS = {
  'ai-edge-nodes':
    'its name is a forbidden term; show infrastructure as the AZION PLATFORM boundary',
  'ai-edge-services': 'it is a legacy product icon; pick the current product icon',
  'ai-edge-libraries': 'it is a legacy product icon; pick the current product icon',
  'ai-domains': 'Domains is a legacy resource; use ai-workloads (Workloads)',
}
const DEPRECATED = [
  [/\bEdge Applications?\b/i, 'Applications'],
  [/\bEdge Functions?\b/i, 'Functions'],
  [/\bEdge Firewall\b/i, 'Firewall'],
  [/\bEdge Connectors?\b/i, 'Connectors'],
  [/\bEdge AI\b/i, 'AI Inference'],
  [/\bEdge Cache\b/i, 'Cache'],
  [/\bEdge Orchestrator\b/i, 'Orchestrator'],
  [/\bEdge KV\b/i, 'KV Store'],
  [/\bEdge Storage\b/i, 'Object Storage'],
  [/\bEdge SQL\b/i, 'SQL Database'],
  [/\bEdge WAF\b/i, 'WAF'],
  [/\bData Streaming\b/i, 'Data Stream'],
  [/\bImage (Processing|Optimization)\b/i, 'Image Processor'],
  [/\bApplication Acceleration\b/i, 'Application Accelerator'],
  [/\bReal-Time Manager\b/i, 'Console'],
  [/\bNetwork Layer Protection\b/i, 'Network Shield'],
  [/\bAzion Edge Platform\b/i, 'Azion Platform'],
  [/\bedge (nodes?|locations?)\b/i, 'data centers'],
  [/\bpoints? of presence\b/i, 'data centers'],
  [/\bPoPs?\b/, 'data centers'],
  [/\bedge computing\b/i, 'distributed architecture'],
  [/\bat the edge\b/i, 'on a distributed architecture'],
]

const snap = (value, step) => Math.round(value / step) * step
const width = (n) => n.width ?? NODE_W
const height = (n) => n.height ?? NODE_H
const stackGap = (count) => (count > 2 ? 64 : 112)
const slug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'diagram'
const isProduct = (n) => Boolean(PRODUCT_ICONS[n.icon]) || PRODUCT_NAMES.has(n.label)

async function readJson(file) {
  if (!file) throw new Error('Pass a spec or diagram file, or - for stdin.')
  let text = ''
  if (file === '-') for await (const chunk of process.stdin) text += chunk
  else text = await readFile(resolve(file), 'utf8')
  if (!text.trimStart().startsWith('<')) return JSON.parse(text)
  const model = text.match(/<metadata id="azion-diagram-model">([\s\S]*?)<\/metadata>/)?.[1]
  if (!model)
    throw new Error('This SVG has no azion-diagram-model metadata, so it has no editable diagram.')
  return JSON.parse(
    model
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
  )
}

function compose(spec) {
  if (typeof spec.title !== 'string' || !spec.title.trim()) throw new Error('title is required.')
  if (spec.category && !CATEGORIES.includes(spec.category))
    throw new Error(`category must be one of ${CATEGORIES.join(', ')}.`)
  const nodes = (spec.nodes ?? []).map((n) => ({ ...n }))
  if (!nodes.length) throw new Error('nodes must list at least one node.')
  const ids = new Set()
  const claim = (id, where) => {
    if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(id))
      throw new Error(`${where}: id must be 1–80 letters, digits, underscores, or hyphens.`)
    if (ids.has(id)) throw new Error(`${where}: id "${id}" is already used.`)
    ids.add(id)
  }
  for (const n of nodes) {
    claim(n.id, 'nodes')
    if (!Number.isInteger(n.col) || n.col < 0)
      throw new Error(`nodes.${n.id}.col must be an integer of 0 or more.`)
    if (!n.icon) throw new Error(`nodes.${n.id}.icon is required.`)
  }
  const groupOf = new Map()
  const groups = (spec.groups ?? []).map((g) => {
    claim(g.id, 'groups')
    if (!g.label) throw new Error(`groups.${g.id}.label is required.`)
    if (!g.members?.length) throw new Error(`groups.${g.id}.members needs at least one node id.`)
    for (const m of g.members) {
      if (!nodes.some((n) => n.id === m))
        throw new Error(`groups.${g.id}.members: unknown node "${m}".`)
      if (groupOf.has(m)) throw new Error(`Node "${m}" is in two boundaries; use one.`)
      groupOf.set(m, g.id)
    }
    return g
  })
  const columns = [...new Set(nodes.map((n) => n.col))]
    .sort((a, b) => a - b)
    .map((col) => {
      const members = nodes.filter((n) => n.col === col)
      const owners = [...new Set(members.map((n) => groupOf.get(n.id) ?? null))]
      if (owners.length > 1)
        throw new Error(
          `Column ${col} mixes boundaries (${owners.map((o) => o ?? 'none').join(', ')}); give each boundary its own columns.`
        )
      return { members, group: owners[0], width: Math.max(...members.map(width)) }
    })
  for (const g of groups) {
    const at = columns.flatMap((c, i) => (c.group === g.id ? [i] : []))
    if (at[at.length - 1] - at[0] + 1 !== at.length)
      throw new Error(`Boundary "${g.id}" must cover consecutive columns.`)
  }

  for (const c of columns) {
    const rows = c.members.filter((n) => n.row !== undefined).length
    if (rows && rows !== c.members.length)
      throw new Error(`Column ${c.members[0].col}: set row on every node in the column or on none.`)
    if (rows) {
      for (const n of c.members) {
        if (!Number.isInteger(n.row)) throw new Error(`nodes.${n.id}.row must be an integer.`)
        n.rel = n.row * ROW_PITCH - height(n) / 2
      }
      continue
    }
    const gap = stackGap(c.members.length)
    let rel = -(c.members.reduce((sum, n) => sum + height(n), 0) + gap * (c.members.length - 1)) / 2
    for (const n of c.members) {
      n.rel = rel
      rel += height(n) + gap
    }
  }
  // Fan-out labels sit three quarters along the last segment, so a row change needs the wide gap.
  const colOf = new Map(columns.flatMap((c, i) => c.members.map((n) => [n.id, i])))
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const fansOut = (i) =>
    (spec.edges ?? []).some((e) => {
      const a = byId.get(e.from)
      const b = byId.get(e.to)
      if (!a || !b) return false
      const [left, right] = [colOf.get(a.id), colOf.get(b.id)].sort((p, q) => p - q)
      return left === i && right === i + 1 && Math.abs(a.rel - b.rel) >= 16
    })
  let x = MARGIN + (columns[0].group ? PAD_X : 0)
  columns.forEach((c, i) => {
    const prev = columns[i - 1]
    const wide = prev && ((prev.group && c.group && prev.group !== c.group) || fansOut(i - 1))
    if (prev) x += prev.width + (wide ? GROUP_GAP : GAP)
    c.x = x
  })
  const last = columns[columns.length - 1]
  const contentRight = last.x + last.width + (last.group ? PAD_X : 0)
  const canvasWidth = Math.max(MIN_W, Math.ceil((contentRight + MARGIN) / 8) * 8)
  if (canvasWidth > MAX_SIZE) throw new Error('Too many columns for one canvas; split the diagram.')
  const offset = Math.floor((canvasWidth - contentRight - MARGIN) / 16) * 8

  const top = Math.min(...nodes.map((n) => n.rel))
  const span = Math.max(...nodes.map((n) => n.rel + height(n))) - top
  const inner = Math.max(MIN_INNER, span)
  for (const c of columns)
    for (const n of c.members) {
      n.x = c.x + offset + snap((c.width - width(n)) / 2, 4)
      n.y = snap(NODE_TOP + (inner - span) / 2 + n.rel - top, 4)
    }
  const bandBottom = NODE_TOP + inner + PAD_BOTTOM
  const canvasHeight = Math.max(MIN_H, Math.ceil((bandBottom + FOOTER) / 8) * 8)
  if (canvasHeight > MAX_SIZE)
    throw new Error('Columns are too tall for one canvas; split the diagram.')

  const nodeIds = new Set(nodes.map((n) => n.id))
  const columnSpan = (e) => Math.abs((colOf.get(e.to) ?? 0) - (colOf.get(e.from) ?? 0))
  // Each line is drawn over a background halo, so long lines go first and short ones stay intact.
  const ordered = spec.numbered
    ? (spec.edges ?? [])
    : [...(spec.edges ?? [])].sort((p, q) => columnSpan(q) - columnSpan(p))
  const edges = ordered.map((e) => {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to) || e.from === e.to)
      throw new Error(`Edge ${e.id ?? `${e.from}→${e.to}`} needs two distinct existing nodes.`)
    let id = e.id
    if (id) claim(id, 'edges')
    else {
      id = `${e.from}-${e.to}`
      for (let k = 2; ids.has(id); k++) id = `${e.from}-${e.to}-${k}`
      claim(id, 'edges')
    }
    return {
      id,
      from: e.from,
      to: e.to,
      label: e.label ?? '',
      dashed: e.dashed ?? false,
      routing: e.routing ?? (colOf.get(e.from) === colOf.get(e.to) ? 'straight' : 'orthogonal'),
      arrow: e.arrow ?? 'end',
      ...(e.tone ? { tone: e.tone } : {}),
      locked: false,
    }
  })

  return {
    id: spec.id ?? slug(spec.title),
    title: spec.title,
    description: spec.description ?? '',
    category: spec.category ?? 'Compute',
    canvasWidth,
    canvasHeight,
    theme: spec.theme ?? 'dark',
    grid: spec.grid ?? true,
    numbered: spec.numbered ?? false,
    snap: true,
    gridSize: 8,
    notes: spec.notes ?? '',
    updatedAt: new Date().toISOString(),
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.label ?? '',
      subtitle: n.subtitle ?? '',
      icon: n.icon,
      x: n.x,
      y: n.y,
      width: width(n),
      height: height(n),
      tone: n.tone ?? (isProduct(n) ? 'azion' : 'neutral'),
      shape: n.shape ?? 'card',
      locked: false,
    })),
    edges,
    groups: groups.map((g) => {
      const members = nodes.filter((n) => groupOf.get(n.id) === g.id)
      const left = Math.min(...members.map((n) => n.x)) - PAD_X
      const right = Math.max(...members.map((n) => n.x + width(n))) + PAD_X
      return {
        id: g.id,
        label: g.label.toUpperCase(),
        x: left,
        y: BAND_TOP,
        width: right - left,
        height: bandBottom - BAND_TOP,
        locked: false,
        moveChildren: true,
        tone: g.tone ?? 'neutral',
      }
    }),
  }
}

// Mirrors edgeGeometry in the CLI renderer, including where it places the label.
function edgeShape(a, b, routing = 'orthogonal', incoming = false, label = '') {
  const dx = b.x - a.x
  const dy = b.y - a.y
  let x1, y1, x2, y2, points
  if (Math.abs(dx) < Math.max(width(a), width(b))) {
    x1 = a.x + width(a) / 2
    x2 = b.x + width(b) / 2
    y1 = a.y + (dy >= 0 ? height(a) : 0)
    y2 = b.y + (dy >= 0 ? 0 : height(b))
    const mid = (y1 + y2) / 2
    points = [
      [x1, y1],
      [x1, mid],
      [x2, mid],
      [x2, y2],
    ]
  } else {
    x1 = a.x + (dx >= 0 ? width(a) : 0)
    x2 = b.x + (dx >= 0 ? 0 : width(b))
    y1 = a.y + height(a) / 2
    y2 = b.y + height(b) / 2
    const mid = (x1 + x2) / 2
    points = [
      [x1, y1],
      [mid, y1],
      [mid, y2],
      [x2, y2],
    ]
  }
  if (routing !== 'orthogonal') points = [points[0], points[3]]
  const lx = Math.abs(dy) < 16 ? (x1 + x2) / 2 : incoming ? (x1 * 3 + x2) / 4 : (x1 + x2 * 3) / 4
  const ly = (routing === 'orthogonal' ? (incoming ? y1 : y2) : (y1 + y2) / 2) - 13
  const lw = label.length * 5.6
  return { points, box: label ? { x: lx - lw / 2, y: ly - 9, w: lw, h: 11 } : null }
}

function passesNear(points, [px, py]) {
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1]
    const [x2, y2] = points[i]
    const length = (x2 - x1) ** 2 + (y2 - y1) ** 2
    const t = length
      ? Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / length))
      : 0
    if (Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1))) < 4) return true
  }
  return false
}

const overlaps = (p, q) => p.x < q.x + q.w && p.x + p.w > q.x && p.y < q.y + q.h && p.y + p.h > q.y

function crosses(points, box) {
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1]
    const [x2, y2] = points[i]
    for (let t = 0; t <= 1; t += 1 / 48) {
      const px = x1 + (x2 - x1) * t
      const py = y1 + (y2 - y1) * t
      if (px > box.x + 2 && px < box.x + box.w - 2 && py > box.y + 2 && py < box.y + box.h - 2)
        return true
    }
  }
  return false
}

function lint(d) {
  const warnings = []
  const texts = [
    ['title', d.title],
    ['description', d.description],
    ['notes', d.notes],
    ...(d.nodes ?? []).flatMap((n) => [
      [`nodes.${n.id}.label`, n.label],
      [`nodes.${n.id}.subtitle`, n.subtitle],
    ]),
    ...(d.edges ?? []).map((e) => [`edges.${e.id}.label`, e.label]),
    ...(d.groups ?? []).map((g) => [`groups.${g.id}.label`, g.label]),
  ]
  for (const [path, value] of texts) {
    if (!value) continue
    for (const [pattern, official] of DEPRECATED) {
      const hit = value.match(pattern)
      if (hit) warnings.push(`${path}: "${hit[0]}" is not current Azion naming; use "${official}".`)
    }
    for (const hit of value.matchAll(/\breal[- ]?time (events|metrics|purge)\b/gi)) {
      const official = `Real-Time ${hit[1][0].toUpperCase()}${hit[1].slice(1).toLowerCase()}`
      if (hit[0] !== official) warnings.push(`${path}: write "${official}", not "${hit[0]}".`)
    }
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(d.id ?? ''))
    warnings.push(
      'id: replace the generated UUID with a readable slug; exports are named after it.'
    )
  if (!d.notes?.trim())
    warnings.push(
      'notes: state the assumptions (what is conceptual, what the reader must configure).'
    )
  if ((d.description ?? '').length > 150)
    warnings.push('description: keep it under 150 characters so it fits on one line.')

  for (const n of d.nodes ?? []) {
    if (RETIRED_ICONS[n.icon])
      warnings.push(`nodes.${n.id}.icon: avoid ${n.icon}; ${RETIRED_ICONS[n.icon]}.`)
    const names = PRODUCT_ICONS[n.icon]
    if (names && !names.includes(n.label))
      warnings.push(
        `nodes.${n.id}.label: ${n.icon} is ${names.join(' / ')}; use that as the label and put the role in the subtitle.`
      )
    if (isProduct(n) && n.tone === 'neutral')
      warnings.push(`nodes.${n.id}.tone: Azion products use tone "azion".`)
    if (!isProduct(n) && n.tone === 'azion')
      warnings.push(`nodes.${n.id}.tone: "${n.label}" is not an Azion product; use tone "neutral".`)
    if ((n.label ?? '').length > 18)
      warnings.push(`nodes.${n.id}.label: over 18 characters, so the text shrinks; shorten it.`)
    if ((n.subtitle ?? '').length > 24)
      warnings.push(`nodes.${n.id}.subtitle: over 24 characters, so the text shrinks; shorten it.`)
  }
  for (const g of d.groups ?? [])
    if (g.label !== g.label.toUpperCase())
      warnings.push(`groups.${g.id}.label: boundary labels are uppercase overlines.`)

  const byId = new Map((d.nodes ?? []).map((n) => [n.id, n]))
  const labels = []
  for (const e of d.edges ?? []) {
    if (!e.label)
      warnings.push(`edges.${e.id}.label: name the operation or protocol (HTTPS, Query, Logs).`)
    else if (e.label.length > 16)
      warnings.push(`edges.${e.id}.label: over 16 characters, so it can collide with nearby lines.`)
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    if (!a || !b) continue
    const incoming = d.edges.filter((other) => other.to === e.to).length > 1
    const shape = edgeShape(a, b, e.routing, incoming, e.label)
    const vertical = Math.abs(b.x - a.x) < Math.max(width(a), width(b))
    if (vertical && e.label && (e.routing ?? 'orthogonal') === 'orthogonal' && !incoming)
      warnings.push(`edges.${e.id}.routing: the label sits on the arrowhead; use "straight".`)
    if (!d.numbered)
      for (const before of d.edges.slice(0, d.edges.indexOf(e))) {
        const from = byId.get(before.from)
        const to = byId.get(before.to)
        if (!from || !to) continue
        const bend = edgeShape(from, to, before.routing).points
        const [, turn, after] = shape.points
        const fork =
          turn &&
          Math.hypot(turn[0] - bend[1]?.[0], turn[1] - bend[1]?.[1]) < 4 &&
          after[1] !== turn[1]
        if (bend.length > 2 && !fork && passesNear(shape.points, bend[1]))
          warnings.push(
            `edges.${e.id}: list it before edges.${before.id}, or its outline cuts that branch.`
          )
      }
    for (const n of d.nodes) {
      const box = { x: n.x, y: n.y, w: width(n), h: height(n) }
      if (n !== a && n !== b && crosses(shape.points, box))
        warnings.push(`edges.${e.id}: the line runs through node "${n.id}"; move one of them.`)
      if (shape.box && overlaps(shape.box, box))
        warnings.push(
          `edges.${e.id}.label: "${e.label}" is covered by node "${n.id}"; shorten it or widen the gap.`
        )
    }
    labels.push([e.id, shape.box])
  }
  for (let i = 0; i < labels.length; i++)
    for (let j = i + 1; j < labels.length; j++)
      if (labels[i][1] && labels[j][1] && overlaps(labels[i][1], labels[j][1]))
        warnings.push(`edges.${labels[i][0]} and edges.${labels[j][0]}: labels overlap.`)
  const list = d.nodes ?? []
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      const sideBySide = a.x < b.x + width(b) && a.x + width(a) > b.x
      const gap = Math.max(b.y - a.y - height(a), a.y - b.y - height(b))
      if (sideBySide && gap < 0) warnings.push(`nodes.${a.id} and nodes.${b.id} overlap.`)
      else if (sideBySide && gap < 32)
        warnings.push(
          `nodes.${a.id} and nodes.${b.id} are ${gap}px apart; leave a free row between them.`
        )
    }
  const groups = d.groups ?? []
  const inside = (a, b) =>
    b.x >= a.x && b.y >= a.y && b.x + b.width <= a.x + a.width && b.y + b.height <= a.y + a.height
  for (let i = 0; i < groups.length; i++)
    for (let j = i + 1; j < groups.length; j++) {
      const a = groups[i]
      const b = groups[j]
      const touch =
        a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
      if (touch && !inside(a, b) && !inside(b, a))
        warnings.push(`groups.${a.id} and groups.${b.id} partly overlap.`)
    }
  return warnings
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      check: { type: 'boolean' },
      extract: { type: 'boolean' },
      out: { type: 'string' },
      force: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help || !positionals.length) {
    console.log(
      [
        'Usage (- reads stdin):',
        '  compose.mjs spec.json [--out diagram.json] [--force]    Lay out a spec on the Azion grid',
        '  compose.mjs --check diagram.json|diagram.svg            Lint a full diagram',
        '  compose.mjs --extract diagram.svg [--out diagram.json]  Pull the editable JSON out of an SVG',
      ].join('\n')
    )
    return
  }
  const input = await readJson(positionals[0])
  if (values.check) {
    console.log(JSON.stringify({ ok: true, warnings: lint(input) }, null, 2))
    return
  }
  let warnings = []
  let result = input
  if (!values.extract) {
    result = compose(input)
    warnings = lint(result)
    if (warnings.length) console.error(JSON.stringify({ warnings }, null, 2))
  }
  const text = JSON.stringify(result, null, 2)
  if (!values.out || values.out === '-') {
    console.log(text)
    return
  }
  await writeFile(resolve(values.out), text + '\n', { flag: values.force ? 'w' : 'wx' })
  console.log(JSON.stringify({ ok: true, path: resolve(values.out), warnings: warnings.length }))
}

main().catch((error) => {
  console.error(
    JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })
  )
  process.exitCode = 1
})
