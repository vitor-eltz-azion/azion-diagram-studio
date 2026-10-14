<script setup lang="ts">
import CardBox from '@aziontech/webkit/card-box'
import Button from '@aziontech/webkit/button'
import IconButton from '@aziontech/webkit/icon-button'
import Tag from '@aziontech/webkit/tag'
import type { DiagramTemplate, Diagram } from '~/data/types'
// One card for templates and saved diagrams; a saved diagram adds Delete and its edit date.
const props = defineProps<{ diagram: DiagramTemplate | Diagram; saved?: boolean }>()
const emit = defineEmits<{ open: []; delete: [] }>()
const studio = useStudio(),
  titleId = useId()
const preview = computed(() => ({ ...props.diagram, theme: studio.theme.value }))
const updated = computed(() => {
  const value = (props.diagram as Diagram).updatedAt
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : ''
})
</script>
<template>
  <article :aria-labelledby="titleId" class="flex min-w-0 flex-col">
    <CardBox :padded="false">
      <template #content>
        <div class="diagram-preview"><DiagramCanvas :diagram="preview" :chrome="false" /></div>
        <div class="flex flex-col gap-(--spacing-xs) p-(--spacing-md)">
          <p
            class="flex items-center justify-between gap-(--spacing-sm) text-body-xs text-(--text-muted)"
          >
            <span>{{ diagram.category }}</span>
            <span class="tabular-nums">{{ diagram.nodes.length }} components</span>
          </p>
          <h2 :id="titleId" class="text-heading-xxs text-balance text-(--text-default)">
            {{ diagram.title }}
          </h2>
          <p class="line-clamp-2 text-body-sm text-pretty text-(--text-muted)">
            {{ diagram.description }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full items-center justify-between gap-(--spacing-sm)">
          <span v-if="saved" class="text-body-xs text-(--text-muted)">Updated {{ updated }}</span>
          <Tag
            v-else
            :label="(diagram as DiagramTemplate).difficulty"
            severity="secondary"
            size="small"
          />
          <div class="flex items-center gap-(--spacing-xs)">
            <IconButton
              v-if="saved"
              icon="pi pi-trash"
              :ariaLabel="`Delete ${diagram.title}`"
              kind="transparent"
              size="medium"
              @click="emit('delete')"
            />
            <Button
              :label="saved ? 'Open' : 'Use template'"
              kind="outlined"
              size="medium"
              @click="emit('open')"
            />
          </div>
        </div>
      </template>
    </CardBox>
  </article>
</template>
