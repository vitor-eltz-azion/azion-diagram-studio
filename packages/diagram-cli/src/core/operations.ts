import type { Diagram, DiagramNode, DiagramGroup, Bounds } from './types.js'
export const nodeBounds = (n: DiagramNode): Bounds => ({
  x: n.x,
  y: n.y,
  width: n.width ?? 152,
  height: n.height ?? 96,
})
export const canvasSize = (d: Diagram) => ({
  width: d.canvasWidth ?? 1120,
  height: d.canvasHeight ?? 600,
})
export function contains(a: Bounds, b: Bounds) {
  return (
    b.x >= a.x && b.y >= a.y && b.x + b.width <= a.x + a.width && b.y + b.height <= a.y + a.height
  )
}
export function intersects(a: Bounds, b: Bounds) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
export function union(items: Bounds[]): Bounds | undefined {
  if (!items.length) return
  const x = Math.min(...items.map((n) => n.x)),
    y = Math.min(...items.map((n) => n.y))
  return {
    x,
    y,
    width: Math.max(...items.map((n) => n.x + n.width)) - x,
    height: Math.max(...items.map((n) => n.y + n.height)) - y,
  }
}
export function objects(d: Diagram) {
  return [...d.nodes.map((n) => ({ ...nodeBounds(n), id: n.id, locked: n.locked })), ...d.groups]
}
export function movingIds(d: Diagram, selected: string[]) {
  const ids = new Set(selected)
  for (const g of d.groups)
    if (ids.has(g.id) && !g.locked && g.moveChildren !== false) {
      for (const n of d.nodes) if (contains(g, nodeBounds(n))) ids.add(n.id)
      for (const child of d.groups) if (child.id !== g.id && contains(g, child)) ids.add(child.id)
    }
  return new Set(
    objects(d)
      .filter((n) => ids.has(n.id) && !n.locked)
      .map((n) => n.id)
  )
}
export function translateSelection(
  d: Diagram,
  selected: string[],
  dx: number,
  dy: number,
  snap = d.snap !== false
) {
  const ids = movingIds(d, selected),
    bounds = union(objects(d).filter((o) => ids.has(o.id)))
  if (!bounds) return
  const grid = d.gridSize ?? 8,
    canvas = canvasSize(d)
  if (snap) {
    dx = Math.round(dx / grid) * grid
    dy = Math.round(dy / grid) * grid
  }
  dx = Math.max(-bounds.x, Math.min(canvas.width - bounds.x - bounds.width, dx))
  dy = Math.max(80 - bounds.y, Math.min(canvas.height - 64 - bounds.y - bounds.height, dy))
  for (const o of [...d.nodes, ...d.groups])
    if (ids.has(o.id)) {
      o.x += dx
      o.y += dy
    }
}
export function resizeObject(
  d: Diagram,
  id: string,
  original: Bounds,
  handle: string,
  dx: number,
  dy: number,
  snap = d.snap !== false
) {
  const item = d.nodes.find((n) => n.id === id) || d.groups.find((g) => g.id === id)
  if (!item || item.locked) return
  const isGroup = d.groups.some((g) => g.id === id),
    minW = isGroup ? 168 : 80,
    minH = isGroup ? 144 : 48,
    c = canvasSize(d),
    grid = d.gridSize ?? 8
  if (snap) {
    dx = Math.round(dx / grid) * grid
    dy = Math.round(dy / grid) * grid
  }
  let left = original.x,
    top = original.y,
    right = left + original.width,
    bottom = top + original.height
  const maxW = isGroup ? 4096 : 1200,
    maxH = isGroup ? 4096 : 800
  if (handle.includes('e'))
    right = Math.min(c.width, left + maxW, Math.max(left + minW, right + dx))
  if (handle.includes('s'))
    bottom = Math.min(c.height - 64, top + maxH, Math.max(top + minH, bottom + dy))
  if (handle.includes('w')) left = Math.max(0, right - maxW, Math.min(right - minW, left + dx))
  if (handle.includes('n')) top = Math.max(80, bottom - maxH, Math.min(bottom - minH, top + dy))
  Object.assign(item, { x: left, y: top, width: right - left, height: bottom - top })
}
export function duplicateSelection(d: Diagram, selected: string[], newId: () => string) {
  const ids = movingIds(d, selected),
    map = new Map([...ids].map((id) => [id, newId()])),
    copies: string[] = []
  for (const list of [d.nodes, d.groups])
    for (const o of [...list])
      if (ids.has(o.id)) {
        const copy = { ...o, id: map.get(o.id)!, locked: false }
        ;(list as (DiagramNode | DiagramGroup)[]).push(copy)
        copies.push(copy.id)
      }
  for (const edge of [...d.edges])
    if (map.has(edge.from) && map.has(edge.to))
      d.edges.push({ ...edge, id: newId(), from: map.get(edge.from)!, to: map.get(edge.to)! })
  // Offset only the copies: resolving boundary membership again would include originals.
  const copied = [...d.nodes, ...d.groups].filter((o) => copies.includes(o.id))
  const bounds = union(objects(d).filter((o) => copies.includes(o.id)))
  if (bounds) {
    const c = canvasSize(d),
      dx = Math.min(24, c.width - bounds.x - bounds.width),
      dy = Math.min(24, c.height - 64 - bounds.y - bounds.height)
    for (const o of copied) {
      o.x += dx
      o.y += dy
    }
  }
  return copies
}
export function removeSelection(d: Diagram, selected: string[]) {
  const ids = new Set(selected),
    removed = new Set(d.nodes.filter((n) => ids.has(n.id) && !n.locked).map((n) => n.id))
  d.nodes = d.nodes.filter((n) => !removed.has(n.id))
  d.groups = d.groups.filter((g) => !ids.has(g.id) || g.locked)
  d.edges = d.edges.filter(
    (e) => !removed.has(e.from) && !removed.has(e.to) && (!ids.has(e.id) || e.locked)
  )
}
export type Align =
  'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'horizontal' | 'vertical'
