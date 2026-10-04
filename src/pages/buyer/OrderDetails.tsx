import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { orderApi } from '@/api/order.api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { PageBackLink } from '@/components/PageBackLink'
import { createEffectGuard } from '@/lib/effect-guard'
import { cn, formatDate, formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/order'

const STATUS_STEPS: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
]

function OrderProgress({ status }: { status: OrderStatus }) {
  const activeIndex =
    status === 'CANCELLED'
      ? -1
      : STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number])

  return (
    <ol
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Order progress"
    >
      {STATUS_STEPS.map((step, index) => {
        const completed = activeIndex >= index
        const current = activeIndex === index
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium',
                completed
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground',
                current && 'ring-2 ring-ring ring-offset-2',
              )}
              aria-current={current ? 'step' : undefined}
            >
              {index + 1}
            </span>
            <span className="text-xs sm:text-sm">
              {step.charAt(0) + step.slice(1).toLowerCase()}
            </span>
            {index < STATUS_STEPS.length - 1 ? (
              <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

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
    orderApi
      .getOrderById(id)
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
          <h1 className="font-serif text-3xl">Order #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-border p-6">
        <h2 className="font-medium">Order progress</h2>
        <div className="mt-6">
          <OrderProgress status={order.order_status} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-6">
          <h2 className="font-medium">Items</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item) => (
              <li key={item.product_id} className="flex gap-4 text-sm">
                <img
                  src={item.image_url}
                  alt=""
                  className="h-16 w-16 rounded object-cover"
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
            <p className="mt-2">Payment: {order.payment_status}</p>
            <p>Status: {order.order_status}</p>
          </div>
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
