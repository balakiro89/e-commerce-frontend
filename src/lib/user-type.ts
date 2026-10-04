import type { User } from '@/types/auth'

export function isSellerUser(user: User | null | undefined): boolean {
  if (!user) return false
  if (user.user_type === 'seller') return true
  return user.role === 'SELLER'
}

export function homePathForUser(user: User | null | undefined): string {
  return isSellerUser(user) ? '/seller/dashboard' : '/dashboard'
}

export function normalizeUser(raw: User): User {
  const user_type =
    raw.user_type ?? (raw.role === 'SELLER' ? 'seller' : 'buyer')
  const role = user_type === 'seller' ? 'SELLER' : 'BUYER'
  return { ...raw, user_type, role }
}
