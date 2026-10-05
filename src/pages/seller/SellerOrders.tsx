import { useCallback, useEffect, useState } from 'react'
import { createEffectGuard } from '@/lib/effect-guard'
import { fetchOnce } from '@/lib/fetch-once'
import { sellerApi } from '@/api/seller.api'
import { PageBackLink } from '@/components/PageBackLink'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/order'

const STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

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

  const onStatusChange = async (orderId: string, order_status: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      await sellerApi.updateOrderStatus(orderId, order_status)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status } : o)),
      )
    } catch {
      setError('Could not update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageBackLink to="/seller/dashboard" label="Back to dashboard" />
      <div>
        <h1 className="font-serif text-3xl">Customer orders</h1>
        <p className="text-sm text-muted-foreground">View and update order fulfillment status.</p>
      </div>

      {loading ? <LoadingState message="Loading orders..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => load()} retryLoading={loading} /> : null}

      {!loading && !error && orders.length === 0 ? (
        <EmptyState title="No orders yet." />
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <h2 className="font-semibold">Order {order.order_number}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)} · {order.customer_name} · {order.customer_email}
                  </p>
                  <p className="text-sm">
                    Total: <span className="font-medium">{formatPrice(order.total)}</span> · Payment:{' '}
                    {order.payment_status}
                  </p>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.product_id}`}>
                        {item.product_name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full max-w-xs space-y-2">
                  <p className="text-sm font-medium">Order status</p>
                  <Select
                    value={order.order_status}
                    disabled={updatingId === order.id}
                    onValueChange={(v) => void onStatusChange(order.id, v as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
