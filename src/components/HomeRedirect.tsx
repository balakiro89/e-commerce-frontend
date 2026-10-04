import { Navigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { homePathForUser } from '@/lib/user-type'
import { useAuthStore } from '@/store/auth.store'

export function HomeRedirect() {
  const { isAuthenticated, user } = useAuthStore(
    useShallow((s) => ({ isAuthenticated: s.isAuthenticated, user: s.user })),
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={homePathForUser(user)} replace />
}
