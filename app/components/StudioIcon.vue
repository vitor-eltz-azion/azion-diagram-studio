<script setup lang="ts">
import { iconSvg } from '~/data/icons'
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const uid = useId()
</script>
<template>
  <span
    class="studio-icon"
    aria-hidden="true"
    :style="{ width: `${size}px`, height: `${size}px` }"
    v-html="iconSvg(name, uid)"
  />
</template>
