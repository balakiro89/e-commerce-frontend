import { memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LoadingButton } from '@/components/ui/loading-button'
import { OptimizedImage } from '@/components/OptimizedImage'
import { productPrimaryImageUrl } from '@/lib/product-images'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'
import { isSellerUser } from '@/lib/user-type'
import { useAuthStore } from '@/store/auth.store'
import { addProductToCart } from '@/lib/cart-actions'
import { useActionLoading } from '@/hooks/use-action-loading'

interface ProductCardProps {
  product: Product
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const thumbnail = productPrimaryImageUrl(product.image_urls, product.image_url)
  const user = useAuthStore((s) => s.user)
  const showCartActions = !isSellerUser(user)
  const { loading, run } = useActionLoading()
  const inStock = product.stock > 0

  const handleAdd = useCallback(() => {
    void run(async () => {
      await addProductToCart(product)
    })
  }, [product, run])

  return (
    <Card className="flex flex-col overflow-hidden pt-0 [content-visibility:auto] [contain-intrinsic-size:320px]">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-muted">
        <OptimizedImage
          src={thumbnail}
          alt={product.name}
          className="object-cover"
          wrapperClassName="aspect-[4/3] h-full w-full"
        />
      </Link>
      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <div>
          <Link
            to={`/products/${product.id}`}
            className="font-medium text-foreground no-underline hover:text-primary"
          >
            {product.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.short_description}
          </p>
        </div>
        <p className="text-lg font-semibold text-foreground">{formatPrice(product.price)}</p>
        <p className="text-xs text-muted-foreground">
          {inStock ? 'In stock' : 'Out of stock'}
        </p>
      </CardContent>
      <CardFooter className="gap-2 pb-4">
        {showCartActions ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <LoadingButton
                type="button"
                size="icon"
                className="shrink-0"
                disabled={!inStock}
                loading={loading}
                aria-label="Add to cart"
                onClick={handleAdd}
              >
                <ShoppingBag className="h-4 w-4" />
              </LoadingButton>
            </TooltipTrigger>
            <TooltipContent>Add to cart</TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0" asChild>
              <Link to={`/products/${product.id}`} aria-label="View details">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View details</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  )
})
