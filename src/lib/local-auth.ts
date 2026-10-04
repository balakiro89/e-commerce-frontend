import type { User } from '@/types/auth'
import { useAuthStore } from '@/store/auth.store'

export const LOCAL_AUTH_TOKEN = 'local-session'

const SELLER_USERNAMES = new Set(['seller', 'seller@epicvalut.com'])

export function isLocalSellerCredentials(username: string): boolean {
  const key = username.trim().toLowerCase()
  return SELLER_USERNAMES.has(key) || key.startsWith('seller.')
}

/** True when the app should use frontend mock data instead of the API. */
export function isLocalCatalogSession(): boolean {
  const { localSession, token } = useAuthStore.getState()
  return (
    localSession === true ||
    token === LOCAL_AUTH_TOKEN ||
    !import.meta.env.VITE_API_URL
  )
}

export function createLocalUser(username: string): User {
  const trimmed = username.trim()
  const slug = trimmed.toLowerCase().replace(/\s+/g, '.')
  return {
    id: 'local-user',
    username: trimmed,
    email: `${slug}@local.dev`,
    mobile: '9000000000',
    role: 'BUYER',
    user_type: 'buyer',
  }
}

export function createLocalSellerUser(username: string): User {
  const trimmed = username.trim()
  const slug = trimmed.toLowerCase().replace(/\s+/g, '.')
  return {
    id: 'local-seller',
    username: trimmed,
    email: slug.includes('@') ? slug : `${slug}@epicvalut.com`,
    mobile: '9111111111',
    role: 'SELLER',
    user_type: 'seller',
  }
}
