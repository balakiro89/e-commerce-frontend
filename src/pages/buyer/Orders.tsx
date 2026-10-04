import { useCallback, useEffect, useState } from 'react'
import { createEffectGuard } from '@/lib/effect-guard'
import { orderApi } from '@/api/order.api'
import { OrderCard } from '@/components/OrderCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { PageBackLink } from '@/components/PageBackLink'
import { asArray } from '@/lib/arrays'
import type { Order } from '@/types/order'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((isActive: () => boolean = () => true) => {
    setLoading(true)
    setError(null)
    orderApi
      .getOrders()
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

  return (
    <div className="space-y-6">
      <PageBackLink to="/dashboard" label="Back to dashboard" />
      <h1 className="font-serif text-3xl">My Orders</h1>
      {loading ? <LoadingState message="Loading orders..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => load()} retryLoading={loading} /> : null}
      {!loading && !error && (orders?.length ?? 0) === 0 ? (
        <EmptyState title="You have no orders yet." />
      ) : null}
      {!loading && !error && (orders?.length ?? 0) > 0 ? (
        <div className="space-y-4">
          {(orders ?? []).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
