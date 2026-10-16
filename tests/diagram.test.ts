import { describe, it, expect, vi } from 'vitest'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { templates, createDiagram } from '../app/data/templates'
import { iconCatalog, iconSvg } from '../app/data/icons'
import {
  renderDiagram,
  buildPrompt,
  NODE_WIDTH,
  NODE_HEIGHT,
  WIDTH,
  HEIGHT,
} from '../app/utils/diagram'
import { exportSvg, exportHtml } from '../app/utils/export'

vi.stubGlobal('fetch', async (url: string) => {
  const file = await readFile(resolve(String(url).replace(/^\//, '')))
  return new Response(file)
})

describe('Architecture templates', () => {
  for (const template of templates) {
    it(`${template.title}: valid nodes, icons, groups and connections`, () => {
      const ids = template.nodes.map((n) => n.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const node of template.nodes) {
        expect(iconCatalog.some((icon) => icon.name === node.icon)).toBe(true)
        expect(node.x).toBeGreaterThanOrEqual(0)
        expect(node.y).toBeGreaterThanOrEqual(80)
        expect(node.x + NODE_WIDTH).toBeLessThanOrEqual(template.canvasWidth ?? WIDTH)
        expect(node.y + NODE_HEIGHT).toBeLessThanOrEqual((template.canvasHeight ?? HEIGHT) - 64)
      }
      for (const edge of template.edges) {
        expect(ids).toContain(edge.from)
        expect(ids).toContain(edge.to)
        expect(edge.from).not.toBe(edge.to)
      }
      for (const group of template.groups) {
        expect(group.x + group.width).toBeLessThanOrEqual(template.canvasWidth ?? WIDTH)
        expect(group.y + group.height).toBeLessThanOrEqual((template.canvasHeight ?? HEIGHT) - 64)
      }
    })
    for (const theme of ['dark', 'light'] as const) {
      it(`${template.title}: portable ${theme} SVG and HTML`, async () => {
        const diagram = { ...template, theme }
        const svg = await exportSvg(diagram)
        const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
        expect(doc.querySelector('parsererror')).toBeNull()
        expect(doc.querySelectorAll('text').length).toBe(0)
        expect(svg).not.toMatch(/NaN|Infinity/)
        expect(doc.querySelectorAll('path').length).toBeGreaterThan(20)
        expect(doc.querySelectorAll('[data-node-id]').length).toBe(diagram.nodes.length)
        expect(svg).not.toMatch(
          /<script|<foreignObject|<image|@font-face|https:\/\/(?!www\.w3\.org)/
        )
        expect(doc.querySelector('title')?.textContent).toBe(diagram.title)
        const ids = Array.from(doc.querySelectorAll('[id]')).map((e) => e.id)
        expect(new Set(ids).size).toBe(ids.length)
        const html = await exportHtml(diagram)
        expect(html).toContain('<!doctype html>')
        expect(html).toContain('<svg')
        expect(html).not.toContain('<script')
        await mkdir('.artifacts/exports', { recursive: true })
        await writeFile(`.artifacts/exports/${template.id}-${theme}.svg`, svg)
        await writeFile(`.artifacts/exports/${template.id}-${theme}.html`, html)
      })
    }
  }
  it('creates independent editable drafts without mutating templates', () => {
    const draft = createDiagram(templates[0])
    draft.nodes[0]!.label = 'Changed'
    expect(templates[0]!.nodes[0]!.label).toBe('Users')
    expect(draft.id).not.toBe(templates[0]!.id)
    expect(createDiagram().nodes).toEqual([])
  })
  it('reflects all edits in the prompt', () => {
    const draft = createDiagram(templates[0])
    draft.nodes[0]!.label = 'Our customers'
    draft.nodes[0]!.x = 80
    draft.edges[0]!.label = 'Custom flow'
    draft.edges[0]!.dashed = true
    draft.groups[0]!.label = 'Custom boundary'
    draft.notes = 'Authentication required.'
    const prompt = buildPrompt(draft)
    for (const value of [
      'Our customers',
      '(80, 244)',
      'Custom flow',
      'dashed asynchronous',
      'Custom boundary',
      'Authentication required.',
    ])
      expect(prompt).toContain(value)
  })
  it('escapes user text in SVG and HTML', async () => {
    const d = createDiagram(templates[0])
    d.title = '</title><script>alert(1)</script>'
    d.nodes[0]!.label = '<img onerror="x">'
    const raw = renderDiagram(d)
    expect(raw).not.toContain('<script>')
    expect(raw).toContain('&lt;script&gt;')
    const html = await exportHtml(d)
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img ')
  })
  it('normalizes SVG viewport without stripping child rectangle sizes', () => {
    const markup = iconSvg('pi-desktop')
    expect(markup).toContain('viewBox=')
    expect(markup.match(/xmlns=/g)?.length).toBe(1)
  })
})
