<script setup lang="ts">
import { renderDiagram, colors } from '~/utils/diagram'
import {
  nodeBounds,
  objects,
  intersects,
  translateSelection,
  resizeObject,
} from '../../packages/diagram-cli/src/core/operations'
import type { Diagram, Bounds } from '~/data/types'
const props = withDefaults(
  defineProps<{
    diagram: Diagram
    interactive?: boolean
    selected?: string | string[]
    chrome?: boolean
    panMode?: boolean
    connectMode?: boolean
  }>(),
  { chrome: true, interactive: false }
)
const emit = defineEmits<{
  selection: [ids: string[]]
  dragStart: []
  transform: [diagram: Diagram]
  dragEnd: []
  pan: [dx: number, dy: number]
  connect: [id: string]
  editLabel: [id: string]
}>()
const namespace = useId(),
  host = ref<HTMLElement>(),
  marquee = ref<Bounds | null>(null),
  space = ref(false)
const ids = computed(() =>
  Array.isArray(props.selected) ? props.selected : props.selected ? [props.selected] : []
)
const markup = computed(() => {
  let svg = renderDiagram(props.diagram, {
    namespace,
    selected: ids.value,
    interactive: props.interactive,
    chrome: props.chrome,
  })
  if (marquee.value) {
    const b = marquee.value,
      { orange } = colors(props.diagram.theme)
    svg = svg.replace(
      /<\/svg>$/,
      `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="${orange}" fill-opacity=".08" stroke="${orange}" stroke-dasharray="4 3" pointer-events="none"/></svg>`
    )
  }
  return svg
})
type Gesture = {
  kind: 'move' | 'resize' | 'marquee' | 'pan'
  snapshot: Diagram
  ids: string[]
  x: number
  y: number
  clientX: number
  clientY: number
  id?: string
  handle?: string
  bounds?: Bounds
  additive?: boolean
  lastX: number
  lastY: number
}
let gesture: Gesture | null = null,
  connectFrom = ''
