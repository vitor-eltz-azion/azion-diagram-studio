import { ToastPlugin } from '@aziontech/webkit/toast'

// One toast region for the whole app; useStudio().notify() raises into it.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ToastPlugin, { position: 'bottom-right' })
})
