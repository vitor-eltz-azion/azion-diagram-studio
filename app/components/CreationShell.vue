<script setup lang="ts">
import GlobalHeader from '@aziontech/webkit/global-header'
import Breadcrumb from '@aziontech/webkit/breadcrumb'
import IconButton from '@aziontech/webkit/icon-button'
import Avatar from '@aziontech/webkit/avatar'
import Brand from '@aziontech/webkit/brand'
// Focused shell for a single task: no sidebar, the back button and breadcrumb are the way out.
const props = defineProps<{
  breadcrumb: { label: string; href?: string }[]
  backLabel: string
  backHref: string
}>()
defineSlots<{ default(): unknown; actions(): unknown }>()
const follow = useSpaNavigation()
useHead({
  title: computed(() => `${props.breadcrumb.at(-1)?.label ?? 'Editor'} · Diagram Studio`),
})
</script>
<template>
  <div class="flex h-dvh min-w-0 flex-col bg-(--bg-canvas)">
    <AppSkipLink />
    <GlobalHeader aria-label="Editor header">
      <GlobalHeader.Brand>
        <NuxtLink to="/" aria-label="Diagram Studio templates"
          ><Brand kind="reduced" size="small"
        /></NuxtLink>
      </GlobalHeader.Brand>
      <GlobalHeader.Left>
        <IconButton
          icon="pi pi-arrow-left"
          :ariaLabel="backLabel"
          kind="transparent"
          size="medium"
          @click="navigateTo(backHref)"
        />
        <div class="hidden min-w-0 sm:block">
          <Breadcrumb :items="breadcrumb" @navigate="follow" />
        </div>
      </GlobalHeader.Left>
      <GlobalHeader.Middle />
      <GlobalHeader.Right>
        <slot name="actions" />
        <Avatar icon="pi pi-user" size="small" />
      </GlobalHeader.Right>
    </GlobalHeader>
    <main id="main" class="flex min-h-0 flex-1 flex-col">
      <h1 class="sr-only">{{ breadcrumb.at(-1)?.label }}</h1>
      <slot />
    </main>
  </div>
</template>
