import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { createEffectGuard } from '@/lib/effect-guard'
import { fetchOnce } from '@/lib/fetch-once'
import { sellerApi } from '@/api/seller.api'
import { PageBackLink } from '@/components/PageBackLink'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { downloadOrdersCsv } from '@/lib/download-order-summary'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { SellerPaidOrdersTable } from '@/components/SellerPaidOrdersTable'
import { DEFAULT_PAGE_SIZE, paginateList } from '@/lib/list-pagination'
import { useClampedPage } from '@/lib/use-clamped-page'
import type { SellerFulfillmentStatus, ShipmentService } from '@/lib/shipment'
import type { Order } from '@/types/order'

export default function SellerOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
    fetchOnce('seller-orders', () => sellerApi.getOrders())
      .then((result) => {
        if (isActive()) setOrders(result)
      })
      .catch(() => {
        if (isActive()) setError('Could not load orders.')
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

  const onStatusChange = async (
    orderId: string,
    order_status: SellerFulfillmentStatus,
    shipping?: { tracking_id: string; shipment_service: ShipmentService },
  ) => {
    setUpdatingId(orderId)
    setError(null)
    try {
      const updated = await sellerApi.updateOrderStatus(orderId, {
        order_status,
        ...shipping,
      })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    } catch {
      setError('Could not update order status.')
      throw new Error('Order status update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageBackLink to="/seller/dashboard" label="Back to dashboard" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Customer orders</h1>
          <p className="text-sm text-muted-foreground">
            Paid orders only — update fulfillment status as you ship and deliver.
          </p>
        </div>
        {!loading && !error && sortedOrders.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => downloadOrdersCsv(sortedOrders)}
          >
            <Download className="h-4 w-4" />
            Download all (CSV)
          </Button>
        ) : null}
      </div>

      {loading ? <LoadingState message="Loading orders..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => load()} retryLoading={loading} /> : null}

      {!loading && !error && paginated.total === 0 ? (
        <EmptyState title="No paid orders yet." />
      ) : null}

      {!loading && !error && paginated.total > 0 ? (
        <>
          <SellerPaidOrdersTable
            layout="page"
            orders={paginated.items}
            updatingOrderId={updatingId}
            onFulfillmentChange={(id, status, shipping) => void onStatusChange(id, status, shipping)}
          />
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
