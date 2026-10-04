import { Navigate, Outlet } from 'react-router-dom'
import { homePathForUser, isSellerUser } from '@/lib/user-type'
import { useAuthStore } from '@/store/auth.store'

export function SellerProtectedRoute() {
  const user = useAuthStore((s) => s.user)

  if (!isSellerUser(user)) {
    return <Navigate to={homePathForUser(user)} replace />
  }

  return <Outlet />
}
