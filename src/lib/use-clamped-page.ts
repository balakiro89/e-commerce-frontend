import { useEffect } from 'react'

/** Keeps URL/local page in range when filters shrink the result set. */
export function useClampedPage(
  page: number,
  totalPages: number,
  onPageChange: (page: number) => void,
) {
  useEffect(() => {
    if (totalPages < 1) return
    if (page > totalPages) onPageChange(totalPages)
  }, [page, totalPages, onPageChange])
}
