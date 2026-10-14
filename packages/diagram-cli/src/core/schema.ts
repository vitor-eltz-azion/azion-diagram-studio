import { z } from 'zod'
import { iconCatalog } from './icons.js'
import type { Diagram } from './types.js'
const id = z
  .string()
  .regex(/^[A-Za-z0-9_-]{1,80}$/, 'Use 1–80 letters, digits, underscores, or hyphens')
const coordinate = z.number().finite().min(0).max(4096)
const tone = z.enum(['azion', 'neutral', 'accent'])
const iconNames = new Set(iconCatalog.map((i) => i.name))
export const diagramSchema = z.object({
  id: id.default('diagram'),
  title: z.string().min(1).max(80),
  description: z.string().max(180).default(''),
  category: z
    .enum(['Delivery', 'Compute', 'Storage', 'Security', 'Observability'])
    .default('Compute'),
  canvasWidth: z.number().int().min(640).max(4096).default(1120),
  canvasHeight: z.number().int().min(480).max(4096).default(600),
  theme: z.enum(['dark', 'light']).default('dark'),
  grid: z.boolean().default(true),
  numbered: z.boolean().default(false),
  snap: z.boolean().default(true),
  gridSize: z.number().int().min(4).max(64).default(8),
  notes: z.string().max(4000).default(''),
  updatedAt: z.string().default(''),
  nodes: z
    .array(
      z.object({
        id,
        label: z.string().max(60),
        subtitle: z.string().max(80).default(''),
        icon: z.string().default('pi-box'),
        x: coordinate,
        y: coordinate,
        width: z.number().min(80).max(1200).default(152),
        height: z.number().min(48).max(800).default(96),
        tone: tone.default('azion'),
        shape: z.enum(['card', 'rectangle', 'ellipse', 'diamond', 'text']).default('card'),
        locked: z.boolean().default(false),
      })
    )
    .max(300)
    .default([]),
  edges: z
    .array(
      z.object({
        id,
        from: id,
        to: id,
        label: z.string().max(60).default(''),
        dashed: z.boolean().default(false),
        routing: z.enum(['orthogonal', 'straight', 'curved']).default('orthogonal'),
        arrow: z.enum(['end', 'both', 'none']).default('end'),
        tone: tone.optional(),
        locked: z.boolean().default(false),
      })
    )
    .max(600)
    .default([]),
  groups: z
    .array(
      z.object({
        id,
        label: z.string().max(60),
        x: coordinate,
        y: coordinate,
        width: z.number().min(168).max(4096),
        height: z.number().min(144).max(4096),
        locked: z.boolean().default(false),
        moveChildren: z.boolean().default(true),
        tone: tone.default('neutral'),
      })
    )
    .max(100)
    .default([]),
})
export function parseDiagram(value: unknown): Diagram {
  const parsed = diagramSchema.safeParse(value)
  if (!parsed.success)
    throw new Error(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'))
  const d = parsed.data,
    errors: string[] = [],
    all = [...d.nodes, ...d.edges, ...d.groups]
  if (new Set(all.map((o) => o.id)).size !== all.length)
    errors.push('All node, edge, and boundary IDs must be unique.')
  for (const n of d.nodes)
    if (!iconNames.has(n.icon))
      errors.push(
        `nodes.${n.id}.icon: unknown icon "${n.icon}". Use the icons command to find valid names.`
      )
  for (const item of [...d.nodes, ...d.groups])
    if (
      item.x + item.width > d.canvasWidth ||
      item.y + item.height > d.canvasHeight - 64 ||
      item.y < 80
    )
      errors.push(
        `${item.id}: must fit inside the canvas content area (y ≥ 80; bottom ≤ height − 64).`
      )
  const ids = new Set(d.nodes.map((n) => n.id))
  for (const e of d.edges)
    if (!ids.has(e.from) || !ids.has(e.to) || e.from === e.to)
      errors.push(`${e.id}: connections require two distinct existing nodes.`)
  if (errors.length) throw new Error(errors.join('\n'))
  return d
}
