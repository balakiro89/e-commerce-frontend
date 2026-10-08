export const DEFAULT_PAGE_SIZE = 10

export interface PaginatedSlice<T> {
  items: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}

/** Slice a full in-memory list for UI pagination (1-based page). */
export function paginateList<T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginatedSlice<T> {
  const total = items.length
  const total_pages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const safePage = Math.min(Math.max(1, page), total_pages)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    limit: pageSize,
    total,
    total_pages,
  }
}
