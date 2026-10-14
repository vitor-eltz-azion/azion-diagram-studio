<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import SegmentedButton from '@aziontech/webkit/segmented-button'
import FieldSelect from '@aziontech/webkit/field-select'
import Message from '@aziontech/webkit/message'
import type { Diagram } from '~/data/types'
import { choices } from '~/utils/choices'
import { canvasSize } from '../../packages/diagram-cli/src/core/operations'
import {
  copyText,
  copyPng,
  exportSvg,
  exportHtml,
  exportPng,
  download,
  filename,
} from '~/utils/export'
type Format = 'svg' | 'png' | 'html' | 'json'
const props = defineProps<{ diagram: Diagram }>()
const studio = useStudio()
const format = ref<Format>('svg'),
  scale = ref(2),
  busy = ref<'' | 'download' | 'copy'>('')
const formats = (['svg', 'png', 'html', 'json'] as const).map((value) => ({
  value,
  label: value.toUpperCase(),
}))
const descriptions: Record<Format, string> = {
  svg: 'Portable vector artwork with an embedded editable model.',
  png: 'High-resolution image for documentation and presentations.',
  html: 'A standalone page with all artwork included.',
  json: 'Editable source. Import it here or use it with the CLI.',
}
const size = computed(() => canvasSize(props.diagram))
const scales = computed(() =>
  choices(
    [1, 2, 3].map((s) => ({
      value: s,
      label: `${s}× · ${size.value.width * s} × ${size.value.height * s}`,
    }))
  )
)
const name = computed(() => format.value.toUpperCase())
async function output(copy: boolean) {
  if (busy.value) return
  busy.value = copy ? 'copy' : 'download'
  try {
    const d = JSON.parse(JSON.stringify(props.diagram)) as Diagram
    if (copy && format.value === 'png') await copyPng(d, scale.value)
    else {
      const value =
        format.value === 'json'
          ? JSON.stringify(d, null, 2)
          : format.value === 'png'
            ? await exportPng(d, scale.value)
            : format.value === 'html'
              ? await exportHtml(d)
              : await exportSvg(d)
      if (copy) await copyText(value as string)
      else
        download(
          value,
          `${filename(d.title)}.${format.value}`,
          { svg: 'image/svg+xml', html: 'text/html', png: 'image/png', json: 'application/json' }[
            format.value
          ]
        )
    }
    studio.notify(copy ? `${name.value} copied.` : `${name.value} downloaded.`)
  } catch (e) {
    studio.notify((e as Error).message, true)
  } finally {
    busy.value = ''
  }
}
</script>
<template>
  <section
    class="flex flex-col gap-(--spacing-md) p-(--spacing-md)"
    aria-labelledby="export-heading"
  >
    <div class="flex flex-col gap-(--spacing-xs)">
      <h2 id="export-heading" class="text-heading-xxs text-(--text-default)">Export</h2>
      <p class="text-body-sm text-pretty text-(--text-muted)">
        Download artwork or an editable source file for your team and agents.
      </p>
    </div>
    <div class="flex flex-col gap-(--spacing-xs)">
      <span class="text-label-sm text-(--text-default)">File format</span>
      <SegmentedButton
        v-model="format"
        :options="formats"
        aria-label="File format"
        size="medium"
        fluid
      />
      <p class="text-body-xs text-pretty text-(--text-muted)" aria-live="polite">
        {{ descriptions[format] }}
      </p>
    </div>
    <FieldSelect
      v-if="format === 'png'"
      label="Resolution"
      input-id="export-scale"
      :options="scales.options"
      :model-value="scales.label(scale)"
      @update:model-value="scale = scales.value($event) ?? 2"
    />
    <dl class="export-summary">
      <dt>Canvas theme</dt>
      <dd>{{ diagram.theme === 'dark' ? 'Dark' : 'Light' }}</dd>
      <dt>Objects</dt>
      <dd class="tabular-nums">{{ diagram.nodes.length + diagram.groups.length }}</dd>
      <dt>Assets</dt>
      <dd>{{ format === 'json' ? 'Resolved by the CLI' : 'Embedded' }}</dd>
    </dl>
    <div class="flex flex-wrap gap-(--spacing-xs)">
      <Button
        :label="busy === 'download' ? 'Downloading…' : `Download ${name}`"
        icon="pi pi-download"
        size="medium"
        :loading="busy === 'download'"
        :disabled="busy === 'copy'"
        @click="output(false)"
      />
      <Button
        :label="busy === 'copy' ? 'Copying…' : `Copy ${name}`"
        icon="pi pi-copy"
        kind="outlined"
        size="medium"
        :loading="busy === 'copy'"
        :disabled="busy === 'download'"
        @click="output(true)"
      />
    </div>
    <Message
      severity="info"
      size="small"
      label="JSON and Diagram Studio SVG files can be reopened with Import diagram."
    />
  </section>
</template>
