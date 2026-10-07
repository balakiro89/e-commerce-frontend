import { useCallback, useEffect, useState } from 'react'
import { createEffectGuard } from '@/lib/effect-guard'
import { fetchOnce } from '@/lib/fetch-once'
import { sellerApi } from '@/api/seller.api'
import { PageBackLink } from '@/components/PageBackLink'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { SellerPaidOrdersTable } from '@/components/SellerPaidOrdersTable'
import type { SellerFulfillmentStatus, ShipmentService } from '@/lib/shipment'
import type { Order } from '@/types/order'

export default function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
      <div>
        <h1 className="font-serif text-3xl">Customer orders</h1>
        <p className="text-sm text-muted-foreground">
          Paid orders only — update fulfillment status as you ship and deliver.
        </p>
      </div>

      {loading ? <LoadingState message="Loading orders..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => load()} retryLoading={loading} /> : null}

      {!loading && !error && orders.length === 0 ? (
        <EmptyState title="No paid orders yet." />
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <SellerPaidOrdersTable
          orders={orders}
          title="All paid orders"
          updatingOrderId={updatingId}
          onFulfillmentChange={(id, status, shipping) => void onStatusChange(id, status, shipping)}
        />
      ) : null}
    </div>
  )
}
