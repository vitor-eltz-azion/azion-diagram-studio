<script setup lang="ts">
import Avatar from '@aziontech/webkit/avatar'
import ThemeSwitcher from '@aziontech/webkit/theme-switcher'
const studio = useStudio()
</script>
<template>
  <div class="flex flex-col gap-(--spacing-sm)">
    <div class="flex min-w-0 items-center gap-(--spacing-sm)">
      <Avatar icon="pi pi-user" size="small" />
      <div class="flex min-w-0 flex-col">
        <span class="truncate text-label-sm text-(--text-default)">Local workspace</span>
        <span class="truncate text-body-xs text-(--text-muted)">Saved in this browser</span>
      </div>
    </div>
    <ThemeSwitcher
      :value="studio.state.value.theme"
      aria-label="Theme"
      @update:value="studio.setTheme"
    />
  </div>
</template>
