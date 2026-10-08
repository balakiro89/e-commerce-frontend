import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

const squareBtn =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed'

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

  const prevDisabled = disabled || page <= 1
  const nextDisabled = disabled || page >= totalPages

  return (
    <nav className="flex items-center justify-end gap-1.5" aria-label="Pagination">
      <button
        type="button"
        aria-label="Previous page"
        disabled={prevDisabled}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          squareBtn,
          prevDisabled
            ? 'bg-muted text-muted-foreground'
            : 'border border-border bg-background text-foreground hover:bg-accent',
        )}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
      </button>

      {items.map((item, i) =>
        item === 'ellipsis' ? (
          <span
            key={`e-${i}`}
            className="inline-flex size-9 items-center justify-center text-muted-foreground"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            disabled={disabled}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              squareBtn,
              item === page
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-border bg-background text-foreground hover:bg-accent',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={nextDisabled}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          squareBtn,
          nextDisabled
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </nav>
  )
}
