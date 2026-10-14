import type { Font } from 'opentype.js'
import { escapeXml, type TextRenderer } from './diagram.js'
export function outlineText(sora: Font, mono: Font): TextRenderer {
  return ({ x, y, value, size, fill, anchor, mono: isMono }) => {
    const font = isMono ? mono : sora
    if (anchor === 'middle') x -= font.getAdvanceWidth(value, size) / 2
    const d = font.getPath(value, x, y, size).toPathData(3)
    if (/NaN|Infinity/.test(d)) throw new Error('The font produced invalid path coordinates.')
    return `<path d="${d}" fill="${fill}" aria-label="${escapeXml(value)}"/>`
  }
}
