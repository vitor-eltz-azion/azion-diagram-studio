import type { Diagram } from '../data/types'
import { renderDiagram, escapeXml, colors } from './diagram'
import soraUrl from '../../packages/diagram-cli/assets/fonts/sora.ttf?url'
import monoUrl from '../assets/fonts/ProtoMono-Regular.ttf?url'
import type { Font } from 'opentype.js'
import { outlineText } from '../../packages/diagram-cli/src/core/typography'
import { canvasSize } from '../../packages/diagram-cli/src/core/operations'
let fonts: Promise<{ sora: Font; mono: Font }> | undefined
async function getFonts() {
  if (!fonts)
    fonts = (async () => {
      const { parse } = await import('opentype.js')
      const [sora, mono] = await Promise.all(
        [soraUrl, monoUrl].map(async (url) => {
          const response = await fetch(url)
          if (!response.ok) throw new Error('Could not load the diagram font. Please try again.')
          return parse(await response.arrayBuffer())
        })
      )
      return { sora: sora!, mono: mono! }
    })().catch((error) => {
      fonts = undefined
      throw error
    })
  return fonts
}
// Outline export text so SVG and PNG preserve the exact typefaces offline in any viewer.
// The app's source model retains editable text, and SVG paths retain accessible labels.
export async function exportSvg(diagram: Diagram): Promise<string> {
  const { sora, mono } = await getFonts()
  return renderDiagram(diagram, {
    namespace: 'export',
    metadata: true,
    textRenderer: outlineText(sora, mono),
  })
}
export async function exportHtml(diagram: Diagram) {
  const svg = await exportSvg(diagram)
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeXml(diagram.title)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:${colors(diagram.theme).bg}}main{width:min(100%,1440px)}svg{display:block;width:100%;height:auto}</style></head><body><main>${svg}</main></body></html>`
}
export async function exportPng(diagram: Diagram, scale = 2): Promise<Blob> {
  const svg = await exportSvg(diagram),
    url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('PNG rendering failed. Try SVG instead.'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize(diagram).width * scale
    canvas.height = canvasSize(diagram).height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is unavailable in this browser.')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed.'))),
        'image/png'
      )
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
export function download(content: string | Blob, filename: string, type = 'text/plain') {
  const url = URL.createObjectURL(
    typeof content === 'string' ? new Blob([content], { type }) : content
  )
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export const filename = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'azion-diagram'
export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const area = document.createElement('textarea')
  area.value = value
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.append(area)
  area.select()
  const copied = document.execCommand('copy')
  area.remove()
  if (!copied) throw new Error('Clipboard access is unavailable. Download the file instead.')
}
export async function copyPng(diagram: Diagram, scale: number) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined')
    throw new Error('Image copying is unavailable in this browser. Use Download PNG instead.')
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': exportPng(diagram, scale) })])
}
