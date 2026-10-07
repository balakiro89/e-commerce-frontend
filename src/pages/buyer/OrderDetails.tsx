import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { orderApi } from '@/api/order.api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { OptimizedImage } from '@/components/OptimizedImage'
import { PageBackLink } from '@/components/PageBackLink'
import { createEffectGuard } from '@/lib/effect-guard'
import { fetchOnce } from '@/lib/fetch-once'
import { OrderProgressStepper } from '@/components/OrderProgressStepper'
import { formatOrderIdDisplay, formatPaymentStatusLabel } from '@/lib/order-format'
import { formatFulfillmentStatusLabel } from '@/lib/shipment'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Order } from '@/types/order'

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const guard = createEffectGuard()
    setLoading(true)
    setError(null)
    fetchOnce(`order-${id}`, () => orderApi.getOrderById(id))
      .then((result) => {
        if (guard.isActive()) setOrder(result)
      })
      .catch(() => {
        if (guard.isActive()) setError('Something went wrong. Please try again.')
      })
      .finally(() => {
        if (guard.isActive()) setLoading(false)
      })
    return () => guard.cancel()
  }, [id])

  if (loading) return <LoadingState message="Loading order..." />
  if (error || !order) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error ?? 'Order not found.'} />
        <PageBackLink to="/orders" label="Back to orders" variant="outline" />
      </div>
    )
  }

  const address = order.shipping_address

  return (
    <div className="space-y-8">
      <PageBackLink to="/orders" label="Back to orders" variant="outline" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">{formatOrderIdDisplay(order.order_number)}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      {order.payment_status === 'PAID' ? (
        <section className="rounded-lg border border-border p-6">
          <h2 className="font-medium">Order progress</h2>
          <div className="mt-8">
            <OrderProgressStepper orderStatus={order.order_status} />
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-6">
          <h2 className="font-medium">Items</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item) => (
              <li key={item.product_id} className="flex gap-4 text-sm">
                <OptimizedImage
                  src={item.image_url}
                  alt=""
                  wrapperClassName="h-16 w-16 shrink-0 rounded"
                  className="object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-muted-foreground">
                    Qty {item.quantity} · {formatPrice(item.unit_price)}
                  </p>
                </div>
                <p className="font-medium">{formatPrice(item.subtotal)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-right font-semibold">
            Total: {formatPrice(order.total)}
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6 text-sm">
            <h2 className="font-medium">Payment & status</h2>
            <p className="mt-2">Payment: {formatPaymentStatusLabel(order.payment_status)}</p>
            <p>Status: {formatFulfillmentStatusLabel(order.order_status)}</p>
          </div>
          {order.tracking_id && order.shipment_service ? (
            <div className="rounded-lg border border-border p-6 text-sm">
              <h2 className="font-medium">Shipping information</h2>
              <dl className="mt-2 space-y-1 text-muted-foreground">
                <div>
                  <dt className="inline font-medium text-foreground">Tracking ID: </dt>
                  <dd className="inline">{order.tracking_id}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-foreground">Shipment service: </dt>
                  <dd className="inline">{order.shipment_service}</dd>
                </div>
              </dl>
            </div>
          ) : null}
          <div className="rounded-lg border border-border p-6 text-sm">
            <h2 className="font-medium">Shipping address</h2>
            <address className="mt-2 not-italic text-muted-foreground">
              {order.customer_name}
              <br />
              {address.address}
              <br />
              {address.city}, {address.state} {address.pincode}
              <br />
              {address.country}
            </address>
          </div>
        </div>
      </section>
    </div>
  )
}
