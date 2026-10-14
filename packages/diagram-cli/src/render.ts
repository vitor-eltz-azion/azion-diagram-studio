import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'
import { renderDiagram, escapeXml, colors } from './core/diagram.js'
import { outlineText } from './core/typography.js'
import { parseDiagram } from './core/schema.js'
import { canvasSize } from './core/operations.js'
import type { Diagram } from './core/types.js'
export interface RenderOptions {
  monoFont?: string
}
const fontCache = new Map<string, Promise<ReturnType<typeof outlineText>>>()
async function fonts(options: RenderOptions = {}) {
  const custom = options.monoFont || process.env.AZION_DIAGRAM_MONO_FONT
  const key = custom ? resolve(custom) : ''
  if (!fontCache.has(key)) {
    const sources = [
      new URL('../assets/fonts/sora.ttf', import.meta.url),
      key || new URL('../assets/fonts/sora.ttf', import.meta.url),
    ]
    fontCache.set(
      key,
      Promise.all(
        sources.map(async (file) => {
          const buffer = await readFile(file)
          return opentype.parse(
            buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
          )
        })
      )
        .then(([sora, mono]) => outlineText(sora!, mono!))
        .catch((error) => {
          fontCache.delete(key)
          throw error
        })
    )
  }
  return fontCache.get(key)!
}
export async function renderSvg(value: Diagram, options: RenderOptions = {}) {
  const d = parseDiagram(value)
  return renderDiagram(d, { metadata: true, textRenderer: await fonts(options) })
}
export async function renderHtml(value: Diagram, options: RenderOptions = {}) {
  const d = parseDiagram(value)
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeXml(d.title)}</title><style>body{margin:0;background:${colors(d.theme).bg};display:grid;min-height:100vh;place-items:center}main{width:min(100%,1600px)}svg{width:100%;height:auto;display:block}</style></head><body><main>${await renderSvg(d, options)}</main></body></html>`
}
export async function renderPng(value: Diagram, scale = 2, options: RenderOptions = {}) {
  if (!Number.isInteger(scale) || scale < 1 || scale > 3)
    throw new Error('Scale must be 1, 2, or 3.')
  const d = parseDiagram(value),
    svg = await renderSvg(d, options)
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: canvasSize(d).width * scale },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng()
}
