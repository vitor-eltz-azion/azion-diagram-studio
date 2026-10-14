<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import IconButton from '@aziontech/webkit/icon-button'
import InputText from '@aziontech/webkit/input-text'
import Tooltip from '@aziontech/webkit/tooltip'
import Divider from '@aziontech/webkit/divider'
import TabView from '@aziontech/webkit/tab-view'
import EmptyState from '@aziontech/webkit/empty-state'
import FieldSelect from '@aziontech/webkit/field-select'
import FieldSwitch from '@aziontech/webkit/field-switch'
import Item from '@aziontech/webkit/item'
import Kbd from '@aziontech/webkit/kbd'
import type { Diagram, NodeShape } from '~/data/types'
import { iconCatalog, iconLabel } from '~/data/icons'
import { nodeChoices } from '~/utils/choices'
import {
  translateSelection,
  duplicateSelection,
  removeSelection,
  alignSelection,
  encloseSelection,
  canvasSize,
  type Align,
} from '../../../packages/diagram-cli/src/core/operations'
definePageMeta({ layout: false })
const route = useRoute(),
  studio = useStudio()
const diagram = ref<Diagram | null>(null),
  loaded = ref(false),
  selection = ref<string[]>([]),
  tab = ref<string | number | null>('design'),
  zoom = ref(100),
  pan = reactive({ x: 0, y: 0 })
const tool = ref<'select' | 'pan' | 'connect'>('select'),
  connectSource = ref(''),
  showLibrary = ref(true),
  shortcutsOpen = ref(false)
const undoStack = ref<string[]>([]),
  redoStack = ref<string[]>([]),
  pickerOpen = ref(false),
  pickerMode = ref<'add' | 'icon'>('add'),
  librarySearch = ref('')
const connectOpen = ref(false),
  from = ref(''),
  to = ref(''),
  connectionLabel = ref(''),
  dashed = ref(false)
const size = computed(() =>
  diagram.value ? canvasSize(diagram.value) : { width: 1120, height: 600 }
)
const saved = computed(() => studio.state.value.diagrams.some((d) => d.id === route.params.id))
const origin = computed(() =>
  saved.value ? { label: 'My diagrams', href: '/diagrams' } : { label: 'Templates', href: '/' }
)
const crumbs = computed(() => [origin.value, { label: diagram.value?.title || 'Diagram' }])
const favorites = [
  'ai-edge-application',
  'ai-edge-functions',
  'ai-edge-firewall',
  'ai-edge-storage',
  'ai-edge-sql',
  'ai-edge-kv',
  'ai-data-stream',
  'ai-load-balancer',
  'pi-users',
  'pi-cloud',
  'pi-server',
]
const shapes: { value: NodeShape; label: string; icon: string }[] = [
  { value: 'rectangle', label: 'Rectangle', icon: 'pi pi-stop' },
  { value: 'ellipse', label: 'Ellipse', icon: 'pi pi-circle' },
  { value: 'diamond', label: 'Decision', icon: 'pi pi-sort' },
  { value: 'text', label: 'Text annotation', icon: 'pi pi-align-left' },
]
const library = computed(() =>
  iconCatalog.filter((i) =>
    librarySearch.value
      ? `${i.name} ${iconLabel(i.name)}`.toLowerCase().includes(librarySearch.value.toLowerCase())
      : favorites.includes(i.name)
  )
)
const fromPicks = computed(() => nodeChoices(diagram.value?.nodes ?? []))
const toPicks = computed(() =>
  nodeChoices(diagram.value?.nodes.filter((n) => n.id !== from.value) ?? [])
)
const tools = [
  { value: 'select', label: 'Select', key: 'V', icon: 'pi pi-arrow-up-left' },
  { value: 'pan', label: 'Pan', key: 'H', icon: 'pi pi-arrows-alt' },
  { value: 'connect', label: 'Connect', key: 'C', icon: 'pi pi-arrow-right' },
] as const
const hint = computed(() =>
  tool.value === 'connect'
    ? connectSource.value
      ? 'Click the destination component.'
      : 'Click a source component, or drag from it to the destination.'
    : tool.value === 'pan'
      ? 'Drag to pan the canvas.'
      : 'Shift-click or drag a box to select several objects.'
)
const shortcuts: { action: string; key: string; meta?: boolean; shift?: boolean; alt?: boolean }[] =
  [
    { action: 'Add component', key: 'K', meta: true },
    { action: 'Select tool', key: 'V' },
    { action: 'Pan tool', key: 'H' },
    { action: 'Connect tool', key: 'C' },
    { action: 'Duplicate', key: 'D', meta: true },
    { action: 'Select all components', key: 'A', meta: true },
    { action: 'Wrap in boundary', key: 'G', meta: true },
    { action: 'Undo', key: 'Z', meta: true },
    { action: 'Redo', key: 'Z', meta: true, shift: true },
    { action: 'Save', key: 'S', meta: true },
    { action: 'Move selection by one grid step', key: 'Arrow keys' },
    { action: 'Move selection by 1px', key: 'Arrow keys', alt: true },
    { action: 'Delete selection', key: 'Delete' },
    { action: 'Reset pan and zoom', key: '0' },
    { action: 'Show shortcuts', key: '?' },
  ]
