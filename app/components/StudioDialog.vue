<script setup lang="ts">
import Dialog from '@aziontech/webkit/dialog'
import DialogPortal from '@aziontech/webkit/dialog-portal'
import DialogOverlay from '@aziontech/webkit/dialog-overlay'
import DialogContent from '@aziontech/webkit/dialog-content'
import DialogTitle from '@aziontech/webkit/dialog-title'
import DialogClose from '@aziontech/webkit/dialog-close'
import PanelHeader from '@aziontech/webkit/panel-header'
import PanelContent from '@aziontech/webkit/panel-content'
import PanelFooter from '@aziontech/webkit/panel-footer'
// The one modal shape in the app: title + close, a compact body, optional action footer.
withDefaults(defineProps<{ title: string; size?: 'small' | 'medium' | 'large' }>(), {
  size: 'medium',
})
const open = defineModel<boolean>('open', { required: true })
useReturnFocus(open)
defineSlots<{ default(): unknown; footer?(): unknown }>()
</script>
<template>
  <Dialog v-model:open="open" :size="size">
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <PanelHeader>
          <DialogTitle>{{ title }}</DialogTitle>
          <DialogClose />
        </PanelHeader>
        <PanelContent>
          <div class="flex flex-col gap-(--spacing-md)"><slot /></div>
        </PanelContent>
        <PanelFooter v-if="$slots.footer"><slot name="footer" /></PanelFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>
