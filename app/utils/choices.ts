// FieldSelect shows String(value) in its trigger (it passes no displayValue to Select), so the
// options carry their label as the value and these helpers map it back to the model value.
export interface Choice<T> {
  value: T
  label: string
}
export function choices<T>(items: readonly Choice<T>[]) {
  return {
    options: items.map((item) => ({ value: item.label, label: item.label })),
    label: (value: T | undefined) => items.find((item) => item.value === value)?.label ?? '',
    value: (label: unknown) => items.find((item) => item.label === label)?.value,
  }
}
// Node names can repeat, so a repeated name gets a counter to stay distinguishable.
export function nodeChoices(nodes: readonly { id: string; label: string }[]) {
  const seen = new Map<string, number>()
  return choices(
    nodes.map((node) => {
      const count = (seen.get(node.label) ?? 0) + 1
      seen.set(node.label, count)
      return { value: node.id, label: count > 1 ? `${node.label} ${count}` : node.label }
    })
  )
}
