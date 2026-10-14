import { primitives } from '../generated/assets.js'
import { iconSvg } from './icons.js'
import { canvasSize, nodeBounds } from './operations.js'
import type { Diagram, DiagramNode, DiagramEdge, Bounds } from './types.js'
export const WIDTH = 1120,
  HEIGHT = 600,
  NODE_WIDTH = 152,
  NODE_HEIGHT = 96
export const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!
  )
export interface TextSpec {
  x: number
  y: number
  value: string
  size: number
  fill: string
  anchor: string
  mono: boolean
}
export type TextRenderer = (spec: TextSpec) => string
export function colors(theme: Diagram['theme']) {
  const p = primitives
  return theme === 'dark'
    ? {
        bg: p.gray[950],
        node: p.gray[900],
        border: p.gray[750],
        text: p.gray[50],
        muted: p.gray[400],
        line: p.gray[600],
        dot: p.gray[800],
        group: p.gray[950],
        orange: p.orange[500],
      }
    : {
        bg: p.base.white,
        node: p.gray[50],
        border: p.gray[250],
        text: p.gray[900],
        muted: p.gray[600],
        line: p.gray[400],
        dot: p.gray[200],
        group: p.gray[50],
        orange: p.orange[500],
      }
}
export function edgeGeometry(
  a: DiagramNode,
  b: DiagramNode,
  routing: DiagramEdge['routing'] = 'orthogonal',
  incoming = false
) {
  const aa = nodeBounds(a),
    bb = nodeBounds(b),
    dx = bb.x - aa.x,
    dy = bb.y - aa.y
  let x1: number, y1: number, x2: number, y2: number, d: string
  if (Math.abs(dx) < Math.max(aa.width, bb.width)) {
    x1 = aa.x + aa.width / 2
    x2 = bb.x + bb.width / 2
    y1 = aa.y + (dy >= 0 ? aa.height : 0)
    y2 = bb.y + (dy >= 0 ? 0 : bb.height)
    const mid = (y1 + y2) / 2
    d = `M${x1} ${y1} V${mid} H${x2} V${y2}`
  } else {
    x1 = aa.x + (dx >= 0 ? aa.width : 0)
    x2 = bb.x + (dx >= 0 ? 0 : bb.width)
    y1 = aa.y + aa.height / 2
    y2 = bb.y + bb.height / 2
    const mid = (x1 + x2) / 2
    d = `M${x1} ${y1} H${mid} V${y2} H${x2}`
  }
  if (routing === 'straight') d = `M${x1} ${y1} L${x2} ${y2}`
  if (routing === 'curved')
    d = `M${x1} ${y1} C${(x1 + x2) / 2} ${y1},${(x1 + x2) / 2} ${y2},${x2} ${y2}`
  const x = Math.abs(dy) < 16 ? (x1 + x2) / 2 : incoming ? (x1 * 3 + x2) / 4 : (x1 + x2 * 3) / 4
  const y = (routing === 'orthogonal' ? (incoming ? y1 : y2) : (y1 + y2) / 2) - 13
  return { d, x, y }
}
export function renderDiagram(
  diagram: Diagram,
  options: {
    namespace?: string
    selected?: string | string[]
    interactive?: boolean
    chrome?: boolean
    textRenderer?: TextRenderer
    metadata?: boolean
  } = {}
) {
  const {
    namespace = 'diagram',
    interactive = false,
    chrome = true,
    textRenderer,
    metadata = false,
  } = options
  const selected = new Set(
    Array.isArray(options.selected) ? options.selected : options.selected ? [options.selected] : []
  )
  const c = colors(diagram.theme),
    id = namespace.replace(/[^a-zA-Z0-9_-]/g, ''),
    canvas = canvasSize(diagram)
  const text = (
    x: number,
    y: number,
    value: string,
    size: number,
    fill: string,
    anchor = 'start',
    mono = false
  ) =>
    textRenderer
      ? textRenderer({ x, y, value, size, fill, anchor, mono })
      : `<text x="${x}" y="${y}" font-family="${mono ? 'Proto Mono' : 'Sora'}, sans-serif" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${escapeXml(value)}</text>`
  const handles = (b: Bounds, objectId: string) =>
    ['nw', 'ne', 'sw', 'se']
      .map(
        (h) =>
          `<rect data-resize-id="${escapeXml(objectId)}" data-handle="${h}" x="${b.x + (h.includes('e') ? b.width : 0) - 5}" y="${b.y + (h.includes('s') ? b.height : 0) - 5}" width="10" height="10" rx="2" fill="${c.bg}" stroke="${c.orange}" stroke-width="2" style="cursor:${h}-resize"/>`
      )
      .join('')
  const groups = diagram.groups
    .map((group) => {
      const active = selected.has(group.id),
        stroke =
          active || group.tone === 'azion'
            ? c.orange
            : group.tone === 'accent'
              ? primitives.violet[500]
              : c.border
      return `<g data-group-id="${escapeXml(group.id)}" ${interactive ? `tabindex="0" role="button" aria-label="Edit boundary ${escapeXml(group.label)}" style="cursor:${group.locked ? 'default' : 'move'}"` : ''}><rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}" rx="8" fill="${c.group}" fill-opacity=".6" stroke="${stroke}" stroke-width="${active ? 2 : 1}" stroke-dasharray="5 5" ${interactive ? 'pointer-events="stroke"' : ''}/>${interactive ? `<rect x="${group.x}" y="${group.y}" width="${group.width}" height="36" fill="transparent"/>` : ''}${text(group.x + 18, group.y + 25, group.label, 10, active ? c.orange : c.muted, 'start', true)}${group.locked ? text(group.x + group.width - 15, group.y + 24, 'L', 9, c.muted, 'middle', true) : ''}</g>`
    })
    .join('')
  const edges = diagram.edges
    .map((edge, i) => {
      const a = diagram.nodes.find((n) => n.id === edge.from),
        b = diagram.nodes.find((n) => n.id === edge.to)
      if (!a || !b) return ''
      const incoming = diagram.edges.filter((e) => e.to === edge.to).length > 1,
        geo = edgeGeometry(a, b, edge.routing, incoming)
      const tone = edge.tone ?? a.tone,
        color =
          selected.has(edge.id) || tone === 'azion'
            ? c.orange
            : tone === 'accent'
              ? primitives.violet[500]
              : c.line,
        marker =
          color === c.orange ? 'orange' : color === primitives.violet[500] ? 'accent' : 'arrow'
      return `<g data-edge-id="${escapeXml(edge.id)}" ${interactive ? `tabindex="0" role="button" aria-label="Connection: ${escapeXml(edge.label || a.label + ' to ' + b.label)}" style="cursor:pointer"` : ''}><path d="${geo.d}" stroke="${c.bg}" stroke-width="7" fill="none"/><path d="${geo.d}" stroke="${color}" stroke-width="${selected.has(edge.id) ? 2.5 : 1.5}" fill="none" ${edge.dashed ? 'stroke-dasharray="5 5"' : ''} ${edge.arrow !== 'none' ? `marker-end="url(#${id}-${marker})"` : ''} ${edge.arrow === 'both' ? `marker-start="url(#${id}-${marker})"` : ''}/>${interactive ? `<path d="${geo.d}" stroke="transparent" stroke-width="18" fill="none"/>` : ''}${edge.label ? `<rect x="${geo.x - edge.label.length * 3.2 - 5}" y="${geo.y - 12}" width="${edge.label.length * 6.4 + 10}" height="17" rx="3" fill="${c.bg}"/>${text(geo.x, geo.y, edge.label, 10, c.muted, 'middle')}` : ''}${diagram.numbered ? `<circle data-step="${i + 1}" cx="${geo.x}" cy="${geo.y + 28}" r="9" fill="${c.orange}"/>${text(geo.x, geo.y + 31, String(i + 1), 9, primitives.base.white, 'middle')}` : ''}</g>`
    })
    .join('')
  const nodes = diagram.nodes
    .map((node) => {
      const active = selected.has(node.id),
        color =
          node.tone === 'azion'
            ? c.orange
            : node.tone === 'accent'
              ? primitives.violet[500]
              : c.text,
        b = nodeBounds(node),
        w = b.width,
        h = b.height,
        shape = node.shape ?? 'card'
      const stroke = `fill="${c.node}" stroke="${active ? c.orange : c.border}" stroke-width="${active ? 2 : 1}"`
      const box =
        shape === 'ellipse'
          ? `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" ${stroke}/>`
          : shape === 'diamond'
            ? `<path d="M${w / 2} 0L${w} ${h / 2}L${w / 2} ${h}L0 ${h / 2}Z" ${stroke}/>`
            : `<rect width="${w}" height="${h}" rx="${shape === 'rectangle' ? 0 : 7}" ${shape === 'text' ? `fill="transparent" stroke="${active ? c.orange : 'none'}"` : stroke}/>`
      const fontSize = Math.min(
        shape === 'text' ? 20 : 11.5,
        (w - (shape === 'diamond' ? w * 0.35 : 16)) / Math.max(node.label.length * 0.62, 1)
      )
      const showIcon = shape === 'card',
        labelY = showIcon ? h * 0.66 : h / 2 + (node.subtitle ? 0 : 4)
      return `<g data-node-id="${escapeXml(node.id)}" transform="translate(${node.x} ${node.y})" ${interactive ? `tabindex="0" role="button" aria-label="${escapeXml(node.subtitle ? `${node.label}, ${node.subtitle}` : node.label)}" style="cursor:${node.locked ? 'default' : 'grab'}"` : ''}>${box}${showIcon ? `<svg x="${w / 2 - 13}" y="${Math.max(8, h * 0.16)}" width="26" height="26" style="color:${color}" fill="${color}">${iconSvg(node.icon, `${id}-${node.id}`)}</svg>` : ''}${text(w / 2, labelY, node.label, fontSize, c.text, 'middle')} ${text(w / 2, showIcon ? h * 0.84 : labelY + 18, node.subtitle, Math.min(9, (w - 16) / Math.max(node.subtitle.length * 0.6, 1)), c.muted, 'middle')}${node.locked ? text(w - 12, 14, 'L', 8, c.muted, 'middle', true) : ''}</g>`
    })
    .join('')
  const overlay = interactive
    ? [
        ...diagram.groups,
        ...diagram.nodes.map((n) => ({ ...nodeBounds(n), id: n.id, locked: n.locked })),
      ]
        .filter((o) => selected.has(o.id) && !o.locked)
        .map((o) => handles(o, o.id))
        .join('')
    : ''
  const header = chrome
    ? `${text(40, 38, diagram.title, 21, c.text)}${text(40, 62, diagram.description, 10.5, c.muted)}`
    : ''
  const footer = chrome
    ? `<line x1="40" x2="${canvas.width - 40}" y1="${canvas.height - 52}" y2="${canvas.height - 52}" stroke="${c.border}"/>${text(40, canvas.height - 26, 'AZION / DIAGRAM STUDIO', 10, c.muted, 'start', true)}<line x1="${canvas.width - 322}" x2="${canvas.width - 296}" y1="${canvas.height - 29}" y2="${canvas.height - 29}" stroke="${c.orange}"/>${text(canvas.width - 288, canvas.height - 26, 'Request flow', 9, c.muted)}<line x1="${canvas.width - 189}" x2="${canvas.width - 163}" y1="${canvas.height - 29}" y2="${canvas.height - 29}" stroke="${c.line}" stroke-dasharray="4 4"/>${text(canvas.width - 155, canvas.height - 26, 'Async flow', 9, c.muted)}`
    : ''
  const markers = [
    ['arrow', c.line],
    ['orange', c.orange],
    ['accent', primitives.violet[500]],
  ]
    .map(
      ([name, color]) =>
        `<marker id="${id}-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="${color}" stroke-width="1.5"/></marker>`
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}" role="${interactive ? 'group' : 'img'}" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escapeXml(diagram.title)}</title><desc id="${id}-desc">${escapeXml(diagram.description + ' ' + diagram.notes)}</desc>${metadata ? `<metadata id="azion-diagram-model">${escapeXml(JSON.stringify(diagram))}</metadata>` : ''}<defs><pattern id="${id}-dots" width="${diagram.gridSize ?? 16}" height="${diagram.gridSize ?? 16}" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="${c.dot}"/></pattern>${markers}</defs><rect width="${canvas.width}" height="${canvas.height}" fill="${c.bg}"/>${diagram.grid ? `<rect width="${canvas.width}" height="${canvas.height}" fill="url(#${id}-dots)"/>` : ''}${header}${groups}${edges}${nodes}${footer}${overlay}</svg>`
}
export function buildPrompt(diagram: Diagram) {
  const c = canvasSize(diagram)
  return `Create an Azion system architecture diagram titled "${diagram.title}".\n\nPurpose: ${diagram.description}\n\nUse a ${c.width} × ${c.height} canvas with the Azion ${diagram.theme} theme, Sora typography, Proto Mono overlines, ${primitives.orange[500]} primary accents, and an ${diagram.gridSize ?? 8}px alignment grid. ${diagram.grid ? 'Include a subtle dot grid.' : 'Use a plain background.'} ${diagram.numbered ? 'Number the flow steps.' : 'Keep flows unnumbered.'}\n\nUse original Azion Webkit SVGs; preserve their proportions.\n\nNodes (top-left coordinates):\n${diagram.nodes.map((n) => `- ${n.id}: "${n.label}" (${n.subtitle || 'service'}), icon ${n.icon}, position (${n.x}, ${n.y}), size ${n.width ?? 152} × ${n.height ?? 96}, shape ${n.shape ?? 'card'}, ${n.tone} styling.`).join('\n') || '- No nodes defined.'}\n\nConnections:\n${diagram.edges.map((e) => `- ${e.from} → ${e.to}: "${e.label}", ${e.dashed ? 'dashed asynchronous' : 'solid request'} flow, ${e.routing ?? 'orthogonal'} routing, ${e.arrow ?? 'end'} arrows.`).join('\n') || '- No connections defined.'}\n\nBoundaries:\n${diagram.groups.map((g) => `- ${g.label}: x=${g.x}, y=${g.y}, width=${g.width}, height=${g.height}.`).join('\n') || '- No boundaries defined.'}\n\nArchitecture notes: ${diagram.notes}\n\nKeep labels readable and connectors clear of nodes. Do not invent product capabilities or connections. Provide editable diagram JSON plus a self-contained SVG and HTML preview with embedded assets.`
}
