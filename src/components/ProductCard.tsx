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
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'
import { useCartStore } from '@/store/cart.store'
import { useActionLoading } from '@/hooks/use-action-loading'

interface ProductCardProps {
  product: Product
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const { loading, run } = useActionLoading()
  const inStock = product.stock > 0

  const handleAdd = useCallback(() => {
    void run(async () => {
      addItem(product)
    })
  }, [addItem, product, run])

  return (
    <Card className="flex flex-col overflow-hidden pt-0">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
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
