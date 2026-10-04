import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ page, totalPages, onPageChange, disabled }: PaginationProps) {
  const items = useMemo(() => {
    if (totalPages <= 1) return [] as (number | 'ellipsis')[]

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
    )

    const result: (number | 'ellipsis')[] = []
    pages.forEach((p, idx) => {
      if (idx > 0 && p - pages[idx - 1] > 1) result.push('ellipsis')
      result.push(p)
    })
    return result
  }, [page, totalPages])

  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {items.map((item, i) =>
          item === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'min-w-9 rounded-md px-2 py-1 text-sm',
                item === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent',
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
