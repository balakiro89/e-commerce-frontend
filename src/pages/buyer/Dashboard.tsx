import { useCallback, useEffect, useState } from 'react'
import { createEffectGuard } from '@/lib/effect-guard'
import { Link } from 'react-router-dom'
import { productApi } from '@/api/product.api'
import { BannerCarousel } from '@/components/BannerCarousel'
import { DashboardHero } from '@/components/DashboardHero'
import { ProductGrid } from '@/components/ProductGrid'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/ui/button'
import { COMPANY_NAME } from '@/data/brand'
import { useAuthStore } from '@/store/auth.store'
import { fetchOnce } from '@/lib/fetch-once'
import type { Product } from '@/types/product'

function greetingName(username: string | undefined): string {
  if (!username?.trim()) return 'Creator'
  const name = username.trim()
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((isActive: () => boolean = () => true) => {
    setLoading(true)
    setError(null)
    fetchOnce('dashboard-featured-products', () =>
      productApi.getProducts({ page: 1, limit: 5 }),
    ).then((data) => {
        if (!isActive()) return
        const items = data?.items
        setProducts(Array.isArray(items) ? items : [])
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

  const displayName = greetingName(user?.username)

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <header className="animate-auth-field-enter space-y-1">
        <p className="text-sm font-medium text-primary">Hello, {displayName}</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Your {COMPANY_NAME} studio is open
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Discover handpicked art and pro supplies — scroll the spotlight carousel or explore
          featured pieces below.
        </p>
      </header>

      <DashboardHero />

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Spotlight collections
          </p>
          <h2 className="font-serif text-xl text-foreground sm:text-2xl">
            Stories told in color &amp; gold
          </h2>
        </div>
        <BannerCarousel />
      </section>

      <section className="space-y-6 rounded-2xl border border-border/50 bg-card/50 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Featured for you
            </p>
            <h2 className="font-serif text-2xl text-foreground">Pieces worth the wall space</h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              Fresh picks from our catalog — originals and materials chosen for quality and character.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 rounded-full" asChild>
            <Link to="/products">Show all products</Link>
          </Button>
        </div>

        {loading ? <LoadingState message="Loading products..." /> : null}
        {error ? (
          <ErrorMessage message={error} onRetry={() => load()} retryLoading={loading} />
        ) : null}
        {!loading && !error && (products?.length ?? 0) === 0 ? (
          <EmptyState title="No products found." />
        ) : null}
        {!loading && !error && (products?.length ?? 0) > 0 ? (
          <ProductGrid products={products ?? []} />
        ) : null}
      </section>
    </div>
  )
}
