/** Unwrap `{ success, data }` envelopes or return the body as-is (direct responses). */
export function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (record.success === true && 'data' in record) {
      return record.data as T
    }
  }
  return payload as T
}
