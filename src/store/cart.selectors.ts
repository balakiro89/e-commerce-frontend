import type { CartState } from '@/store/cart.store'

export const selectCartItems = (s: CartState) => s.items

export const selectCartItemCount = (s: CartState) =>
  s.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCartSubtotal = (s: CartState) =>
  s.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
