import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homePathForUser, isSellerUser } from '@/lib/user-type'
import { useAuthStore } from '@/store/auth.store'

/** Sellers may open buyer product pages to preview catalog items. */
function sellerMayAccessBuyerPath(pathname: string): boolean {
  return pathname === '/products' || /^\/products\/[^/]+$/.test(pathname)
}

export function BuyerProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const { pathname } = useLocation()

  if (isSellerUser(user) && !sellerMayAccessBuyerPath(pathname)) {
    return <Navigate to={homePathForUser(user)} replace />
  }

  return <Outlet />
}
