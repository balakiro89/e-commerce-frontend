import { memo, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/QuantitySelector'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { OptimizedImage } from '@/components/OptimizedImage'
import { productPrimaryImageUrl } from '@/lib/product-images'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types/cart'
import { removeProductFromCart, updateCartLineQuantity } from '@/lib/cart-actions'
import { useActionLoading } from '@/hooks/use-action-loading'

interface CartItemProps {
  item: CartItemType
}

export const CartItem = memo(function CartItem({ item }: CartItemProps) {
  const { loading: qtyLoading, run: runQty } = useActionLoading()
  const { loading: removeLoading, run: runRemove } = useActionLoading()
  const thumbnail = productPrimaryImageUrl(item.product.image_urls, item.product.image_url)
  const subtotal = item.product.price * item.quantity
  const productId = item.product.id

  const onQuantityChange = useCallback(
    (qty: number) => {
      void runQty(async () => {
        await updateCartLineQuantity(productId, qty)
      })
    },
    [productId, runQty],
  )

  const onRemove = useCallback(() => {
    void runRemove(async () => {
      await removeProductFromCart(productId)
    })
  }, [productId, runRemove])

  return (
    <div className="flex flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-center">
      <OptimizedImage
        src={thumbnail}
        alt={item.product.name}
        wrapperClassName="h-24 w-24 shrink-0 rounded-md"
        className="object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">
          Unit: {formatPrice(item.product.price)}
        </p>
      </div>
      <QuantitySelector
        value={item.quantity}
        max={item.product.stock}
        disabled={qtyLoading || removeLoading}
        loading={qtyLoading}
        onChange={onQuantityChange}
      />
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <p className="font-medium">{formatPrice(subtotal)}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive"
              disabled={removeLoading || qtyLoading}
              aria-label="Remove from cart"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove from cart</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
})
