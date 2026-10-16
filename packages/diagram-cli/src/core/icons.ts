import { iconAssets } from '../generated/assets.js'
export const iconCatalog = iconAssets
const index = new Map(iconCatalog.map((icon) => [icon.name, icon.svg]))
export function iconSvg(name: string, namespace = ''): string {
  let svg = index.get(name) || index.get('pi-box')!
  if (!svg.includes('viewBox=')) {
    const width = svg.match(/\bwidth="([\d.]+)"/)?.[1] || '14'
    const height = svg.match(/\bheight="([\d.]+)"/)?.[1] || width
    svg = svg.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`)
  }
  svg = svg.replace(/^<svg\b[^>]*>/, (tag) =>
    tag
      .replace(/\s(?:width|height|xmlns)="[^"]*"/g, '')
      .replace('<svg', '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"')
  )
  if (namespace)
    svg = svg
      .replace(/id="([^"]+)"/g, `id="${namespace}-$1"`)
      .replace(/url\(#([^)]+)\)/g, `url(#${namespace}-$1)`)
  return svg
}
export const productNames: Record<string, string> = {
  'ai-edge-application': 'Applications',
  'ai-edge-functions': 'Functions',
  'ai-edge-firewall': 'Firewall',
  'ai-edge-storage': 'Object Storage',
  'ai-edge-sql': 'SQL Database',
  'ai-edge-ai': 'AI Inference',
  'ai-edge-kv': 'KV Store',
  'ai-edge-dns': 'DNS',
  'ai-digital-certificates': 'Certificate Manager',
}
export function iconLabel(name: string) {
  return (
    productNames[name] ||
    name
      .replace(/^(ai|pi)-/, '')
      .split('-')
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(' ')
  )
}
