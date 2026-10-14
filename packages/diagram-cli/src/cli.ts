#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve, extname } from 'node:path'
import { z } from 'zod'
import { templates, createDiagram } from './core/templates.js'
import { iconCatalog, iconLabel } from './core/icons.js'
import { parseDiagram, diagramSchema } from './core/schema.js'
import { autoLayout } from './core/operations.js'
import { buildPrompt } from './core/diagram.js'
import { renderSvg, renderHtml, renderPng } from './render.js'
import type { Diagram } from './core/types.js'
const help = `Azion Diagram Studio CLI\n\nCommands:\n  templates                              List architecture templates (JSON)\n  icons [--search term] [--family Azion]   Find valid SVG icon names (JSON)\n  schema [--out diagram.schema.json]      Print the JSON schema\n  create --template web-delivery --out diagram.json\n  create --spec input.json --layout --out diagram.json\n  validate --input diagram.json           Validate geometry, IDs, icons, and edges\n  layout --input diagram.json --out arranged.json\n  render --input diagram.json --format svg,html,png --out-dir ./exports\n  prompt --input diagram.json [--out prompt.txt]\n\nOptions:\n  --input - / --spec -    Read JSON from stdin\n  --template blank       Start with an empty canvas\n  --title "My design"     Override a template title\n  --theme dark|light     Override a diagram theme\n  --out FILE             Write one artifact (use - for text stdout)\n  --out-dir DIR          Write multiple rendered formats\n  --scale 1|2|3          PNG resolution, default 2\n  --force                Allow overwriting an existing output file\n  --json                 Wrap prompt output as JSON\n  --help / --version\n\nCreate JSON → edit it → validate → render. Import JSON or exported SVG into the dashboard to continue editing.\n`
const allowed: Record<string, string[]> = {
  templates: [],
  icons: ['search', 'family'],
  schema: ['out', 'force'],
  create: ['template', 'spec', 'layout', 'title', 'theme', 'out', 'force'],
  validate: ['input'],
  layout: ['input', 'out', 'force'],
  render: ['input', 'format', 'out', 'out-dir', 'scale', 'theme', 'force'],
  prompt: ['input', 'out', 'force', 'json'],
}
async function readJson(file: string | undefined) {
  if (!file) throw new Error('--input (or --spec) is required.')
  const text =
    file === '-'
      ? await new Promise<string>((resolve, reject) => {
          let s = ''
          process.stdin.setEncoding('utf8')
          process.stdin.on('data', (chunk) => {
            s += chunk
            if (s.length > 5_000_000) {
              reject(new Error('Input exceeds 5 MB.'))
              process.stdin.destroy()
            }
          })
          process.stdin.on('end', () => resolve(s))
          process.stdin.on('error', reject)
        })
      : await readFile(resolve(file), 'utf8')
  if (Buffer.byteLength(text) > 5_000_000) throw new Error('Input exceeds 5 MB.')
  return JSON.parse(text)
}
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean' },
      template: { type: 'string' },
      spec: { type: 'string' },
      input: { type: 'string' },
      out: { type: 'string' },
      'out-dir': { type: 'string' },
      format: { type: 'string' },
      scale: { type: 'string' },
      search: { type: 'string' },
      family: { type: 'string' },
      title: { type: 'string' },
      theme: { type: 'string' },
      force: { type: 'boolean' },
      layout: { type: 'boolean' },
      json: { type: 'boolean' },
    },
  })
  if (values.version) {
    console.log('0.1.0')
    return
  }
  if (values.help || !positionals.length) {
    console.log(help)
    return
  }
  const command = positionals[0] === 'init' ? 'create' : positionals[0]!
  if (!(command in allowed) || positionals.length > 1)
    throw new Error('Unknown command. Use --help for usage.')
  for (const key of Object.keys(values))
    if (!allowed[command]!.includes(key)) throw new Error(`--${key} is not valid for ${command}.`)
  const emit = (value: unknown) => console.log(JSON.stringify(value, null, 2))
  async function output(file: string | undefined, data: string | Uint8Array) {
    if (!file || file === '-') {
      if (typeof data !== 'string') throw new Error('PNG requires --out or --out-dir.')
      process.stdout.write(data + (data.endsWith('\n') ? '' : '\n'))
      return
    }
    await mkdir(dirname(resolve(file)), { recursive: true })
    await writeFile(resolve(file), data, { flag: values.force ? 'w' : 'wx' })
    emit({ ok: true, path: resolve(file), bytes: Buffer.byteLength(data) })
  }
  if (command === 'templates') {
    emit(
      templates.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        nodes: t.nodes.length,
      }))
    )
    return
  }
  if (command === 'icons') {
    if (values.family && !['Azion', 'General'].includes(values.family))
      throw new Error('--family must be Azion or General.')
    emit(
      iconCatalog
        .filter(
          (i) =>
            (!values.family || i.family === values.family) &&
            `${i.name} ${iconLabel(i.name)}`
              .toLowerCase()
              .includes((values.search || '').toLowerCase())
        )
        .map(({ name, family }) => ({ name, label: iconLabel(name), family }))
    )
    return
  }
  if (command === 'schema') {
    await output(values.out, JSON.stringify(z.toJSONSchema(diagramSchema), null, 2))
    return
  }
  if (command === 'create') {
    if (values.template && values.spec) throw new Error('Choose --template or --spec, not both.')
    const template = templates.find((t) => t.id === values.template)
    if (values.template && values.template !== 'blank' && !template)
      throw new Error(`Unknown template "${values.template}". Run templates to list IDs.`)
    let data = values.spec ? await readJson(values.spec) : createDiagram(template)
    if (values.title) data.title = values.title
    if (values.theme) data.theme = values.theme
    if (values.layout) {
      data.nodes = (data.nodes || []).map((n: Record<string, unknown>) => ({ x: 48, y: 144, ...n }))
      data = diagramSchema.parse(data)
      autoLayout(data)
    }
    await output(values.out, JSON.stringify(parseDiagram(data), null, 2))
    return
  }
  const input = await readJson(values.input)
  if (command === 'layout') {
    const d = diagramSchema.parse(input)
    autoLayout(d)
    await output(values.out, JSON.stringify(parseDiagram(d), null, 2))
    return
  }
  if (values.theme) input.theme = values.theme
  const diagram = parseDiagram(input)
  if (command === 'validate') {
    emit({
      valid: true,
      nodes: diagram.nodes.length,
      connections: diagram.edges.length,
      boundaries: diagram.groups.length,
    })
    return
  }
  if (command === 'prompt') {
    await output(
      values.out,
      values.json ? JSON.stringify({ prompt: buildPrompt(diagram) }, null, 2) : buildPrompt(diagram)
    )
    return
  }
  const formats = [
    ...new Set(
      (
        values.format || (values.out && values.out !== '-' ? extname(values.out).slice(1) : 'svg')
      ).split(',')
    ),
  ]
  if (!formats.length || formats.some((f) => !['svg', 'html', 'png'].includes(f)))
    throw new Error('--format accepts svg, html, png, or a comma-separated list.')
  if (formats.length > 1 && !values['out-dir'])
    throw new Error('Multiple formats require --out-dir.')
  if (values.out && values['out-dir']) throw new Error('Choose --out or --out-dir.')
  const scale = Number(values.scale ?? 2)
  if (!Number.isInteger(scale) || scale < 1 || scale > 3)
    throw new Error('--scale must be 1, 2, or 3.')
  for (const format of formats) {
    const content =
      format === 'png'
        ? await renderPng(diagram, scale)
        : format === 'html'
          ? await renderHtml(diagram)
          : await renderSvg(diagram)
    const file = values['out-dir']
      ? resolve(values['out-dir'], `${diagram.id}.${format}`)
      : values.out
    await output(file, content)
  }
}
main().catch((error) => {
  console.error(
    JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })
  )
  process.exitCode = 1
})
