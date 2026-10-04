import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  localSession: boolean
  login: (user: User, token: string, options?: { local?: boolean }) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      localSession: false,
      login: (user, token, options) =>
        set({
          user,
          token,
          isAuthenticated: true,
          localSession: options?.local ?? false,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          localSession: false,
        }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'art-gallery-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        localSession: state.localSession,
      }),
    },
  ),
)
