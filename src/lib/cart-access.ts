import { useAuthStore } from '@/store/auth.store'
import { isSellerUser } from '@/lib/user-type'

/** Cart is buyer-only; sellers must not trigger cart API traffic. */
export function isCartEnabledForCurrentUser(): boolean {
  const user = useAuthStore.getState().user
  if (!user) return true
  return !isSellerUser(user)
}
