<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import InputText from '@aziontech/webkit/input-text'
import EmptyState from '@aziontech/webkit/empty-state'
import Message from '@aziontech/webkit/message'
definePageMeta({ title: 'My diagrams' })
const studio = useStudio(),
  search = ref(''),
  deleting = ref(''),
  deleteOpen = ref(false)
const diagrams = computed(() => studio.state.value.diagrams)
const filtered = computed(() =>
  diagrams.value.filter((d) => d.title.toLowerCase().includes(search.value.toLowerCase()))
)
const deletingTitle = computed(
  () => diagrams.value.find((d) => d.id === deleting.value)?.title ?? 'This diagram'
)
function confirmDelete(id: string) {
  deleting.value = id
  deleteOpen.value = true
}
function deleteDiagram() {
  studio.remove(deleting.value)
  deleteOpen.value = false
}
</script>
<template>
  <div class="layout-column layout-boundary flex min-w-0 flex-col">
    <h1 class="sr-only">My diagrams</h1>
    <div class="layout-section-start flex flex-col gap-(--layout-section-gap)">
      <section class="flex flex-col gap-(--layout-group-gap)" aria-label="Saved diagrams">
        <Message
          severity="info"
          size="small"
          label="Diagrams are saved in this browser. Export a JSON file to back one up or share it."
        />
        <div class="flex flex-wrap items-center gap-(--layout-group-gap)">
          <div class="flex min-w-0 grow items-center gap-(--layout-group-gap)">
            <div v-if="diagrams.length" class="w-full max-w-(--container-2xs)">
              <InputText
                v-model="search"
                placeholder="Search diagrams"
                aria-label="Search saved diagrams"
                size="large"
                ><template #iconLeft><i aria-hidden="true" class="pi pi-search" /></template
              ></InputText>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-(--spacing-sm)">
            <DiagramImport />
            <Button label="Create diagram" icon="pi pi-plus" size="large" @click="studio.start()" />
          </div>
        </div>
        <div v-if="filtered.length" class="diagram-grid">
          <DiagramCard
            v-for="d in filtered"
            :key="d.id"
            :diagram="d"
            saved
            @open="navigateTo(`/editor/${d.id}`)"
            @delete="confirmDelete(d.id)"
          />
        </div>
        <EmptyState
          v-else-if="diagrams.length"
          title="No diagrams match"
          description="Try another name."
          icon="pi pi-search"
        >
          <template #actions>
            <Button label="Clear search" kind="outlined" size="large" @click="search = ''" />
          </template>
        </EmptyState>
        <EmptyState
          v-else
          title="No saved diagrams yet"
          description="Saved diagrams appear here. Start from a template or a blank canvas."
          icon="pi pi-folder"
        >
          <template #actions>
            <Button label="Create diagram" icon="pi pi-plus" size="large" @click="studio.start()" />
          </template>
        </EmptyState>
      </section>
    </div>
    <StudioDialog v-model:open="deleteOpen" title="Delete diagram?" size="small">
      <p class="text-body-sm text-pretty text-(--text-muted)">
        {{ deletingTitle }} and its draft will be removed from this browser. This can't be undone.
      </p>
      <template #footer>
        <Button label="Cancel" kind="outlined" size="medium" @click="deleteOpen = false" />
        <Button label="Delete diagram" kind="danger" size="medium" @click="deleteDiagram" />
      </template>
    </StudioDialog>
  </div>
</template>
