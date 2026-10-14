<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import { parseDiagram } from '../../packages/diagram-cli/src/core/schema'
withDefaults(defineProps<{ size?: 'medium' | 'large' }>(), { size: 'large' })
const studio = useStudio(),
  file = ref<HTMLInputElement>(),
  busy = ref(false)
async function importFile(event: Event) {
  const input = event.target as HTMLInputElement,
    selected = input.files?.[0]
  if (!selected) return
  busy.value = true
  try {
    if (selected.size > 5_000_000) throw new Error('Choose a diagram under 5 MB.')
    const content = await selected.text()
    let value: unknown
    if (content.trim().startsWith('<')) {
      const doc = new DOMParser().parseFromString(content, 'image/svg+xml')
      const model = doc.getElementById('azion-diagram-model')?.textContent
      if (!model)
        throw new Error(
          'This SVG has no Diagram Studio model. Import a JSON file or an SVG exported by Diagram Studio.'
        )
      value = JSON.parse(model)
    } else value = JSON.parse(content)
    const diagram = parseDiagram(value)
    diagram.id = crypto.randomUUID()
    diagram.updatedAt = new Date().toISOString()
    studio.draft(diagram)
    await navigateTo(`/editor/${diagram.id}`)
    studio.notify('Diagram imported. All objects are editable.')
  } catch (error) {
    studio.notify((error as Error).message, true)
  } finally {
    busy.value = false
    input.value = ''
  }
}
</script>
<template>
  <Button
    :label="busy ? 'Importing…' : 'Import diagram'"
    icon="pi pi-upload"
    kind="outlined"
    :size="size"
    :loading="busy"
    @click="file?.click()"
  /><input
    ref="file"
    type="file"
    accept=".json,.svg,application/json,image/svg+xml"
    aria-label="Import diagram file"
    class="sr-only"
    tabindex="-1"
    @change="importFile"
  />
</template>
