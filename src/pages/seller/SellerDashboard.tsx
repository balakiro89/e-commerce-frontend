import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, RefreshCw, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react'
import { sellerApi } from '@/api/seller.api'
import { createEffectGuard } from '@/lib/effect-guard'
import { fetchOnce } from '@/lib/fetch-once'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import type { SellerDashboardStats } from '@/types/seller'
import { cn } from '@/lib/utils'

const REFRESH_MS = 15000

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (silent = false, isActive: () => boolean = () => true) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const data = silent
        ? await sellerApi.getDashboardStats()
        : await fetchOnce('seller-dashboard-stats', () => sellerApi.getDashboardStats())
      if (isActive()) setStats(data)
    } catch {
      if (isActive()) setError('Could not load dashboard stats.')
    } finally {
      if (isActive()) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    const guard = createEffectGuard()
    void load(false, guard.isActive)
    const timer = window.setInterval(() => {
      void load(true, guard.isActive)
    }, REFRESH_MS)
    return () => {
      guard.cancel()
      window.clearInterval(timer)
    }
  }, [load])

  if (loading && !stats) return <LoadingState message="Loading seller dashboard..." />

  const cards = [
    {
      title: "Today's orders",
      value: stats?.todays_orders ?? 0,
      icon: ShoppingBag,
      hint: 'Orders placed today',
    },
    {
      title: "Today's order value",
      value: formatPrice(stats?.todays_order_value ?? 0),
      icon: TrendingUp,
      hint: 'Revenue received today',
    },
    {
      title: 'Active products',
      value: stats?.active_products ?? 0,
      icon: Package,
      hint: 'Listed and active',
    },
    {
      title: 'Out-of-stock products',
      value: stats?.out_of_stock_products ?? 0,
      icon: AlertTriangle,
      hint: 'Needs restock',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Live seller dashboard</p>
          <h1 className="font-serif text-3xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Auto-refreshes every 15 seconds
            {stats?.as_of
              ? ` · Updated ${new Date(stats.as_of).toLocaleTimeString()}`
              : null}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={refreshing}
          onClick={() => void load(true)}
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Refresh now
        </Button>
      </div>

      {error ? <ErrorMessage message={error} onRetry={() => void load()} retryLoading={loading} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, hint }) => (
          <Card key={title} className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <Icon className="h-4 w-4 text-primary" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/seller/orders">Manage orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/seller/products">Manage products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/seller/products/new">Create product</Link>
        </Button>
      </div>
    </div>
  )
}
