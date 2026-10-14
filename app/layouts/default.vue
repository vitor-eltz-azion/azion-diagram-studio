<script setup lang="ts">
import Sidebar from '@aziontech/webkit/sidebar'
import SidebarHeader from '@aziontech/webkit/sidebar-header'
import SidebarFooter from '@aziontech/webkit/sidebar-footer'
import GlobalHeader from '@aziontech/webkit/global-header'
import Breadcrumb from '@aziontech/webkit/breadcrumb'
import IconButton from '@aziontech/webkit/icon-button'
import Avatar from '@aziontech/webkit/avatar'
import Brand from '@aziontech/webkit/brand'
import Drawer from '@aziontech/webkit/drawer'
import DrawerPortal from '@aziontech/webkit/drawer-portal'
import DrawerOverlay from '@aziontech/webkit/drawer-overlay'
import DrawerContent from '@aziontech/webkit/drawer-content'
import DrawerTitle from '@aziontech/webkit/drawer-title'
import DrawerClose from '@aziontech/webkit/drawer-close'
import PanelHeader from '@aziontech/webkit/panel-header'
import PanelContent from '@aziontech/webkit/panel-content'
import PanelFooter from '@aziontech/webkit/panel-footer'
// Persistent console shell for every browse page: sidebar + one GlobalHeader.
defineSlots<{ default(): unknown }>()
const route = useRoute(),
  follow = useSpaNavigation()
const title = computed(() => String(route.meta.title ?? 'Templates'))
const narrow = ref(false),
  railOpen = ref(true),
  drawerOpen = ref(false)
useHead({ title: computed(() => `${title.value} · Diagram Studio`) })
onMounted(() => {
  const query = matchMedia('(max-width: 767px)')
  narrow.value = query.matches
  query.addEventListener('change', (event) => {
    narrow.value = event.matches
    drawerOpen.value = false
  })
})
watch(
  () => route.path,
  () => (drawerOpen.value = false)
)
const navOpen = computed(() => (narrow.value ? drawerOpen.value : railOpen.value))
function toggleNav() {
  if (narrow.value) drawerOpen.value = !drawerOpen.value
  else railOpen.value = !railOpen.value
}
</script>
<template>
  <div class="flex h-dvh min-w-0 bg-(--bg-canvas)">
    <AppSkipLink />
    <div v-if="!narrow && railOpen" class="flex shrink-0">
      <Sidebar aria-label="Main navigation">
        <template #header>
          <SidebarHeader>
            <NuxtLink to="/" class="flex items-center gap-(--spacing-sm)">
              <Brand kind="reduced" size="small" />
              <span class="text-label-md text-(--text-default)">Diagram Studio</span>
            </NuxtLink>
          </SidebarHeader>
        </template>
        <AppNavLinks />
        <template #footer>
          <SidebarFooter><AppIdentity /></SidebarFooter>
        </template>
      </Sidebar>
    </div>
    <Drawer v-if="narrow" v-model:open="drawerOpen" side="left" size="small">
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerContent>
          <PanelHeader>
            <DrawerTitle>Diagram Studio</DrawerTitle>
            <DrawerClose />
          </PanelHeader>
          <PanelContent>
            <nav aria-label="Main navigation"><AppNavLinks /></nav>
          </PanelContent>
          <PanelFooter><AppIdentity /></PanelFooter>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
    <div class="flex min-w-0 flex-1 flex-col">
      <GlobalHeader aria-label="Page header">
        <GlobalHeader.Left>
          <IconButton
            icon="pi pi-bars"
            :ariaLabel="navOpen ? 'Hide navigation' : 'Show navigation'"
            :aria-expanded="navOpen"
            kind="transparent"
            size="medium"
            @click="toggleNav"
          />
          <Breadcrumb :items="[{ label: title }]" @navigate="follow" />
        </GlobalHeader.Left>
        <GlobalHeader.Middle />
        <GlobalHeader.Right>
          <Avatar icon="pi pi-user" size="small" />
        </GlobalHeader.Right>
      </GlobalHeader>
      <main id="main" class="min-h-0 flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
