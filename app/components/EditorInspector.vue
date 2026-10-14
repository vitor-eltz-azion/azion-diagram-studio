<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import IconButton from '@aziontech/webkit/icon-button'
import FieldSelect from '@aziontech/webkit/field-select'
import FieldSwitch from '@aziontech/webkit/field-switch'
import Message from '@aziontech/webkit/message'
import Divider from '@aziontech/webkit/divider'
import Item from '@aziontech/webkit/item'
import { iconLabel } from '~/data/icons'
import { choices, nodeChoices } from '~/utils/choices'
import type { NumberField } from './InspectorNumbers.vue'
import type { Diagram, DiagramNode, DiagramEdge, DiagramGroup } from '~/data/types'
import {
  canvasSize,
  nodeBounds,
  translateSelection,
  type Align,
} from '../../packages/diagram-cli/src/core/operations'
const props = defineProps<{ diagram: Diagram; selection: string[] }>()
const emit = defineEmits<{
  change: [fn: (d: Diagram) => void]
  select: [ids: string[]]
  remove: []
  duplicate: []
  align: [mode: Align]
  enclose: []
  add: []
  changeIcon: []
  connect: []
  lock: []
}>()
const shapes = choices<DiagramNode['shape']>([
  { value: 'card', label: 'Service card' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'diamond', label: 'Decision' },
  { value: 'text', label: 'Text annotation' },
])
const tones = choices<DiagramNode['tone']>([
  { value: 'azion', label: 'Azion orange' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'accent', label: 'Violet' },
])
const routings = choices<DiagramEdge['routing']>([
  { value: 'orthogonal', label: 'Orthogonal' },
  { value: 'straight', label: 'Straight' },
  { value: 'curved', label: 'Curved' },
])
const arrows = choices<DiagramEdge['arrow']>([
  { value: 'end', label: 'End' },
  { value: 'both', label: 'Both ends' },
  { value: 'none', label: 'None' },
])
const themes = choices<Diagram['theme']>([
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
])
const gridSizes = choices([8, 16, 32].map((value) => ({ value, label: `${value}px` })))
const alignModes = [
  ['left', 'Left'],
  ['center', 'Center'],
  ['right', 'Right'],
  ['top', 'Top'],
  ['middle', 'Middle'],
  ['bottom', 'Bottom'],
] as const
const pick = (ids: string[]) => ids.length === 1
const node = computed(() =>
  pick(props.selection) ? props.diagram.nodes.find((n) => n.id === props.selection[0]) : undefined
)
const edge = computed(() =>
  pick(props.selection) ? props.diagram.edges.find((e) => e.id === props.selection[0]) : undefined
)
const group = computed(() =>
  pick(props.selection) ? props.diagram.groups.find((g) => g.id === props.selection[0]) : undefined
)
const count = computed(
  () => props.diagram.nodes.filter((n) => props.selection.includes(n.id)).length
)
const selectedObject = computed(() => node.value || edge.value || group.value)
const canvas = computed(() => canvasSize(props.diagram))
const nodes = computed(() => nodeChoices(props.diagram.nodes))
const fromChoices = computed(() =>
  nodeChoices(props.diagram.nodes.filter((n) => n.id !== edge.value?.to))
)
const toChoices = computed(() =>
  nodeChoices(props.diagram.nodes.filter((n) => n.id !== edge.value?.from))
)
const heading = computed(() =>
  props.selection.length > 1
    ? `${props.selection.length} selected`
    : node.value
      ? 'Component'
      : edge.value
        ? 'Connection'
        : 'Boundary'
)
function patchNode(p: Partial<DiagramNode>) {
  const id = node.value!.id
  emit('change', (d) =>
    Object.assign(
      d.nodes.find((n) => n.id === id)!,
      p
    )
  )
}
function patchEdge(p: Partial<DiagramEdge>) {
  const id = edge.value!.id
  emit('change', (d) =>
    Object.assign(
      d.edges.find((e) => e.id === id)!,
      p
    )
  )
}
function patchGroup(p: Partial<DiagramGroup>) {
  const id = group.value!.id
  emit('change', (d) => {
    const g = d.groups.find((n) => n.id === id)!
    if (p.x !== undefined || p.y !== undefined)
      translateSelection(d, [g.id], (p.x ?? g.x) - g.x, (p.y ?? g.y) - g.y, false)
    const { x: _x, y: _y, ...rest } = p
    Object.assign(g, rest)
  })
}
const nodeGeometry = computed<NumberField[]>(() => {
  const n = node.value
  if (!n) return []
  const b = nodeBounds(n)
  return [
    { key: 'x', label: 'X position', value: n.x, min: 0, max: canvas.value.width - b.width },
    {
      key: 'y',
      label: 'Y position',
      value: n.y,
      min: 80,
      max: canvas.value.height - b.height - 64,
    },
    {
      key: 'width',
      label: 'Width',
      value: n.width || 152,
      min: 80,
      max: Math.min(1200, canvas.value.width - n.x),
    },
    {
      key: 'height',
      label: 'Height',
      value: n.height || 96,
      min: 48,
      max: Math.min(800, canvas.value.height - n.y - 64),
    },
  ]
})
const groupGeometry = computed<NumberField[]>(() => {
  const g = group.value
  if (!g) return []
  return [
    { key: 'x', label: 'X position', value: g.x, min: 0, max: canvas.value.width - g.width },
    {
      key: 'y',
      label: 'Y position',
      value: g.y,
      min: 80,
      max: canvas.value.height - g.height - 64,
    },
    { key: 'width', label: 'Width', value: g.width, min: 168, max: canvas.value.width - g.x },
    {
      key: 'height',
      label: 'Height',
      value: g.height,
      min: 144,
      max: canvas.value.height - g.y - 64,
    },
  ]
})
const canvasGeometry = computed<NumberField[]>(() => [
  { key: 'width', label: 'Width', value: canvas.value.width, min: 640, max: 4096 },
  { key: 'height', label: 'Height', value: canvas.value.height, min: 480, max: 4096 },
])
function resizeCanvas(width: number, height: number) {
  const minW = Math.max(
    640,
    ...props.diagram.nodes.map((n) => n.x + nodeBounds(n).width),
    ...props.diagram.groups.map((g) => g.x + g.width)
  )
  const minH = Math.max(
    480,
    ...props.diagram.nodes.map((n) => n.y + nodeBounds(n).height + 64),
    ...props.diagram.groups.map((g) => g.y + g.height + 64)
  )
  emit('change', (d) => {
    d.canvasWidth = Math.max(minW, width)
    d.canvasHeight = Math.max(minH, height)
  })
}
function toggleSelect(event: MouseEvent, id: string) {
  emit('select', event.shiftKey ? [...new Set([...props.selection, id])] : [id])
}
</script>
<template>
  <div class="flex flex-col gap-(--spacing-lg) p-(--spacing-md)">
    <section
      v-if="selection.length"
      class="flex flex-col gap-(--spacing-md)"
      aria-labelledby="inspector-heading"
    >
      <div class="flex items-center justify-between gap-(--spacing-sm)">
        <h2 id="inspector-heading" class="text-heading-xs text-(--text-default)">{{ heading }}</h2>
        <IconButton
          icon="pi pi-times"
          ariaLabel="Clear selection"
          kind="transparent"
          size="small"
          @click="emit('select', [])"
        />
      </div>
      <Message
        v-if="selectedObject?.locked"
        severity="info"
        size="small"
        label="Locked objects keep their position and properties. Unlock to edit."
      />
      <template v-if="selection.length > 1">
        <p class="text-body-sm text-pretty text-(--text-muted)">
          Drag any selected component to move the set. Locked objects stay in place.
        </p>
        <fieldset class="flex flex-col gap-(--spacing-xs)" :disabled="count < 2">
          <legend class="mb-(--spacing-xs) text-label-sm text-(--text-default)">Align</legend>
          <div class="grid grid-cols-3 gap-(--spacing-xs)">
            <Button
              v-for="[mode, label] in alignModes"
              :key="mode"
              :label="label"
              kind="outlined"
              size="small"
              :disabled="count < 2"
              @click="emit('align', mode)"
            />
          </div>
        </fieldset>
        <fieldset class="flex flex-col gap-(--spacing-xs)" :disabled="count < 3">
          <legend class="mb-(--spacing-xs) text-label-sm text-(--text-default)">Distribute</legend>
          <div class="grid grid-cols-2 gap-(--spacing-xs)">
            <Button
              label="Horizontally"
              kind="outlined"
              size="small"
              :disabled="count < 3"
              @click="emit('align', 'horizontal')"
            />
            <Button
              label="Vertically"
              kind="outlined"
              size="small"
              :disabled="count < 3"
              @click="emit('align', 'vertical')"
            />
          </div>
        </fieldset>
        <Button
          label="Wrap in boundary"
          icon="pi pi-stop"
          kind="outlined"
          size="small"
          :disabled="count < 1"
          @click="emit('enclose')"
        />
      </template>
      <template v-else-if="node">
        <div class="flex items-center gap-(--spacing-sm)">
          <StudioIcon :name="node.icon" :size="28" />
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-label-sm text-(--text-default)">{{
              iconLabel(node.icon)
            }}</span>
            <code class="truncate text-body-xs text-(--text-muted)">{{ node.icon }}</code>
          </div>
          <Button
            label="Change icon"
            kind="outlined"
            size="small"
            :disabled="node.locked"
            @click="emit('changeIcon')"
          />
        </div>
        <fieldset :key="node.id" class="flex flex-col gap-(--spacing-md)" :disabled="node.locked">
          <legend class="sr-only">Component properties</legend>
          <InspectorText
            id="node-label"
            label="Label"
            :model-value="node.label"
            :max-length="60"
            :disabled="node.locked"
            @update:model-value="patchNode({ label: $event })"
          />
          <InspectorText
            id="node-subtitle"
            label="Description"
            :model-value="node.subtitle"
            :max-length="80"
            :disabled="node.locked"
            @update:model-value="patchNode({ subtitle: $event })"
          />
          <FieldSelect
            label="Shape"
            input-id="node-shape"
            :options="shapes.options"
            :model-value="shapes.label(node.shape || 'card')"
            :disabled="node.locked"
            @update:model-value="patchNode({ shape: shapes.value($event) })"
          />
          <FieldSelect
            label="Accent"
            input-id="node-tone"
            :options="tones.options"
            :model-value="tones.label(node.tone)"
            :disabled="node.locked"
            @update:model-value="patchNode({ tone: tones.value($event) })"
          />
        </fieldset>
        <InspectorNumbers
          title="Position and size"
          :fields="nodeGeometry"
          :disabled="node.locked"
          @commit="(key, value) => patchNode({ [key]: value })"
        />
      </template>
      <fieldset
        v-else-if="edge"
        :key="edge.id"
        class="flex flex-col gap-(--spacing-md)"
        :disabled="edge.locked"
      >
        <legend class="sr-only">Connection properties</legend>
        <InspectorText
          id="edge-label"
          label="Flow label"
          :model-value="edge.label"
          :max-length="60"
          :disabled="edge.locked"
          @update:model-value="patchEdge({ label: $event })"
        />
        <FieldSelect
          label="From"
          input-id="edge-from"
          :options="fromChoices.options"
          :model-value="nodes.label(edge.from)"
          :disabled="edge.locked"
          @update:model-value="patchEdge({ from: fromChoices.value($event) })"
        />
        <FieldSelect
          label="To"
          input-id="edge-to"
          :options="toChoices.options"
          :model-value="nodes.label(edge.to)"
          :disabled="edge.locked"
          @update:model-value="patchEdge({ to: toChoices.value($event) })"
        />
        <FieldSelect
          label="Connector style"
          input-id="edge-routing"
          :options="routings.options"
          :model-value="routings.label(edge.routing || 'orthogonal')"
          :disabled="edge.locked"
          @update:model-value="patchEdge({ routing: routings.value($event) })"
        />
        <FieldSelect
          label="Arrowheads"
          input-id="edge-arrow"
          :options="arrows.options"
          :model-value="arrows.label(edge.arrow || 'end')"
          :disabled="edge.locked"
          @update:model-value="patchEdge({ arrow: arrows.value($event) })"
        />
        <FieldSwitch
          label="Asynchronous flow"
          description="Draws the connection as a dashed line."
          :model-value="edge.dashed"
          :disabled="edge.locked"
          @update:model-value="patchEdge({ dashed: $event })"
        />
      </fieldset>
      <template v-else-if="group">
        <p class="text-body-sm text-pretty text-(--text-muted)">
          Drag the boundary label to move it. Drag a corner to resize it.
        </p>
        <fieldset :key="group.id" class="flex flex-col gap-(--spacing-md)" :disabled="group.locked">
          <legend class="sr-only">Boundary properties</legend>
          <InspectorText
            id="group-label"
            label="Label"
            :model-value="group.label"
            :max-length="60"
            :disabled="group.locked"
            @update:model-value="patchGroup({ label: $event })"
          />
          <FieldSwitch
            label="Move enclosed objects"
            description="Objects inside the boundary move with it."
            :model-value="group.moveChildren !== false"
            :disabled="group.locked"
            @update:model-value="patchGroup({ moveChildren: $event })"
          />
        </fieldset>
        <InspectorNumbers
          title="Position and size"
          :fields="groupGeometry"
          :disabled="group.locked"
          @commit="(key, value) => patchGroup({ [key]: value })"
        />
      </template>
      <div class="flex flex-wrap items-center gap-(--spacing-xs)">
        <Button
          :label="selectedObject?.locked ? 'Unlock' : 'Lock'"
          :icon="selectedObject?.locked ? 'pi pi-lock-open' : 'pi pi-lock'"
          kind="outlined"
          size="small"
          @click="emit('lock')"
        />
        <Button
          label="Duplicate"
          icon="pi pi-clone"
          kind="outlined"
          size="small"
          @click="emit('duplicate')"
        />
        <Button
          v-if="node && diagram.nodes.length > 1"
          label="Connect"
          icon="pi pi-arrow-right"
          kind="outlined"
          size="small"
          @click="emit('connect')"
        />
        <IconButton
          icon="pi pi-trash"
          ariaLabel="Delete selection"
          kind="transparent"
          size="small"
          @click="emit('remove')"
        />
      </div>
    </section>
    <section v-else class="flex flex-col gap-(--spacing-md)" aria-labelledby="diagram-heading">
      <h2 id="diagram-heading" class="text-heading-xs text-(--text-default)">Diagram</h2>
      <InspectorText
        id="diagram-title"
        label="Name"
        :model-value="diagram.title"
        :max-length="80"
        @update:model-value="emit('change', (d) => (d.title = $event))"
      />
      <InspectorText
        id="diagram-description"
        multiline
        label="Description"
        :model-value="diagram.description"
        :max-length="180"
        @update:model-value="emit('change', (d) => (d.description = $event))"
      />
      <InspectorText
        id="diagram-notes"
        multiline
        label="Architecture notes"
        :model-value="diagram.notes"
        :max-length="4000"
        @update:model-value="emit('change', (d) => (d.notes = $event))"
      />
      <FieldSelect
        label="Canvas theme"
        input-id="diagram-theme"
        :options="themes.options"
        :model-value="themes.label(diagram.theme)"
        @update:model-value="emit('change', (d) => (d.theme = themes.value($event) ?? d.theme))"
      />
      <InspectorNumbers
        title="Canvas size"
        :fields="canvasGeometry"
        @commit="
          (key, value) =>
            key === 'width' ? resizeCanvas(value, canvas.height) : resizeCanvas(canvas.width, value)
        "
      />
      <FieldSwitch
        label="Dot grid"
        :model-value="diagram.grid"
        @update:model-value="emit('change', (d) => (d.grid = $event))"
      />
      <FieldSwitch
        label="Snap to grid"
        :model-value="diagram.snap !== false"
        @update:model-value="emit('change', (d) => (d.snap = $event))"
      />
      <FieldSelect
        label="Grid spacing"
        input-id="grid-size"
        :options="gridSizes.options"
        :model-value="gridSizes.label(diagram.gridSize || 8)"
        @update:model-value="emit('change', (d) => (d.gridSize = gridSizes.value($event) ?? 8))"
      />
      <FieldSwitch
        label="Numbered flows"
        description="Numbers each connection in drawing order."
        :model-value="diagram.numbered"
        @update:model-value="emit('change', (d) => (d.numbered = $event))"
      />
    </section>
    <Divider />
    <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="objects-heading">
      <div class="flex items-center justify-between gap-(--spacing-sm)">
        <h2 id="objects-heading" class="text-heading-xs text-(--text-default)">Objects</h2>
        <span class="text-body-xs text-(--text-muted) tabular-nums">
          {{ diagram.nodes.length + diagram.groups.length }}
        </span>
      </div>
      <ul class="flex flex-col gap-(--spacing-xxs)">
        <li v-for="g in diagram.groups" :key="g.id" class="flex">
          <Item :kind="selection.includes(g.id) ? 'muted' : 'default'" size="small" as-child>
            <button
              type="button"
              class="w-full text-left"
              :aria-pressed="selection.includes(g.id)"
              @click="toggleSelect($event, g.id)"
            >
              <Item.Media><i class="pi pi-stop" aria-hidden="true" /></Item.Media>
              <Item.Content
                ><Item.Title>{{ g.label }}</Item.Title></Item.Content
              >
              <Item.Actions v-if="g.locked"
                ><i class="pi pi-lock" aria-label="Locked"
              /></Item.Actions>
            </button>
          </Item>
        </li>
        <li v-for="n in diagram.nodes" :key="n.id" class="flex">
          <Item :kind="selection.includes(n.id) ? 'muted' : 'default'" size="small" as-child>
            <button
              type="button"
              class="w-full text-left"
              :aria-pressed="selection.includes(n.id)"
              @click="toggleSelect($event, n.id)"
            >
              <Item.Media><StudioIcon :name="n.icon" :size="16" /></Item.Media>
              <Item.Content
                ><Item.Title>{{ n.label }}</Item.Title></Item.Content
              >
              <Item.Actions v-if="n.locked"
                ><i class="pi pi-lock" aria-label="Locked"
              /></Item.Actions>
            </button>
          </Item>
        </li>
      </ul>
      <div>
        <Button
          label="Add component"
          icon="pi pi-plus"
          kind="text"
          size="small"
          @click="emit('add')"
        />
      </div>
    </section>
    <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="connections-heading">
      <div class="flex items-center justify-between gap-(--spacing-sm)">
        <h2 id="connections-heading" class="text-heading-xs text-(--text-default)">Connections</h2>
        <span class="text-body-xs text-(--text-muted) tabular-nums">{{
          diagram.edges.length
        }}</span>
      </div>
      <ul v-if="diagram.edges.length" class="flex flex-col gap-(--spacing-xxs)">
        <li v-for="e in diagram.edges" :key="e.id" class="flex">
          <Item :kind="selection.includes(e.id) ? 'muted' : 'default'" size="small" as-child>
            <button
              type="button"
              class="w-full text-left"
              :aria-pressed="selection.includes(e.id)"
              @click="emit('select', [e.id])"
            >
              <Item.Media><i class="pi pi-arrow-right" aria-hidden="true" /></Item.Media>
              <Item.Content
                ><Item.Title>{{ e.label || 'Unlabeled flow' }}</Item.Title></Item.Content
              >
            </button>
          </Item>
        </li>
      </ul>
      <p v-else class="text-body-sm text-(--text-muted)">
        Select a component and choose Connect to link it to another.
      </p>
    </section>
  </div>
</template>
