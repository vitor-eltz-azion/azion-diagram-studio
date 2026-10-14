<script setup lang="ts">
import FieldText from '@aziontech/webkit/field-text'
import FieldTextarea from '@aziontech/webkit/field-textarea'
// FieldText / FieldTextarea with a length cap. The fields have no maxlength passthrough, so the
// draft is validated here: values over the cap stay on the field as invalid and are not committed.
const props = defineProps<{
  id: string
  label: string
  maxLength: number
  multiline?: boolean
  disabled?: boolean
  placeholder?: string
}>()
const model = defineModel<string>({ required: true })
const draft = ref(model.value)
let committed = model.value
watch(model, (value) => {
  if (value === committed) return
  committed = value
  draft.value = value
})
const tooLong = computed(() => draft.value.length > props.maxLength)
const helper = computed(() => (tooLong.value ? `Use ${props.maxLength} characters or fewer.` : ''))
function update(value: string) {
  draft.value = value
  if (value.length > props.maxLength) return
  committed = value
  model.value = value
}
</script>
<template>
  <FieldTextarea
    v-if="multiline"
    :input-id="id"
    :label="label"
    :model-value="draft"
    :disabled="disabled"
    :placeholder="placeholder"
    :invalid="tooLong"
    :helper-text="helper"
    @update:model-value="update"
  />
  <FieldText
    v-else
    :input-id="id"
    :label="label"
    :model-value="draft"
    :disabled="disabled"
    :placeholder="placeholder"
    :invalid="tooLong"
    :helper-text="helper"
    @update:model-value="update"
  />
</template>
