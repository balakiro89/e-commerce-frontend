import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createEffectGuard } from '@/lib/effect-guard'
import { orderApi } from '@/api/order.api'
import { OrderCard } from '@/components/OrderCard'
import { Pagination } from '@/components/Pagination'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { PageBackLink } from '@/components/PageBackLink'
import { asArray } from '@/lib/arrays'
import { fetchOnce } from '@/lib/fetch-once'
import { DEFAULT_PAGE_SIZE, paginateList } from '@/lib/list-pagination'
import { useClampedPage } from '@/lib/use-clamped-page'
import type { Order } from '@/types/order'

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const page = Number(searchParams.get('page') ?? '1') || 1

  const onPageChange = useCallback(
    (p: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (p <= 1) next.delete('page')
        else next.set('page', String(p))
        return next
      })
    },
    [setSearchParams],
  )

  const load = useCallback((isActive: () => boolean = () => true) => {
    setLoading(true)
    setError(null)
    fetchOnce('buyer-orders', () => orderApi.getOrders())
      .then((data) => {
        if (isActive()) setOrders(asArray<Order>(data))
      })
      .catch(() => {
        if (isActive()) setError('Something went wrong. Please try again.')
      })
      .finally(() => {
        if (isActive()) setLoading(false)
      })
  }, [])

  useEffect(() => {
    const guard = createEffectGuard()
    load(guard.isActive)
    return () => guard.cancel()
  }, [load])

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      ),
    [orders],
  )

  const paginated = useMemo(
    () => paginateList(sortedOrders, page, DEFAULT_PAGE_SIZE),
    [sortedOrders, page],
  )

  useClampedPage(page, paginated.total_pages, onPageChange)

  return (
    <div className="space-y-6">
      <PageBackLink to="/dashboard" label="Back to dashboard" />
      <h1 className="font-serif text-3xl">My Orders</h1>
      {loading ? <LoadingState message="Loading orders..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => load()} retryLoading={loading} /> : null}
      {!loading && !error && paginated.total === 0 ? (
        <EmptyState title="You have no orders yet." />
      ) : null}
      {!loading && !error && paginated.total > 0 ? (
        <>
          <div className="space-y-4">
            {paginated.items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination
            page={paginated.page}
            totalPages={paginated.total_pages}
            onPageChange={onPageChange}
          />
        </>
      ) : null}
    </div>
  )
}
