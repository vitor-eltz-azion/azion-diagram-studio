export type Category = 'Delivery' | 'Compute' | 'Storage' | 'Security' | 'Observability'
export type NodeTone = 'azion' | 'neutral' | 'accent'
export type NodeShape = 'card' | 'rectangle' | 'ellipse' | 'diamond' | 'text'
export interface DiagramNode {
  id: string
  label: string
  subtitle: string
  icon: string
  x: number
  y: number
  tone: NodeTone
  width?: number
  height?: number
  shape?: NodeShape
  locked?: boolean
}
export interface DiagramEdge {
  id: string
  from: string
  to: string
  label: string
  dashed: boolean
  routing?: 'orthogonal' | 'straight' | 'curved'
  arrow?: 'end' | 'both' | 'none'
  tone?: NodeTone
  locked?: boolean
}
export interface DiagramGroup {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  locked?: boolean
  moveChildren?: boolean
  tone?: NodeTone
}
export interface Diagram {
  id: string
  title: string
  description: string
  category: Category
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  groups: DiagramGroup[]
  theme: 'dark' | 'light'
  grid: boolean
  numbered: boolean
  notes: string
  updatedAt: string
  canvasWidth?: number
  canvasHeight?: number
  snap?: boolean
  gridSize?: number
}
export interface DiagramTemplate extends Diagram {
  difficulty: 'Starter' | 'Intermediate'
  featured?: boolean
}
export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}