function point(event: PointerEvent) {
  const svg = host.value!.querySelector('svg')!,
    p = svg.createSVGPoint()
  p.x = event.clientX
  p.y = event.clientY
  return p.matrixTransform(svg.getScreenCTM()!.inverse())
}
function down(event: PointerEvent) {
  if (!props.interactive || ![0, 1].includes(event.button)) return
  // pointerdown is prevented below, so focus would stay on the last control outside the
  // canvas (a tab, a field) and swallow the editor's keyboard shortcuts.
  const active = document.activeElement
  if (active instanceof HTMLElement && !host.value!.contains(active)) active.blur()
  const p = point(event),
    target = event.target as Element,
    el = target.closest('[data-node-id],[data-group-id],[data-edge-id]'),
    resize = target.closest('[data-resize-id]')
  const id =
    el?.getAttribute('data-node-id') ||
    el?.getAttribute('data-group-id') ||
    el?.getAttribute('data-edge-id') ||
    ''
  const pan = props.panMode || space.value || event.button === 1
  // Connect mode never selects or moves: a node press picks an end, anything else is ignored.
  if (props.connectMode && !pan) {
    if (el?.hasAttribute('data-node-id')) {
      connectFrom = id
      emit('connect', id)
    }
    event.preventDefault()
    return
  }
  let selected = [...ids.value]
  if (!pan && !resize && id) {
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      emit(
        'selection',
        selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
      )
      return
    }
    if (!selected.includes(id)) selected = [id]
    emit('selection', selected)
    const item = [...props.diagram.nodes, ...props.diagram.groups, ...props.diagram.edges].find(
      (o) => o.id === id
    )
    if (item?.locked || el?.hasAttribute('data-edge-id')) return
  }
  if (!pan && !resize && !id && !event.shiftKey) emit('selection', [])
  const resizeId = resize?.getAttribute('data-resize-id'),
    object = resizeId ? objects(props.diagram).find((o) => o.id === resizeId) : undefined
  gesture = {
    kind: pan ? 'pan' : resize ? 'resize' : id ? 'move' : 'marquee',
    snapshot: JSON.parse(JSON.stringify(props.diagram)),
    ids: selected,
    x: p.x,
    y: p.y,
    clientX: event.clientX,
    clientY: event.clientY,
    lastX: event.clientX,
    lastY: event.clientY,
    id: resizeId || id,
    handle: resize?.getAttribute('data-handle') || undefined,
    bounds: object,
    additive: event.shiftKey,
  }
  if (gesture.kind === 'move' || gesture.kind === 'resize') emit('dragStart')
  host.value!.setPointerCapture(event.pointerId)
  event.preventDefault()
}
function move(event: PointerEvent) {
  if (!gesture) return
  if (gesture.kind === 'pan') {
    emit('pan', event.clientX - gesture.lastX, event.clientY - gesture.lastY)
    gesture.lastX = event.clientX
    gesture.lastY = event.clientY
    return
  }
  const p = point(event),
    dx = p.x - gesture.x,
    dy = p.y - gesture.y
  if (gesture.kind === 'marquee') {
    marquee.value = {
      x: Math.min(p.x, gesture.x),
      y: Math.min(p.y, gesture.y),
      width: Math.abs(dx),
      height: Math.abs(dy),
    }
    return
  }
  const next = JSON.parse(JSON.stringify(gesture.snapshot)) as Diagram
  if (gesture.kind === 'move')
    translateSelection(next, gesture.ids, dx, dy, !event.altKey && next.snap !== false)
  if (gesture.kind === 'resize' && gesture.bounds)
    resizeObject(
      next,
      gesture.id!,
      gesture.bounds,
      gesture.handle!,
      dx,
      dy,
      !event.altKey && next.snap !== false
    )
  emit('transform', next)
}
function up(event: PointerEvent) {
  if (connectFrom) {
    // Releasing over a different node completes a press-and-drag connection.
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest('[data-node-id]')
      ?.getAttribute('data-node-id')
    if (props.connectMode && target && target !== connectFrom) emit('connect', target)
    connectFrom = ''
  }
  if (!gesture) return
  if (gesture.kind === 'marquee' && marquee.value) {
    const hits = objects(props.diagram)
      .filter((o) => intersects(marquee.value!, o))
      .map((o) => o.id)
    emit('selection', [...new Set([...(gesture.additive ? gesture.ids : []), ...hits])])
  }
  if (gesture.kind === 'move' || gesture.kind === 'resize') emit('dragEnd')
  gesture = null
  marquee.value = null
}
function cancel() {
  connectFrom = ''
  if (gesture?.kind === 'move' || gesture?.kind === 'resize') {
    emit('transform', gesture.snapshot)
    emit('dragEnd')
  }
  gesture = null
  marquee.value = null
}
function key(event: KeyboardEvent) {
  if (!props.interactive) return
  const el = (event.target as Element).closest('[data-node-id],[data-group-id],[data-edge-id]')
  const id =
    el?.getAttribute('data-node-id') ||
    el?.getAttribute('data-group-id') ||
    el?.getAttribute('data-edge-id')
  if (id && event.key === 'Enter') {
    emit('selection', [id])
    event.preventDefault()
  }
}
function spaceDown(e: KeyboardEvent) {
  if (
    props.interactive &&
    e.code === 'Space' &&
    !(e.target as Element).closest('input,textarea,select,button,a,[contenteditable]')
  ) {
    space.value = true
    e.preventDefault()
  }
}
function spaceUp() {
  space.value = false
}
function doubleClick(event: MouseEvent) {
  if (!props.interactive) return
  const id = (event.target as Element).closest('[data-node-id]')?.getAttribute('data-node-id')
  if (id) emit('editLabel', id)
}
onMounted(() => {
  document.addEventListener('keydown', spaceDown)
  document.addEventListener('keyup', spaceUp)
  window.addEventListener('blur', spaceUp)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', spaceDown)
  document.removeEventListener('keyup', spaceUp)
  window.removeEventListener('blur', spaceUp)
})
</script>
<template>
  <div
    ref="host"
    class="diagram-canvas"
    :class="{ interactive, 'pan-mode': panMode || space, 'connect-mode': connectMode }"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="cancel"
    @keydown="key"
    @dblclick="doubleClick"
    v-html="markup"
  />
</template>
