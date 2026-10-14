<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import type { Diagram } from '~/data/types'
import { buildPrompt } from '~/utils/diagram'
import { copyText } from '~/utils/export'
const props = defineProps<{ diagram: Diagram }>()
const studio = useStudio()
const prompt = computed(() => buildPrompt(props.diagram))
async function copyPrompt() {
  try {
    await copyText(prompt.value)
    studio.notify('Prompt copied.')
  } catch (e) {
    studio.notify((e as Error).message, true)
  }
}
</script>
<template>
  <section
    class="flex flex-col gap-(--spacing-md) p-(--spacing-md)"
    aria-labelledby="prompt-heading"
  >
    <div class="flex flex-col gap-(--spacing-xs)">
      <h2 id="prompt-heading" class="text-heading-xxs text-(--text-default)">Prompt</h2>
      <p class="text-body-sm text-pretty text-(--text-muted)">
        A detailed prompt built from the current components, shapes, and connections. Agents can
        also create diagrams with the CLI and import the JSON here.
      </p>
    </div>
    <div
      class="prompt-preview"
      role="region"
      aria-label="Architecture prompt"
      tabindex="0"
      v-text="prompt"
    />
    <div>
      <Button label="Copy prompt" icon="pi pi-copy" size="medium" @click="copyPrompt" />
    </div>
  </section>
</template>
