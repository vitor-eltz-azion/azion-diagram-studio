import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  templates,
  createDiagram,
  parseDiagram,
  renderSvg,
  renderPng,
  escapeXml,
} from '../dist/index.js'
const executable = fileURLToPath(new URL('../dist/cli.js', import.meta.url))
const cli = (args, input) =>
  spawnSync(process.execPath, [executable, ...args], { encoding: 'utf8', input })

test('agents can discover templates, icons, and schema', () => {
  assert.equal(JSON.parse(cli(['templates']).stdout).length, 17)
  assert.ok(
    JSON.parse(cli(['icons', '--search', 'application']).stdout).some(
      (i) => i.name === 'ai-edge-application'
    )
  )
  assert.ok(JSON.parse(cli(['schema']).stdout).properties.nodes)
  assert.equal(cli(['--version']).stdout.trim(), '0.1.0')
})
test('every template validates and renders in both themes without external resources or invalid paths', async () => {
  for (const template of templates)
    for (const theme of ['dark', 'light']) {
      const d = parseDiagram({ ...template, theme })
      const svg = await renderSvg(d)
      assert.doesNotMatch(svg, /NaN|Infinity|<text|<script|<image|@font-face/)
      assert.match(svg, /azion-diagram-model/)
      assert.ok(svg.includes(`aria-label="${escapeXml(d.title)}"`))
      const png = await renderPng(d, 1)
      assert.equal(Buffer.from(png).readUInt32BE(16), d.canvasWidth)
      assert.equal(Buffer.from(png).readUInt32BE(20), d.canvasHeight)
    }
})
test('create → edit → validate → prompt → all exports, with overwrite protection', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'azion-cli-'))
  try {
    const source = join(folder, 'source.json')
    assert.equal(cli(['create', '--template', 'web-delivery', '--out', source]).status, 0)
    const d = JSON.parse(await readFile(source, 'utf8'))
    d.title = 'CLI round trip'
    d.nodes[0].label = 'Customers'
    await writeFile(source, JSON.stringify(d))
    assert.equal(JSON.parse(cli(['validate', '--input', source]).stdout).valid, true)
    assert.match(cli(['prompt', '--input', source]).stdout, /Customers/)
    assert.equal(
      cli([
        'render',
        '--input',
        source,
        '--format',
        'svg,html,png',
        '--out-dir',
        folder,
        '--scale',
        '2',
      ]).status,
      0
    )
    const png = await readFile(join(folder, `${d.id}.png`))
    assert.equal(png.readUInt32BE(16), 2240)
    assert.match(await readFile(join(folder, `${d.id}.html`), 'utf8'), /<!doctype html>/)
    assert.equal(cli(['create', '--out', source]).status, 1)
    assert.equal(JSON.parse(await readFile(source, 'utf8')).title, 'CLI round trip')
    assert.equal(cli(['create', '--out', source, '--force']).status, 0)
  } finally {
    await rm(folder, { recursive: true, force: true })
  }
})
test('stdin specs can omit placement when requesting layout', () => {
  const spec = {
    title: 'Agent model',
    nodes: [
      { id: 'users', label: 'Users', icon: 'pi-users' },
      { id: 'app', label: 'Applications', icon: 'ai-edge-application' },
    ],
    edges: [{ id: 'request', from: 'users', to: 'app', label: 'HTTPS' }],
  }
  const result = cli(['create', '--spec', '-', '--layout'], JSON.stringify(spec))
  assert.equal(result.status, 0, result.stderr)
  const d = parseDiagram(JSON.parse(result.stdout))
  assert.ok(d.nodes[1].x > d.nodes[0].x)
  assert.equal(cli(['validate', '--input', '-'], result.stdout).status, 0)
})
test('invalid inputs fail with machine-readable diagnostics and no artifact', () => {
  const d = createDiagram(templates[0])
  d.edges[0].to = 'missing'
  const result = cli(['render', '--input', '-'], JSON.stringify(d))
  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.match(JSON.parse(result.stderr).error, /existing nodes/)
  for (const args of [
    ['unknown'],
    ['render', '--input', '-', '--scale', '4'],
    ['icons', '--family', 'Bogus'],
    ['templates', '--out', '-'],
  ])
    assert.equal(cli(args, JSON.stringify(createDiagram())).status, 1)
  assert.equal(cli(['validate', '--input', '-'], '{bad').status, 1)
})
