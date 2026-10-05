import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShoppingBag, Zap } from 'lucide-react'
import { productApi } from '@/api/product.api'
import { createEffectGuard } from '@/lib/effect-guard'
import { fetchOnce } from '@/lib/fetch-once'
import { QuantitySelector } from '@/components/QuantitySelector'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { PageBackLink } from '@/components/PageBackLink'
import { LoadingButton } from '@/components/ui/loading-button'
import { isSellerUser } from '@/lib/user-type'
import { formatPrice } from '@/lib/utils'
import { PRODUCT_TYPE_LABELS, type Product } from '@/types/product'
import { useAuthStore } from '@/store/auth.store'
import { addProductToCart } from '@/lib/cart-actions'
import { useActionLoading } from '@/hooks/use-action-loading'
import { ProductMediaGallery } from '@/components/ProductMediaGallery'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const sellerView = isSellerUser(user)
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { loading: adding, run: runAdd } = useActionLoading()
  const { loading: buying, run: runBuy } = useActionLoading()

  useEffect(() => {
    if (!id) return
    const guard = createEffectGuard()
    setLoading(true)
    setError(null)
    fetchOnce(`product-${id}`, () => productApi.getProductById(id))
      .then((p) => {
        if (!guard.isActive()) return
        setProduct(p)
        setQuantity(1)
      })
      .catch(() => {
        if (guard.isActive()) setError('Something went wrong. Please try again.')
      })
      .finally(() => {
        if (guard.isActive()) setLoading(false)
      })
    return () => guard.cancel()
  }, [id])

  if (loading) return <LoadingState message="Loading product..." />
  if (error || !product) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error ?? 'Product not found.'} />
        <PageBackLink
          to={sellerView ? '/seller/products' : '/products'}
          label={sellerView ? 'Back to product list' : 'Back to products'}
          variant="outline"
        />
      </div>
    )
  }

  const inStock = product.stock > 0

  return (
    <div className="space-y-6">
      <PageBackLink
        to={sellerView ? '/seller/products' : '/products'}
        label={sellerView ? 'Back to product list' : 'Back to products'}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductMediaGallery
          productName={product.name}
          imageUrl={product.image_url}
          imageUrls={product.image_urls}
          videoUrl={product.video_url}
        />
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {PRODUCT_TYPE_LABELS[product.product_type]}
            </p>
            <h1 className="font-serif text-3xl">{product.name}</h1>
            <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
          </div>
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          {sellerView ? (
            <p className="text-sm">
              <span className="font-medium text-foreground">Quantity: </span>
              <span className="text-muted-foreground">{product.stock}</span>
            </p>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium">Quantity</p>
                <QuantitySelector
                  value={quantity}
                  max={Math.max(product.stock, 1)}
                  onChange={setQuantity}
                  disabled={!inStock || adding || buying}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <LoadingButton
                  type="button"
                  size="lg"
                  className="sm:min-w-[160px]"
                  disabled={!inStock || buying}
                  loading={adding}
                  loadingText="Adding…"
                  onClick={() => {
                    void runAdd(async () => {
                      await addProductToCart(product, quantity)
                    })
                  }}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </LoadingButton>
                <LoadingButton
                  type="button"
                  size="lg"
                  variant="outline"
                  className="border-primary/30 sm:min-w-[160px]"
                  disabled={!inStock || adding}
                  loading={buying}
                  loadingText="Redirecting…"
                  onClick={() => {
                    void runBuy(async () => {
                      await addProductToCart(product, quantity)
                      navigate('/checkout')
                    })
                  }}
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </LoadingButton>
              </div>
            </>
          )}
          <p className="text-sm">
            {inStock ? (
              <span className="text-primary">✓ In Stock</span>
            ) : (
              <span className="text-destructive">Out of Stock</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
