import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'

/** Keeps persisted cart scoped to the signed-in buyer. */
export function CartOwnerSync() {
  const userId = useAuthStore((s) => s.user?.id ?? null)

  useEffect(() => {
    useCartStore.getState().syncOwner(userId)
  }, [userId])

  return null
}