export function alignSelection(d: Diagram, selected: string[], mode: Align) {
  const nodes = d.nodes.filter((n) => selected.includes(n.id) && !n.locked),
    bounds = union(nodes.map(nodeBounds))
  if (nodes.length < 2 || !bounds) return
  if (mode === 'horizontal' || mode === 'vertical') {
    if (nodes.length < 3) return
    const horizontal = mode === 'horizontal',
      axis = horizontal ? 'x' : 'y',
      size = horizontal ? 'width' : 'height'
    nodes.sort((a, b) => a[axis] - b[axis])
    const first = nodes[0]!,
      last = nodes[nodes.length - 1]!
    const gap =
      (last[axis] +
        nodeBounds(last)[size] -
        first[axis] -
        nodes.reduce((sum, n) => sum + nodeBounds(n)[size], 0)) /
      (nodes.length - 1)
    let cursor = first[axis]
    for (const n of nodes) {
      n[axis] = cursor
      cursor += nodeBounds(n)[size] + gap
    }
    return
  }
  for (const n of nodes) {
    const b = nodeBounds(n)
    if (mode === 'left') n.x = bounds.x
    if (mode === 'right') n.x = bounds.x + bounds.width - b.width
    if (mode === 'center') n.x = bounds.x + (bounds.width - b.width) / 2
    if (mode === 'top') n.y = bounds.y
    if (mode === 'bottom') n.y = bounds.y + bounds.height - b.height
    if (mode === 'middle') n.y = bounds.y + (bounds.height - b.height) / 2
  }
}
export function encloseSelection(d: Diagram, selected: string[], id: string) {
  const bounds = union(d.nodes.filter((n) => selected.includes(n.id)).map(nodeBounds))
  if (!bounds) return
  const c = canvasSize(d),
    x = Math.max(0, bounds.x - 24),
    y = Math.max(80, bounds.y - 48)
  const group = {
    id,
    label: 'NEW BOUNDARY',
    x,
    y,
    width: Math.min(c.width - x, Math.max(168, bounds.x + bounds.width + 24 - x)),
    height: Math.min(c.height - 64 - y, Math.max(144, bounds.y + bounds.height + 24 - y)),
    moveChildren: true,
  }
  d.groups.push(group)
  return group
}
export function autoLayout(d: Diagram) {
  const c = canvasSize(d),
    nodes = d.nodes.filter((n) => !n.locked)
  let x = 48,
    y = 144,
    rowHeight = 0
  for (const n of nodes) {
    const b = nodeBounds(n)
    if (b.width > c.width - 96)
      throw new Error('A component is too wide for automatic layout. Increase canvasWidth.')
    if (x + b.width > c.width - 48) {
      x = 48
      y += rowHeight + 64
      rowHeight = 0
    }
    n.x = x
    n.y = y
    x += b.width + 88
    rowHeight = Math.max(rowHeight, b.height)
  }
  const required = Math.max(480, ...d.nodes.map((n) => n.y + nodeBounds(n).height + 104))
  if (required > 4096)
    throw new Error('Too many nodes for automatic layout. Use multiple diagrams.')
  d.canvasHeight = Math.max(c.height, required)
}
