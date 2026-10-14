<script setup lang="ts">
import CardBox from '@aziontech/webkit/card-box'
import Item from '@aziontech/webkit/item'
import InputNumber from '@aziontech/webkit/input-number'
// Geometry as an item group: Item.Title names the field and the control takes an aria-label.
export interface NumberField {
  key: string
  label: string
  value: number
  min: number
  max: number
}
const props = defineProps<{ title: string; fields: NumberField[]; disabled?: boolean }>()
const emit = defineEmits<{ commit: [key: string, value: number] }>()
const headingId = useId()
function commit(field: NumberField, value: number) {
  const next = Number.isFinite(value) ? Math.round(value) : field.value
  emit('commit', field.key, Math.max(field.min, Math.min(field.max, next)))
}
</script>
<template>
  <section class="flex flex-col gap-(--spacing-sm)" :aria-labelledby="headingId">
    <h3 :id="headingId" class="px-(--spacing-xs) text-heading-xxs text-(--text-default)">
      {{ props.title }}
    </h3>
    <CardBox :padded="false">
      <template #content>
        <Item.List>
          <Item v-for="field in fields" :key="field.key" size="small" role="listitem">
            <Item.Content>
              <Item.Title>{{ field.label }}</Item.Title>
            </Item.Content>
            <Item.Actions>
              <div class="layout-field-control">
                <InputNumber
                  :model-value="field.value"
                  :aria-label="field.label"
                  :min="field.min"
                  :max="field.max"
                  :disabled="disabled"
                  :show-buttons="false"
                  size="small"
                  @change="commit(field, $event)"
                />
              </div>
            </Item.Actions>
          </Item>
        </Item.List>
      </template>
    </CardBox>
  </section>
</template>
