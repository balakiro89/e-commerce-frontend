import { cartApi } from '@/api/cart.api'
import { isCartEnabledForCurrentUser } from '@/lib/cart-access'
import { mapServerCartToItems } from '@/lib/map-server-cart'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import type { Product } from '@/types/product'

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null
}

function applyServerCart(userId: string): Promise<void> {
  return cartApi.getCart().then((payload) => {
    useCartStore.getState().hydrateFromServer({
      userId,
      items: mapServerCartToItems(payload),
    })
  })
}

/** Load cart from API (buyers only). */
export async function refreshCartFromServer(): Promise<void> {
  const userId = currentUserId()
  if (!userId || !isCartEnabledForCurrentUser()) return
  await applyServerCart(userId)
}

/** After login: server wins; push local items only if server cart is empty. */
export async function syncCartWithServer(userId: string): Promise<void> {
  if (!isCartEnabledForCurrentUser()) return

  const payload = await cartApi.getCart()
  const serverItems = mapServerCartToItems(payload)
  const { items: localItems, cartOwnerId } = useCartStore.getState()
  const localBelongsToUser = cartOwnerId === null || cartOwnerId === userId

  if (serverItems.length === 0 && localItems.length > 0 && localBelongsToUser) {
    for (const item of localItems) {
      await cartApi.addItem(item.product.id, item.quantity)
    }
    await applyServerCart(userId)
    return
  }

  useCartStore.getState().hydrateFromServer({ userId, items: serverItems })
}

export async function addProductToCart(product: Product, quantity = 1): Promise<void> {
  const userId = currentUserId()
  if (!userId || !isCartEnabledForCurrentUser()) {
    useCartStore.getState().addItem(product, quantity)
    return
  }

  const payload = await cartApi.addItem(product.id, quantity)
  useCartStore.getState().hydrateFromServer({
    userId,
    items: mapServerCartToItems(payload),
  })
}

export async function updateCartLineQuantity(productId: string, quantity: number): Promise<void> {
  const userId = currentUserId()
  if (!userId || !isCartEnabledForCurrentUser()) {
    useCartStore.getState().updateQuantity(productId, quantity)
    return
  }

  if (quantity < 1) {
    await removeProductFromCart(productId)
    return
  }

  const payload = await cartApi.updateItem(productId, quantity)
  useCartStore.getState().hydrateFromServer({
    userId,
    items: mapServerCartToItems(payload),
  })
}

export async function removeProductFromCart(productId: string): Promise<void> {
  const userId = currentUserId()
  if (!userId || !isCartEnabledForCurrentUser()) {
    useCartStore.getState().removeItem(productId)
    return
  }

  const payload = await cartApi.removeItem(productId)
  useCartStore.getState().hydrateFromServer({
    userId,
    items: mapServerCartToItems(payload),
  })
}

export async function clearServerCart(): Promise<void> {
  const userId = currentUserId()
  if (!userId || !isCartEnabledForCurrentUser()) {
    useCartStore.getState().clearCart()
    return
  }

  await cartApi.clearCart()
  useCartStore.getState().hydrateFromServer({ userId, items: [] })
}
