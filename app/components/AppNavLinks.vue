<script setup lang="ts">
import SidebarGroup from '@aziontech/webkit/sidebar-group'
import MenuItem from '@aziontech/webkit/menu-item'
const route = useRoute(),
  studio = useStudio(),
  follow = useSpaNavigation()
const links = computed(() => [
  { href: '/', label: 'Templates', icon: 'pi pi-objects-column' },
  {
    href: '/diagrams',
    label: 'My diagrams',
    icon: 'pi pi-folder',
    count: studio.state.value.diagrams.length,
  },
  { href: '/icons', label: 'Icon library', icon: 'pi pi-box' },
  { href: '/guide', label: 'Design guidelines', icon: 'pi pi-book' },
])
</script>
<template>
  <SidebarGroup label="Workspace">
    <MenuItem
      v-for="link in links"
      :key="link.href"
      :href="link.href"
      :label="link.label"
      :icon="link.icon"
      :selected="route.path === link.href"
      :tag-value="link.count ? String(link.count) : undefined"
      tag-severity="secondary"
      @click="(event: MouseEvent) => follow(event, link.href)"
    />
  </SidebarGroup>
</template>
