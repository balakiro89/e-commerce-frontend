import { COMPANY_NAME } from '@/data/brand'

export const APP_NAME = COMPANY_NAME

const staticTitles: Record<string, string> = {
  '/login': 'Login',
  '/register': 'Create Account',
  '/forgot-password': 'Forgot Password',
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/cart': 'Cart',
  '/checkout': 'Checkout',
  '/orders': 'Orders',
  '/profile': 'Profile',
  '/seller/dashboard': 'Seller Dashboard',
  '/seller/orders': 'Seller Orders',
  '/seller/products': 'Seller Products',
  '/seller/products/new': 'Create Product',
}

export function getPageTitle(pathname: string): string {
  if (staticTitles[pathname]) return staticTitles[pathname]
  if (/^\/products\/[^/]+$/.test(pathname)) return 'Product Details'
  if (/^\/orders\/[^/]+$/.test(pathname)) return 'Order Details'
  if (/^\/seller\/products\/[^/]+\/edit$/.test(pathname)) return 'Edit Product'
  return APP_NAME
}

export function formatDocumentTitle(pathname: string): string {
  const page = getPageTitle(pathname)
  return page === APP_NAME ? APP_NAME : `${page} - ${APP_NAME}`
}
