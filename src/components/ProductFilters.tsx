import { memo, type FormEvent } from 'react'
import { FilterX, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ProductSort =
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'newest'

export interface ProductFilterValues {
  sort: ProductSort
}

interface ProductFiltersProps {
  values: ProductFilterValues
  onChange: (values: ProductFilterValues) => void
  idPrefix?: string
  layout?: 'stacked' | 'inline'
  showLabel?: boolean
}

export const ProductFilters = memo(function ProductFilters({
  values,
  onChange,
  idPrefix = 'filter',
  layout = 'stacked',
  showLabel = true,
}: ProductFiltersProps) {
  const controlClass =
    layout === 'inline' ? 'h-9 w-full min-w-[168px] sm:w-[168px] text-sm' : undefined

  return (
    <div className={layout === 'inline' ? 'min-w-0 shrink-0' : 'space-y-2'}>
      <Label
        htmlFor={`${idPrefix}-sort`}
        className={showLabel && layout === 'stacked' ? undefined : 'sr-only'}
      >
        Sort by
      </Label>
      <Select
        value={values.sort}
        onValueChange={(v) => onChange({ sort: v as ProductSort })}
      >
        <SelectTrigger id={`${idPrefix}-sort`} className={controlClass} aria-label="Sort products">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
          <SelectItem value="name_asc">Name: A–Z</SelectItem>
          <SelectItem value="name_desc">Name: Z–A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
})

export interface ProductFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  sort: ProductSort
  onSortChange: (sort: ProductSort) => void
  onClear: () => void
  canClear: boolean
}

export function ProductFilterBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  sort,
  onSortChange,
  onClear,
  canClear,
}: ProductFilterBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearchSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-lg border border-border/80 bg-muted/25 p-3 shadow-sm"
      aria-label="Search and filter products"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="product-search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search paintings and art materials..."
            aria-label="Search products"
            className="h-9 border-border/60 bg-background pl-9 pr-3 text-sm shadow-none"
          />
        </div>

        <div
          className="hidden h-8 w-px shrink-0 bg-border sm:block"
          aria-hidden
        />

        <ProductFilters
          layout="inline"
          showLabel={false}
          values={{ sort }}
          onChange={(values) => onSortChange(values.sort)}
        />

        <div className="flex shrink-0 sm:ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-9 gap-1.5 px-3 text-muted-foreground',
              canClear && 'text-foreground',
            )}
            aria-label="Clear filters"
            disabled={!canClear}
            onClick={onClear}
          >
            <FilterX className="h-4 w-4 shrink-0" aria-hidden />
            <span>Clear filters</span>
          </Button>
        </div>
      </div>
    </form>
  )
}

export const defaultProductFilters: ProductFilterValues = {
  sort: 'newest',
}
