import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productApi } from '@/api/product.api'
import { ProductGrid } from '@/components/ProductGrid'
import { Pagination } from '@/components/Pagination'
import {
  ProductFilterBar,
  defaultProductFilters,
  type ProductFilterValues,
  type ProductSort,
} from '@/components/ProductFilters'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { createEffectGuard } from '@/lib/effect-guard'
import { fetchOnce } from '@/lib/fetch-once'
import type { PaginatedProducts } from '@/types/product'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')

  const page = Number(searchParams.get('page') ?? '1') || 1
  const search = searchParams.get('search') ?? ''

  const filters: ProductFilterValues = useMemo(
    () => ({
      sort: (searchParams.get('sort') as ProductSort) ?? defaultProductFilters.sort,
    }),
    [searchParams],
  )

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(patch).forEach(([key, value]) => {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        })
        return next
      })
    },
    [setSearchParams],
  )

  const loadProducts = useCallback(
    (isActive: () => boolean = () => true) => {
      setLoading(true)
      setError(null)
      const cacheKey = `products:${page}:${search}:${filters.sort}`
      fetchOnce(cacheKey, () =>
        productApi.getProducts({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          sort: filters.sort,
        }),
      ).then((result) => {
          if (isActive()) setData(result)
        })
        .catch(() => {
          if (isActive()) setError('Something went wrong. Please try again.')
        })
        .finally(() => {
          if (isActive()) setLoading(false)
        })
    },
    [filters, page, search],
  )

  useEffect(() => {
    const guard = createEffectGuard()
    loadProducts(guard.isActive)
    return () => guard.cancel()
  }, [loadProducts])

  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '')
  }, [search])

  useEffect(() => {
    const stale: Record<string, null> = {}
    if (searchParams.has('product_type')) stale.product_type = null
    if (searchParams.has('in_stock')) stale.in_stock = null
    if (searchParams.has('min_price')) stale.min_price = null
    if (searchParams.has('max_price')) stale.max_price = null
    if (Object.keys(stale).length > 0) updateParams(stale)
  }, [searchParams, updateParams])

  useEffect(() => {
    const next = searchInput.trim()
    const applied = search.trim()
    if (next === applied) return

    const timer = window.setTimeout(() => {
      updateParams({ page: '1', search: next || null })
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput, search, updateParams])

  const applySort = useCallback(
    (sort: ProductSort) => {
      updateParams({
        page: '1',
        sort: sort === defaultProductFilters.sort ? null : sort,
      })
    },
    [updateParams],
  )

  const applySearchNow = useCallback(() => {
    const next = searchInput.trim()
    updateParams({ page: '1', search: next || null })
  }, [searchInput, updateParams])

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    Boolean(search) ||
    filters.sort !== defaultProductFilters.sort

  const clearFilters = () => {
    setSearchInput('')
    updateParams({
      page: '1',
      search: null,
      sort: null,
      min_price: null,
      max_price: null,
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl">Products</h1>
        <p className="text-muted-foreground">Browse paintings and art materials</p>
      </div>

      <ProductFilterBar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={applySearchNow}
        sort={filters.sort}
        onSortChange={applySort}
        onClear={clearFilters}
        canClear={hasActiveFilters}
      />

      <div className="space-y-6">
        {loading ? <LoadingState message="Loading products..." /> : null}
        {error ? (
          <ErrorMessage message={error} onRetry={() => loadProducts()} retryLoading={loading} />
        ) : null}
        {!loading && !error && (data?.items?.length ?? 0) === 0 ? (
          <EmptyState title="No products found." />
        ) : null}
        {!loading && !error && data && (data.items?.length ?? 0) > 0 ? (
          <>
            <ProductGrid products={data.items} />
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              disabled={loading}
              onPageChange={(p) => updateParams({ page: String(p) })}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
