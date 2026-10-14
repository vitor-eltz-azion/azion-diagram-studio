<script setup lang="ts">
import CommandMenu from '@aziontech/webkit/command-menu-root'
import CommandMenuInput from '@aziontech/webkit/command-menu-input'
import CommandMenuList from '@aziontech/webkit/command-menu-list'
import CommandMenuGroup from '@aziontech/webkit/command-menu-group'
import CommandMenuItem from '@aziontech/webkit/command-menu-item'
import CommandMenuEmpty from '@aziontech/webkit/command-menu-empty'
import type { NodeShape } from '~/data/types'
import { iconCatalog, iconLabel } from '~/data/icons'
// Searchable picker for adding a component (⌘K) or replacing a component's icon.
const props = defineProps<{ mode: 'add' | 'icon' }>()
const open = defineModel<boolean>('open', { required: true })
useReturnFocus(open)
const emit = defineEmits<{ shape: [shape: NodeShape]; icon: [name: string] }>()
const shapes: { value: NodeShape; label: string; icon: string }[] = [
  { value: 'rectangle', label: 'Rectangle', icon: 'pi pi-stop' },
  { value: 'ellipse', label: 'Ellipse', icon: 'pi pi-circle' },
  { value: 'diamond', label: 'Decision', icon: 'pi pi-sort' },
  { value: 'text', label: 'Text annotation', icon: 'pi pi-align-left' },
]
const families = [
  { heading: 'Azion products', items: iconCatalog.filter((i) => i.family === 'Azion') },
  { heading: 'Infrastructure', items: iconCatalog.filter((i) => i.family !== 'Azion') },
]
function select(_event: MouseEvent | KeyboardEvent, value: string | number) {
  const key = String(value)
  if (key.startsWith('shape:')) emit('shape', key.slice(6) as NodeShape)
  else emit('icon', key)
  open.value = false
}
</script>
<template>
  <CommandMenu v-model:open="open" @select="select">
    <CommandMenuInput
      :placeholder="props.mode === 'icon' ? 'Search icons' : 'Search components'"
      :aria-label="props.mode === 'icon' ? 'Search icons' : 'Search components'"
    />
    <CommandMenuList>
      <CommandMenuEmpty>No components match.</CommandMenuEmpty>
      <CommandMenuGroup v-if="props.mode === 'add'" heading="Shapes">
        <CommandMenuItem v-for="shape in shapes" :key="shape.value" :value="`shape:${shape.value}`">
          <template #prefix><i :class="shape.icon" aria-hidden="true" /></template>
          {{ shape.label }}
        </CommandMenuItem>
      </CommandMenuGroup>
      <CommandMenuGroup v-for="family in families" :key="family.heading" :heading="family.heading">
        <CommandMenuItem v-for="icon in family.items" :key="icon.name" :value="icon.name">
          <template #prefix><StudioIcon :name="icon.name" :size="18" /></template>
          {{ iconLabel(icon.name) }}
        </CommandMenuItem>
      </CommandMenuGroup>
    </CommandMenuList>
  </CommandMenu>
</template>
