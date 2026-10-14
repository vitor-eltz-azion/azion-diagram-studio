import { toast } from '@aziontech/webkit/toast'
import type { Diagram, DiagramTemplate } from '~/data/types'
import { createDiagram } from '~/data/templates'
const STORAGE_KEY = 'azion-diagram-studio.v1'
// Read by the pre-paint script in nuxt.config.ts, so it stays a small separate key.
export const THEME_KEY = 'azion-diagram-studio.theme'
export type ThemeChoice = 'system' | 'dark' | 'light'
interface StoredStudio {
  diagrams: Diagram[]
  drafts: Diagram[]
  theme: ThemeChoice
}
export function useStudio() {
  const state = useState<StoredStudio>('studio', () => ({
    diagrams: [],
    drafts: [],
    theme: 'dark',
  }))
  const initialized = useState('studio-initialized', () => false)
  const systemDark = useState('studio-system-dark', () => true)
  const theme = computed<'dark' | 'light'>(() =>
    state.value.theme === 'system' ? (systemDark.value ? 'dark' : 'light') : state.value.theme
  )
  function notify(text: string, error = false) {
    if (error) toast.error(text)
    else toast.success(text)
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
      localStorage.setItem(THEME_KEY, state.value.theme)
      return true
    } catch {
      notify('Browser storage is full or unavailable. Export a file to keep your work.', true)
      return false
    }
  }
  function applyTheme() {
    document.documentElement.dataset.theme = theme.value
  }
  function init() {
    if (initialized.value) return
    initialized.value = true
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (stored && Array.isArray(stored.diagrams) && Array.isArray(stored.drafts))
        state.value = stored
      const theme = localStorage.getItem(THEME_KEY)
      if (theme === 'system' || theme === 'dark' || theme === 'light') state.value.theme = theme
    } catch {
      notify(
        'Saved browser data could not be read. You can still create and export diagrams.',
        true
      )
    }
    const media = matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = media.matches
    media.addEventListener('change', (event) => {
      systemDark.value = event.matches
      applyTheme()
    })
    applyTheme()
  }
  function start(template?: DiagramTemplate) {
    const diagram = createDiagram(template)
    diagram.theme = theme.value
    state.value.drafts.push(diagram)
    persist()
    return navigateTo(`/editor/${diagram.id}`)
  }
  function draft(diagram: Diagram) {
    const value = JSON.parse(JSON.stringify(diagram)) as Diagram
    const i = state.value.drafts.findIndex((d) => d.id === value.id)
    if (i >= 0) state.value.drafts[i] = value
    else state.value.drafts.push(value)
    return persist()
  }
  function save(diagram: Diagram) {
    const value = {
      ...JSON.parse(JSON.stringify(diagram)),
      updatedAt: new Date().toISOString(),
    } as Diagram
    const index = state.value.diagrams.findIndex((d) => d.id === value.id)
    if (index < 0) state.value.diagrams.unshift(value)
    else state.value.diagrams[index] = value
    if (draft(value)) notify('Diagram saved to My diagrams.')
  }
  function remove(id: string) {
    state.value.diagrams = state.value.diagrams.filter((d) => d.id !== id)
    state.value.drafts = state.value.drafts.filter((d) => d.id !== id)
    if (persist()) notify('Diagram deleted.')
  }
  function setTheme(choice: ThemeChoice) {
    state.value.theme = choice
    applyTheme()
    persist()
  }
  return { state, theme, init, start, save, draft, remove, notify, setTheme }
}
