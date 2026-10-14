<script setup lang="ts">
import Button from '@aziontech/webkit/button'
import InputText from '@aziontech/webkit/input-text'
import SegmentedButton from '@aziontech/webkit/segmented-button'
import EmptyState from '@aziontech/webkit/empty-state'
import Item from '@aziontech/webkit/item'
import { iconCatalog, iconSvg, iconLabel } from '~/data/icons'
import { copyText } from '~/utils/export'
definePageMeta({ title: 'Icon library' })
const studio = useStudio(),
  search = ref(''),
  family = ref('Azion'),
  selected = ref(''),
  detailOpen = ref(false)
const families = ['Azion', 'General'].map((value) => ({ value, label: value }))
const filtered = computed(() =>
  iconCatalog.filter(
    (i) =>
      i.family === family.value &&
      `${i.name} ${iconLabel(i.name)}`.toLowerCase().includes(search.value.toLowerCase())
  )
)
function open(name: string) {
  selected.value = name
  detailOpen.value = true
}
async function copy(value: string, what: string) {
  try {
    await copyText(value)
    studio.notify(`${what} copied.`)
  } catch (e) {
    studio.notify((e as Error).message, true)
  }
}
</script>
<template>
  <div class="layout-column layout-boundary flex min-w-0 flex-col">
    <h1 class="sr-only">Icon library</h1>
    <div class="layout-section-start flex flex-col gap-(--layout-section-gap)">
      <section class="flex flex-col gap-(--layout-group-gap)" aria-label="Icons">
        <div class="flex flex-wrap items-center gap-(--layout-group-gap)">
          <div class="w-full max-w-(--container-2xs)">
            <InputText
              v-model="search"
              aria-label="Search icons"
              placeholder="Search by name or product"
              size="large"
              ><template #iconLeft><i aria-hidden="true" class="pi pi-search" /></template
            ></InputText>
          </div>
          <SegmentedButton
            v-model="family"
            :options="families"
            aria-label="Icon family"
            size="large"
          />
          <p class="ml-auto text-body-sm text-(--text-muted) tabular-nums" aria-live="polite">
            {{ filtered.length }} of {{ iconCatalog.length }} icons
          </p>
        </div>
        <ul v-if="filtered.length" class="icon-grid" aria-label="Icons">
          <li v-for="icon in filtered" :key="icon.name" class="flex">
            <Item kind="outline" size="small" as-child>
              <button type="button" class="w-full text-left" @click="open(icon.name)">
                <Item.Media><StudioIcon :name="icon.name" :size="24" /></Item.Media>
                <Item.Content>
                  <Item.Title>{{ iconLabel(icon.name) }}</Item.Title>
                  <Item.Description>{{ icon.name }}</Item.Description>
                </Item.Content>
              </button>
            </Item>
          </li>
        </ul>
        <EmptyState
          v-else
          title="No icons match"
          description="Try another product or icon name."
          icon="pi pi-search"
        >
          <template #actions>
            <Button label="Clear search" kind="outlined" size="large" @click="search = ''" />
          </template>
        </EmptyState>
      </section>
    </div>
    <StudioDialog v-model:open="detailOpen" :title="iconLabel(selected)" size="small">
      <div
        class="flex flex-col items-center gap-(--spacing-sm) rounded-(--shape-card) bg-(--bg-surface-raised) p-(--spacing-lg)"
      >
        <StudioIcon :name="selected" :size="64" />
        <code class="text-body-sm text-(--text-muted)">{{ selected }}</code>
      </div>
      <template #footer>
        <Button
          label="Copy name"
          kind="outlined"
          size="medium"
          @click="copy(selected, 'Icon name')"
        />
        <Button
          label="Copy SVG"
          icon="pi pi-copy"
          size="medium"
          @click="copy(iconSvg(selected), 'SVG')"
        />
      </template>
    </StudioDialog>
  </div>
</template>
