import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { CartItem } from '@/components/CartItem'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingState } from '@/components/LoadingState'
import { PageBackLink } from '@/components/PageBackLink'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { createEffectGuard } from '@/lib/effect-guard'
import { clearServerCart, refreshCartFromServer } from '@/lib/cart-actions'
import { fetchOnce } from '@/lib/fetch-once'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatPrice } from '@/lib/utils'
import { selectCartItems, selectCartSubtotal } from '@/store/cart.selectors'
import { useCartStore } from '@/store/cart.store'
import { useActionLoading } from '@/hooks/use-action-loading'

export default function Cart() {
  const items = useCartStore(selectCartItems)
  const subtotal = useCartStore(selectCartSubtotal)
  const { loading: clearing, run: runClear } = useActionLoading()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const guard = createEffectGuard()
    setLoading(true)
    setError(null)
    fetchOnce('buyer-cart-page', () => refreshCartFromServer())
      .catch(() => {
        if (guard.isActive()) setError('Could not load your cart. Please try again.')
      })
      .finally(() => {
        if (guard.isActive()) setLoading(false)
      })
    return () => guard.cancel()
  }, [])

  if (loading) {
    return <LoadingState message="Loading your cart..." />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageBackLink to="/products" label="Back to products" />
        <h1 className="font-serif text-3xl">Shopping Cart</h1>
        <ErrorMessage message={error} />
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <PageBackLink to="/products" label="Back to products" />
        <h1 className="font-serif text-3xl">Shopping Cart</h1>
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-base font-medium text-foreground">Your cart is empty</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Browse our collection and add artwork you love.
          </p>
          <Button asChild className="mt-2">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageBackLink to="/products" label="Back to products" />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-serif text-3xl">Shopping Cart</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <LoadingButton
                type="button"
                variant="outline"
                size="icon"
                loading={clearing}
                aria-label="Clear cart"
                onClick={() => {
                  void runClear(async () => {
                    await clearServerCart()
                  })
                }}
              >
                <Trash2 className="h-4 w-4" />
              </LoadingButton>
            </TooltipTrigger>
            <TooltipContent>Clear cart</TooltipContent>
          </Tooltip>
        </div>
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>
      <Card className="h-fit">
        <CardContent className="p-6">
          <h2 className="font-medium">Cart summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
          </dl>
          <Button className="mt-6 w-full" asChild>
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
