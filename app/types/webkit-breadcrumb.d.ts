// @aziontech/webkit/breadcrumb resolves to a plain index.js that ships no declaration file.
// These types mirror breadcrumb.vue (props `items`, event `navigate`).
declare module '@aziontech/webkit/breadcrumb' {
  import type { DefineComponent } from 'vue'
  interface BreadcrumbItemData {
    label: string
    href?: string
    showIcon?: boolean
    icon?: string
    current?: boolean
  }
  const Breadcrumb: DefineComponent<{
    items?: BreadcrumbItemData[]
    onNavigate?: (event: MouseEvent, href: string) => void
  }>
  export default Breadcrumb
}
