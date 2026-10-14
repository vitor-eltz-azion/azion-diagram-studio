// Webkit overlays restore focus only to their own Trigger part. Overlays opened from other
// controls (a toolbar button, a shortcut, a card action) return focus to that opener on close.
export function useReturnFocus(open: Ref<boolean>) {
  let opener: HTMLElement | null = null
  watch(open, (value) => {
    if (value) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
      return
    }
    const target = opener
    opener = null
    if (target) setTimeout(() => target.isConnected && target.focus())
  })
}