let draftTimer: ReturnType<typeof setTimeout>,
  dragSnapshot = ''
const newId = () => `object-${crypto.randomUUID().slice(0, 8)}`
onMounted(() => {
  studio.init()
  const stored =
    studio.state.value.drafts.find((d) => d.id === route.params.id) ||
    studio.state.value.diagrams.find((d) => d.id === route.params.id)
  if (stored) diagram.value = JSON.parse(JSON.stringify(stored))
  if (matchMedia('(max-width: 1279px)').matches) showLibrary.value = false
  loaded.value = true
  document.addEventListener('keydown', keyboard)
})
watch(
  diagram,
  () => {
    clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      if (diagram.value) studio.draft(diagram.value)
    }, 400)
  },
  { deep: true }
)
onBeforeUnmount(() => {
  clearTimeout(draftTimer)
  if (diagram.value) studio.draft(diagram.value)
  document.removeEventListener('keydown', keyboard)
})
function remember(before: string) {
  if (diagram.value && before !== JSON.stringify(diagram.value)) {
    undoStack.value.push(before)
    if (undoStack.value.length > 100) undoStack.value.shift()
    redoStack.value = []
  }
}
function change(fn: (d: Diagram) => void) {
  if (!diagram.value) return
  const before = JSON.stringify(diagram.value)
  fn(diagram.value)
  remember(before)
}
function undo() {
  const previous = undoStack.value.pop()
  if (previous && diagram.value) {
    redoStack.value.push(JSON.stringify(diagram.value))
    diagram.value = JSON.parse(previous)
    selection.value = []
  }
}
function redo() {
  const next = redoStack.value.pop()
  if (next && diagram.value) {
    undoStack.value.push(JSON.stringify(diagram.value))
    diagram.value = JSON.parse(next)
    selection.value = []
  }
}
function select(ids: string[]) {
  selection.value = ids
  tab.value = 'design'
}
function dragStart() {
  dragSnapshot = JSON.stringify(diagram.value)
}
function dragEnd() {
  if (dragSnapshot) remember(dragSnapshot)
  dragSnapshot = ''
}
function addNode(icon: string, shape: NodeShape = 'card') {
  const id = newId()
  change((d) => {
    const c = canvasSize(d),
      i = d.nodes.length
    d.nodes.push({
      id,
      label:
        shape === 'text'
          ? 'Your annotation'
          : shape === 'diamond'
            ? 'Decision'
            : shape === 'ellipse'
              ? 'Event'
              : shape === 'rectangle'
                ? 'Process'
                : iconLabel(icon).slice(0, 60),
      subtitle: '',
      icon,
      x: Math.min(c.width - 176, Math.round((c.width / 2 - 76 + (i % 3) * 16) / 8) * 8),
      y: Math.min(c.height - 168, Math.round((c.height / 2 - 48 + (i % 3) * 16) / 8) * 8),
      tone: icon.startsWith('ai-') ? 'azion' : 'neutral',
      shape,
    })
  })
  select([id])
  tool.value = 'select'
}
function openPicker(mode: 'add' | 'icon') {
  pickerMode.value = mode
  pickerOpen.value = true
}
function pickIcon(name: string) {
  const id = selection.value[0]
  if (pickerMode.value === 'icon' && id)
    change((d) => {
      const node = d.nodes.find((n) => n.id === id)
      if (node) node.icon = name
    })
  else addNode(name)
}
function addGroup() {
  const id = newId()
  change((d) => {
    const c = canvasSize(d)
    d.groups.push({
      id,
      label: 'NEW BOUNDARY',
      x: 80,
      y: 104,
      width: Math.min(480, c.width - 160),
      height: Math.min(320, c.height - 184),
      moveChildren: true,
    })
  })
  select([id])
}
function enclose() {
  const id = newId()
  change((d) => encloseSelection(d, selection.value, id))
  select([id])
}
function duplicate() {
  let ids: string[] = []
  change((d) => {
    ids = duplicateSelection(d, selection.value, newId)
  })
  select(ids)
}
function remove() {
  change((d) => removeSelection(d, selection.value))
  selection.value = []
}
function lock() {
  change((d) => {
    const all = [...d.nodes, ...d.groups, ...d.edges].filter((o) => selection.value.includes(o.id))
    const shouldLock = all.some((o) => !o.locked)
    all.forEach((o) => (o.locked = shouldLock))
  })
}
function align(mode: Align) {
  change((d) => alignSelection(d, selection.value, mode))
}
function openConnection() {
  from.value =
    diagram.value?.nodes.find((n) => selection.value.includes(n.id))?.id ||
    diagram.value?.nodes[0]?.id ||
    ''
  to.value = diagram.value?.nodes.find((n) => n.id !== from.value)?.id || ''
  connectionLabel.value = ''
  dashed.value = false
  connectOpen.value = true
}
function addConnection() {
  if (!from.value || !to.value || from.value === to.value) return
  const id = newId()
  change((d) =>
    d.edges.push({
      id,
      from: from.value,
      to: to.value,
      label: connectionLabel.value,
      dashed: dashed.value,
      routing: 'orthogonal',
      arrow: 'end',
    })
  )
  connectOpen.value = false
  select([id])
}
function connectNode(id: string) {
  if (!connectSource.value) {
    connectSource.value = id
    select([id])
    return
  }
  if (connectSource.value === id) return
  from.value = connectSource.value
  to.value = id
  connectionLabel.value = ''
  dashed.value = false
  addConnection()
  connectSource.value = ''
  tool.value = 'select'
}
function fit() {
  zoom.value = 100
  pan.x = 0
  pan.y = 0
}
function wheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    zoom.value = Math.max(40, Math.min(240, zoom.value + (event.deltaY < 0 ? 10 : -10)))
  }
}
function setTool(next: typeof tool.value) {
  tool.value = next
  connectSource.value = ''
}
async function editLabel(id: string) {
  select([id])
  await nextTick()
  const field = document.getElementById('node-label') as HTMLInputElement | null
  field?.focus()
  field?.select()
}
// Webkit overlays teleport a role="dialog" to <body>, and its controls are ARIA widgets, so the
// checks look at roles as well as tags. Text entry owns every key; a composite widget (tabs,
// segmented buttons, switches, menus) owns only its own navigation keys.
const TEXT_ENTRY =
  'input,textarea,select,[contenteditable],[role="combobox"],[role="spinbutton"],[role="textbox"],[role="searchbox"]'
