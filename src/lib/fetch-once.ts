/** Coalesce identical in-flight requests (e.g. React StrictMode double mount). */
const inflight = new Map<string, Promise<unknown>>()

export function fetchOnce<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing

  const promise = factory().finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, promise)
  return promise
}
