<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import InputText from '@aziontech/webkit/input-text'
import SegmentedButton from '@aziontech/webkit/segmented-button'
import EmptyState from '@aziontech/webkit/empty-state'
import { templates, categories } from '~/data/templates'
definePageMeta({ title: 'Templates' })
const studio = useStudio(),
  search = ref(''),
  category = ref<string>('All templates')
const options = categories.map((value) => ({
  value,
  label: value === 'All templates' ? 'All' : value,
}))
const filtered = computed(() =>
  templates.filter(
    (t) =>
      (category.value === 'All templates' || t.category === category.value) &&
      `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(search.value.toLowerCase())
  )
)
function clearFilters() {
  search.value = ''
  category.value = 'All templates'
}
</script>
<template>
  <div class="layout-column layout-boundary flex min-w-0 flex-col">
    <h1 class="sr-only">Templates</h1>
    <div class="layout-section-start flex flex-col gap-(--layout-section-gap)">
      <section class="flex flex-col gap-(--layout-group-gap)" aria-label="Template gallery">
        <div class="flex flex-wrap items-center justify-between gap-(--layout-group-gap)">
          <div class="w-full max-w-(--container-2xs)">
            <InputText
              v-model="search"
              placeholder="Search templates"
              aria-label="Search templates"
              size="large"
              ><template #iconLeft><i aria-hidden="true" class="pi pi-search" /></template
            ></InputText>
          </div>
          <div class="flex shrink-0 items-center gap-(--spacing-sm)">
            <DiagramImport />
            <Button label="Create diagram" icon="pi pi-plus" size="large" @click="studio.start()" />
          </div>
        </div>
        <div class="max-w-full overflow-x-auto">
          <SegmentedButton
            v-model="category"
            :options="options"
            aria-label="Template category"
            size="medium"
          />
        </div>
        <div v-if="filtered.length" class="diagram-grid">
          <DiagramCard
            v-for="template in filtered"
            :key="template.id"
            :diagram="template"
            @open="studio.start(template)"
          />
        </div>
        <EmptyState
          v-else
          title="No templates match"
          description="Try another keyword or category."
          icon="pi pi-search"
        >
          <template #actions>
            <Button label="Clear filters" kind="outlined" size="large" @click="clearFilters" />
          </template>
        </EmptyState>
      </section>
    </div>
  </div>
</template>
