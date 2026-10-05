import { useEffect } from 'react'
import { syncCartWithServer } from '@/lib/cart-actions'
import { fetchOnce } from '@/lib/fetch-once'
import { isCartEnabledForCurrentUser } from '@/lib/cart-access'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'

/** Assigns guest cart to a buyer on login; clears cart when a different buyer signs in. */
export function CartOwnerSync() {
  const userId = useAuthStore((s) => s.user?.id ?? null)

  useEffect(() => {
    useCartStore.getState().syncOwner(userId)
    if (userId && isCartEnabledForCurrentUser()) {
      void fetchOnce(`cart-sync-${userId}`, () => syncCartWithServer(userId))
    }
  }, [userId])

  return null
}
