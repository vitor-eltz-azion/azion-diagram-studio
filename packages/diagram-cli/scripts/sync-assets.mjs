import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { primitives } from '../../../webkit/packages/theme/src/tokens/primitives/colors/colors.js'
const pkg = new URL('../', import.meta.url),
  root = new URL('../../../', import.meta.url)
const icons = []
for (const family of ['ai', 'pi']) {
  const folder = new URL(`webkit/packages/icons/src/svg-raw/${family}/`, root)
  for (const file of (await readdir(folder)).filter((f) => f.endsWith('.svg')).sort())
    icons.push({
      name: file.slice(0, -4),
      svg: await readFile(new URL(file, folder), 'utf8'),
      family: family === 'ai' ? 'Azion' : 'General',
    })
}
await mkdir(new URL('src/generated/', pkg), { recursive: true })
await writeFile(
  new URL('src/generated/assets.ts', pkg),
  `// Generated from the local Azion Webkit; run scripts/sync-assets.mjs to refresh.\nexport const iconAssets = ${JSON.stringify(icons)};\nexport const primitives = ${JSON.stringify(primitives)};\n`
)
for (const [source, target] of [['sora/Sora-Regular.ttf', 'sora.ttf']])
  await copyFile(
    new URL(`webkit/apps/fonts/${source}`, root),
    new URL(`assets/fonts/${target}`, pkg)
  )
const version = JSON.parse(
  await readFile(new URL('webkit/packages/icons/package.json', root), 'utf8')
).version
await writeFile(
  new URL('assets/provenance.json', pkg),
  JSON.stringify(
    {
      source: 'https://github.com/aziontech/webkit',
      iconsVersion: version,
      paths: [
        'packages/icons/src/svg-raw',
        'packages/theme/src/tokens/primitives/colors',
        'apps/fonts',
      ],
      iconCount: icons.length,
    },
    null,
    2
  ) + '\n'
)
console.log(`Synced ${icons.length} Webkit SVGs, palette, and Sora.`)
