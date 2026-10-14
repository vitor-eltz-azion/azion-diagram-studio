<script setup lang="ts">
const studio = useStudio()
onMounted(studio.init)
</script>
<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
</template>
