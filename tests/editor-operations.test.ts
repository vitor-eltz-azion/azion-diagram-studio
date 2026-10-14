import { describe, it, expect } from 'vitest'
import { createDiagram, templates } from '../app/data/templates'
import {
  movingIds,
  translateSelection,
  resizeObject,
  nodeBounds,
  duplicateSelection,
  removeSelection,
  alignSelection,
  encloseSelection,
  autoLayout,
} from '../packages/diagram-cli/src/core/operations'
import { parseDiagram } from '../packages/diagram-cli/src/core/schema'
import { renderDiagram } from '../app/utils/diagram'
function fixture() {
  const d = createDiagram()
  d.canvasWidth = 1600
  d.canvasHeight = 1000
  d.nodes = [
    {
      id: 'a',
      label: 'Applications',
      subtitle: '',
      icon: 'ai-edge-application',
      x: 160,
      y: 200,
      tone: 'azion',
    },
    {
      id: 'b',
      label: 'Functions',
      subtitle: '',
      icon: 'ai-edge-functions',
      x: 400,
      y: 200,
      tone: 'azion',
    },
    { id: 'c', label: 'Origin', subtitle: '', icon: 'pi-server', x: 900, y: 280, tone: 'neutral' },
  ]
  d.groups = [{ id: 'outer', label: 'AZION', x: 120, y: 120, width: 640, height: 300 }]
  d.edges = [
    { id: 'ab', from: 'a', to: 'b', label: 'Invoke', dashed: false },
    { id: 'bc', from: 'b', to: 'c', label: 'HTTPS', dashed: false },
  ]
  return d
}
describe('editor transformations', () => {
  it('moves a boundary and contained nodes once, even when also selected', () => {
    const d = fixture()
    translateSelection(d, ['outer', 'a'], 32, 24)
    expect(d.groups[0]!.x).toBe(152)
    expect(d.nodes[0]!.x).toBe(192)
    expect(d.nodes[1]!.y).toBe(224)
    expect(d.nodes[2]!.x).toBe(900)
    expect(parseDiagram(d)).toBeTruthy()
  })
  it('respects locking, boundary membership toggles, and nested boundaries', () => {
    const d = fixture()
    d.nodes[0]!.locked = true
    d.groups.push({ id: 'inner', label: 'INNER', x: 140, y: 160, width: 440, height: 160 })
    expect([...movingIds(d, ['outer'])].sort()).toEqual(['b', 'inner', 'outer'])
    d.groups[0]!.moveChildren = false
    translateSelection(d, ['outer'], 24, 24)
    expect(d.nodes[1]!.x).toBe(400)
    expect(d.groups[1]!.x).toBe(140)
  })
  it('clamps a group as a unit and honors exact movement with snapping disabled', () => {
    const d = fixture()
    translateSelection(d, ['outer'], -1000, -1000)
    expect(d.groups[0]!.x).toBe(0)
    expect(d.groups[0]!.y).toBe(80)
    expect(d.nodes[0]!.x).toBe(40)
    translateSelection(d, ['a'], 1, 1, false)
    expect(d.nodes[0]!.x).toBe(41)
  })
  it('resizes corners within canvas, minimum sizes and schema limits', () => {
    const d = fixture()
    resizeObject(d, 'a', nodeBounds(d.nodes[0]!), 'nw', 1000, 1000)
    expect(nodeBounds(d.nodes[0]!)).toEqual({ x: 232, y: 248, width: 80, height: 48 })
    resizeObject(d, 'a', nodeBounds(d.nodes[0]!), 'se', 10000, 10000)
    expect(d.nodes[0]!.width).toBe(1200)
    expect(parseDiagram(d)).toBeTruthy()
  })
  it('duplicates a boundary without moving originals and remaps only internal connections', () => {
    const d = fixture(),
      before = JSON.parse(JSON.stringify(d))
    let i = 0
    const copies = duplicateSelection(d, ['outer'], () => `copy-${++i}`)
    expect(copies).toHaveLength(3)
    expect(d.nodes.slice(0, 3)).toEqual(before.nodes)
    expect(d.groups[0]).toEqual(before.groups[0])
    expect(d.edges).toHaveLength(3)
    expect(d.edges[2]!.from).not.toBe('a')
    expect(d.edges[2]!.to).not.toBe('b')
    expect(d.nodes[3]!.x).toBe(184)
    expect(parseDiagram(d)).toBeTruthy()
  })
  it('deleting a boundary keeps nodes; deleting a node removes incident edges', () => {
    const d = fixture()
    removeSelection(d, ['outer'])
    expect(d.nodes).toHaveLength(3)
    d.nodes[0]!.locked = true
    removeSelection(d, ['a', 'b'])
    expect(d.nodes.map((n) => n.id)).toEqual(['a', 'c'])
    expect(d.edges).toHaveLength(0)
  })
  it('aligns and distributes nodes and can enclose them with a boundary', () => {
    const d = fixture()
    alignSelection(d, ['a', 'b', 'c'], 'top')
    expect(d.nodes[2]!.y).toBe(200)
    alignSelection(d, ['a', 'b', 'c'], 'horizontal')
    expect(d.nodes[1]!.x).toBe(530)
    expect(encloseSelection(d, ['a', 'b', 'c'], 'wrapper')?.width).toBe(940)
    expect(parseDiagram(d)).toBeTruthy()
  })
  it('lays out variable sized nodes without overlap or overflowing the canvas', () => {
    const d = fixture()
    d.nodes[0]!.width = 700
    d.nodes[1]!.height = 240
    autoLayout(d)
    expect(d.nodes[2]!.x).toBeGreaterThan(d.nodes[1]!.x)
    expect(parseDiagram(d)).toBeTruthy()
  })
  it('renders shapes, connector styles, handles and an editable metadata round trip', () => {
    const d = fixture()
    d.nodes[0]!.shape = 'diamond'
    d.nodes[1]!.shape = 'ellipse'
    d.edges[0]!.routing = 'curved'
    d.edges[0]!.arrow = 'both'
    const svg = renderDiagram(d, { interactive: true, selected: ['outer', 'a'], metadata: true })
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.querySelectorAll('[data-resize-id]').length).toBe(8)
    expect(doc.querySelector('ellipse')).not.toBeNull()
    expect(svg).toContain('marker-start=')
    expect(svg).not.toMatch(/NaN|Infinity/)
    expect(
      parseDiagram(JSON.parse(doc.querySelector('metadata')!.textContent!)).nodes[0]!.shape
    ).toBe('diamond')
  })
  it('rejects invalid IDs, unknown icons, dangling edges and out-of-canvas objects', () => {
    for (const mutate of [
      (d: ReturnType<typeof fixture>) => (d.nodes[1]!.id = 'a'),
      (d: ReturnType<typeof fixture>) => (d.nodes[0]!.icon = 'ai-invented'),
      (d: ReturnType<typeof fixture>) => (d.edges[0]!.to = 'absent'),
      (d: ReturnType<typeof fixture>) => (d.nodes[0]!.y = 12),
    ]) {
      const d = fixture()
      mutate(d)
      expect(() => parseDiagram(d)).toThrow()
    }
    for (const t of templates) expect(parseDiagram(t)).toBeTruthy()
  })
})
