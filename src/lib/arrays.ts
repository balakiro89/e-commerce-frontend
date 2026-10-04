export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  const nested =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record

  for (const key of ['items', 'orders', 'results', 'data'] as const) {
    const candidate = nested[key]
    if (Array.isArray(candidate)) return candidate as T[]
  }

  return []
}
