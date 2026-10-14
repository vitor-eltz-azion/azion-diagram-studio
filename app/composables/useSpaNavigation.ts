// Webkit links render real anchors; follow plain left-clicks through the router and leave
// modified clicks (new tab, new window) to the browser.
export function useSpaNavigation() {
  return (event: MouseEvent, href: string) => {
    if (!href || href === '#' || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigateTo(href)
  }
}
