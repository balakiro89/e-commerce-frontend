import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

export async function signOut(): Promise<void> {
  try {
    await authApi.logout()
  } catch {
    // Clear local session even if the server call fails.
  }
  useAuthStore.getState().logout()
}