const WIDGET =
  '[role="tab"],[role="radio"],[role="switch"],[role="listbox"],[role="option"],[role="menuitem"],[role="slider"]'
const WIDGET_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' ']
function keyboard(e: KeyboardEvent) {
  if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
  const target = e.target instanceof Element ? e.target : null,
    modifier = e.metaKey || e.ctrlKey
  if (modifier && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (diagram.value) studio.save(diagram.value)
    return
  }
  if (target?.closest(TEXT_ENTRY)) return
  if (target?.closest(WIDGET) && WIDGET_KEYS.includes(e.key)) return
  if (modifier && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    e.shiftKey ? redo() : undo()
  } else if (modifier && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    redo()
  } else if (modifier && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    duplicate()
  } else if (modifier && e.key.toLowerCase() === 'a') {
    e.preventDefault()
    select([...(diagram.value?.nodes.map((n) => n.id) || [])])
  } else if (modifier && e.key.toLowerCase() === 'g') {
    e.preventDefault()
    enclose()
  } else if (modifier) return
  else if ((e.key === 'Delete' || e.key === 'Backspace') && selection.value.length) {
    e.preventDefault()
    remove()
  } else if (e.key === 'Escape') {
    selection.value = []
    setTool('select')
  } else if (e.key.toLowerCase() === 'v') setTool('select')
  else if (e.key.toLowerCase() === 'h') setTool('pan')
  else if (e.key.toLowerCase() === 'c') setTool('connect')
  else if (e.key === '?') shortcutsOpen.value = true
  else if (e.key === '0') fit()
  else if (
    selection.value.length &&
    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
  ) {
    e.preventDefault()
    const step = e.shiftKey ? 32 : e.altKey ? 1 : (diagram.value?.gridSize ?? 8)
    change((d) =>
      translateSelection(
        d,
        selection.value,
        e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0,
        e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0,
        false
      )
    )
  }
}
</script>
<template>
  <CreationShell
    v-if="diagram"
    :breadcrumb="crumbs"
    :back-label="`Back to ${origin.label}`"
    :back-href="origin.href"
  >
    <template #actions>
      <div class="hidden md:flex"><DiagramImport size="medium" /></div>
      <Button
        label="Save"
        kind="outlined"
        icon="pi pi-save"
        size="medium"
        @click="studio.save(diagram)"
      />
      <Button label="Export" icon="pi pi-download" size="medium" @click="tab = 'export'" />
    </template>
    <div class="editor-toolbar" role="toolbar" aria-label="Editor tools">
      <Tooltip text="Component library">
        <IconButton
          icon="pi pi-th-large"
          ariaLabel="Component library"
          :aria-pressed="showLibrary"
          :kind="showLibrary ? 'outlined' : 'transparent'"
          size="medium"
          @click="showLibrary = !showLibrary"
        />
      </Tooltip>
      <Divider orientation="vertical" />
      <Tooltip v-for="t in tools" :key="t.value" :text="`${t.label} (${t.key})`">
        <IconButton
          :icon="t.icon"
          :ariaLabel="`${t.label} tool`"
          :aria-pressed="tool === t.value"
          :kind="tool === t.value ? 'outlined' : 'transparent'"
          size="medium"
          @click="setTool(t.value)"
        />
      </Tooltip>
      <Divider orientation="vertical" />
      <Button label="Add boundary" icon="pi pi-stop" kind="text" size="medium" @click="addGroup" />
      <Tooltip text="Duplicate">
        <IconButton
          icon="pi pi-clone"
          ariaLabel="Duplicate selection"
          kind="transparent"
          size="medium"
          :disabled="!selection.length"
          @click="duplicate"
        />
      </Tooltip>
      <Tooltip text="Delete">
        <IconButton
          icon="pi pi-trash"
          ariaLabel="Delete selection"
          kind="transparent"
          size="medium"
          :disabled="!selection.length"
          @click="remove"
        />
      </Tooltip>
      <Divider orientation="vertical" />
      <Tooltip text="Undo">
        <IconButton
          icon="pi pi-undo"
          ariaLabel="Undo"
          kind="transparent"
          size="medium"
          :disabled="!undoStack.length"
          @click="undo"
        />
      </Tooltip>
      <Tooltip text="Redo">
        <IconButton
          icon="pi pi-refresh"
          ariaLabel="Redo"
          kind="transparent"
          size="medium"
          :disabled="!redoStack.length"
          @click="redo"
        />
      </Tooltip>
      <p class="editor-hint" aria-live="polite">{{ hint }}</p>
      <Tooltip text="Keyboard shortcuts">
        <IconButton
          icon="pi pi-question-circle"
          ariaLabel="Keyboard shortcuts"
          kind="transparent"
          size="medium"
          @click="shortcutsOpen = true"
        />
      </Tooltip>
    </div>
    <div class="editor-workspace" :data-library="showLibrary ? 'shown' : 'hidden'">
      <aside v-if="showLibrary" class="editor-library" aria-label="Component library">
        <InputText
          v-model="librarySearch"
          placeholder="Search components"
          aria-label="Search component library"
          size="medium"
          ><template #iconLeft><i class="pi pi-search" aria-hidden="true" /></template
        ></InputText>
        <section
          v-if="!librarySearch"
          class="flex flex-col gap-(--spacing-xs)"
          aria-labelledby="library-shapes"
        >
          <h2 id="library-shapes" class="text-label-sm text-(--text-muted)">Shapes</h2>
          <ul class="grid grid-cols-2 gap-(--spacing-xs)">
            <li v-for="shape in shapes" :key="shape.value" class="flex">
              <Item kind="outline" size="small" as-child>
                <button
                  type="button"
                  class="w-full text-left"
                  @click="addNode('pi-box', shape.value)"
                >
                  <Item.Media><i :class="shape.icon" aria-hidden="true" /></Item.Media>
                  <Item.Content
                    ><Item.Title>{{ shape.label }}</Item.Title></Item.Content
                  >
                </button>
              </Item>
            </li>
          </ul>
        </section>
        <section class="flex flex-col gap-(--spacing-xs)" aria-labelledby="library-components">
          <h2 id="library-components" class="text-label-sm text-(--text-muted)">
            {{ librarySearch ? 'Results' : 'Azion and infrastructure' }}
          </h2>
          <ul v-if="library.length" class="flex flex-col gap-(--spacing-xxs)">
            <li v-for="icon in library" :key="icon.name" class="flex">
              <Item size="small" as-child>
                <button type="button" class="w-full text-left" @click="addNode(icon.name)">
                  <Item.Media><StudioIcon :name="icon.name" :size="20" /></Item.Media>
                  <Item.Content
                    ><Item.Title>{{ iconLabel(icon.name) }}</Item.Title></Item.Content
                  >
                </button>
              </Item>
            </li>
          </ul>
          <p v-else class="text-body-sm text-(--text-muted)">No components match.</p>
        </section>
        <div>
          <Button
            label="All components"
            icon="pi pi-search"
            kind="outlined"
            size="small"
            @click="openPicker('add')"
          />
        </div>
      </aside>
      <section class="editor-canvas" aria-label="Diagram canvas">
        <div class="canvas-viewport" @wheel="wheel">
          <div
            class="canvas-paper"
            :style="{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom / 100})` }"
          >
            <DiagramCanvas
              :diagram="diagram"
              interactive
              :selected="selection"
              :pan-mode="tool === 'pan'"
              :connect-mode="tool === 'connect'"
              @selection="select"
              @drag-start="dragStart"
              @transform="diagram = $event"
              @drag-end="dragEnd"
              @pan="
                (dx, dy) => {
                  pan.x += dx
                  pan.y += dy
                }
              "
              @connect="connectNode"
              @edit-label="editLabel"
            />
          </div>
          <div v-if="!diagram.nodes.length" class="canvas-empty">
            <div class="canvas-empty-card">
              <EmptyState
                title="This canvas is empty"
                description="Add a component from the library, or import a diagram file."
                icon="pi pi-objects-column"
              >
                <template #actions>
                  <Button
                    label="Add component"
                    icon="pi pi-plus"
                    size="medium"
                    @click="openPicker('add')"
                  />
                </template>
              </EmptyState>
            </div>
          </div>
        </div>
        <div class="canvas-status">
          <p class="tabular-nums">
            {{
              selection.length
                ? `${selection.length} selected`
                : `${diagram.nodes.length} components`
            }}
            · {{ size.width }} × {{ size.height }} · Draft saved in this browser
          </p>
          <div class="flex items-center gap-(--spacing-xxs)">
            <Tooltip text="Zoom out">
              <IconButton
                icon="pi pi-minus"
                ariaLabel="Zoom out"
                kind="transparent"
                size="small"
                :disabled="zoom <= 40"
                @click="zoom -= 10"
              />
            </Tooltip>
            <output class="min-w-(--spacing-xl) text-center tabular-nums" aria-live="polite"
              >{{ zoom }}%</output
            >
            <Tooltip text="Zoom in">
              <IconButton
                icon="pi pi-plus"
                ariaLabel="Zoom in"
                kind="transparent"
                size="small"
                :disabled="zoom >= 240"
                @click="zoom += 10"
              />
            </Tooltip>
            <Tooltip text="Reset pan and zoom (0)">
              <IconButton
                icon="pi pi-expand"
                ariaLabel="Reset pan and zoom"
                kind="transparent"
                size="small"
                @click="fit"
              />
            </Tooltip>
          </div>
        </div>
        <section class="canvas-notes" aria-labelledby="notes-heading">
          <h2 id="notes-heading" class="text-label-sm text-(--text-muted)">Architecture notes</h2>
          <p class="text-body-sm text-pretty text-(--text-muted)">
            {{ diagram.notes || 'Add context and assumptions in the diagram properties.' }}
          </p>
        </section>
      </section>
      <aside class="editor-inspector" aria-label="Diagram settings">
        <TabView v-model:value="tab">
          <TabView.List aria-label="Editor panels">
            <TabView.Item value="design" label="Design" />
            <TabView.Item value="prompt" label="Prompt" />
            <TabView.Item value="export" label="Export" />
          </TabView.List>
          <TabView.Panel value="design">
            <EditorInspector
              :diagram="diagram"
              :selection="selection"
              @change="change"
              @select="select"
              @remove="remove"
              @duplicate="duplicate"
              @align="align"
              @enclose="enclose"
              @add="openPicker('add')"
              @change-icon="openPicker('icon')"
              @connect="openConnection"
              @lock="lock"
            />
          </TabView.Panel>
          <TabView.Panel value="prompt"><EditorPrompt :diagram="diagram" /></TabView.Panel>
          <TabView.Panel value="export"><EditorExport :diagram="diagram" /></TabView.Panel>
        </TabView>
      </aside>
    </div>
    <ComponentPicker
      v-model:open="pickerOpen"
      :mode="pickerMode"
      @shape="addNode('pi-box', $event)"
      @icon="pickIcon"
    />
    <StudioDialog v-model:open="connectOpen" title="Connect components">
      <FieldSelect
        label="From"
        input-id="connection-from"
        :options="fromPicks.options"
        :model-value="fromPicks.label(from)"
        @update:model-value="from = fromPicks.value($event) ?? ''"
      />
      <FieldSelect
        label="To"
        input-id="connection-to"
        :options="toPicks.options"
        :model-value="toPicks.label(to)"
        @update:model-value="to = toPicks.value($event) ?? ''"
      />
      <InspectorText
        id="connection-label"
        v-model="connectionLabel"
        label="Flow label"
        placeholder="HTTPS request"
        :max-length="60"
      />
      <FieldSwitch
        v-model="dashed"
        label="Asynchronous flow"
        description="Draws the connection as a dashed line."
      />
      <template #footer>
        <Button label="Cancel" kind="outlined" size="medium" @click="connectOpen = false" />
        <Button
          label="Add connection"
          size="medium"
          :disabled="!from || !to || from === to"
          @click="addConnection"
        />
      </template>
    </StudioDialog>
    <StudioDialog v-model:open="shortcutsOpen" title="Keyboard shortcuts" size="large">
      <ul class="grid gap-x-(--spacing-md) sm:grid-cols-2">
        <li v-for="s in shortcuts" :key="s.action + s.key + Boolean(s.shift) + Boolean(s.alt)">
          <Item size="small">
            <Item.Content
              ><Item.Title>{{ s.action }}</Item.Title></Item.Content
            >
            <Item.Actions>
              <Kbd :meta="s.meta" :shift="s.shift" :alt="s.alt" size="small">{{ s.key }}</Kbd>
            </Item.Actions>
          </Item>
        </li>
      </ul>
    </StudioDialog>
  </CreationShell>
  <CreationShell
    v-else-if="loaded"
    :breadcrumb="[{ label: 'Templates', href: '/' }, { label: 'Diagram not found' }]"
    back-label="Back to Templates"
    back-href="/"
  >
    <div class="layout-column-focused layout-boundary flex flex-col">
      <EmptyState
        title="This diagram isn't in this browser"
        description="Open it from My diagrams, import its file, or start from a template."
        icon="pi pi-folder-open"
      >
        <template #actions>
          <Button label="Browse templates" size="large" @click="navigateTo('/')" />
        </template>
      </EmptyState>
    </div>
  </CreationShell>
</template>
