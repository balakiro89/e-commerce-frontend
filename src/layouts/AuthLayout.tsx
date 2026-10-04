import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/LoadingState'
import { AuthArtPanel } from '@/components/AuthArtPanel'
import { AuthFormPanel } from '@/components/AuthFormPanel'
import { AuthMobileBanner } from '@/components/AuthMobileBanner'
import { authArtByRoute } from '@/data/auth-art'

type AuthVariant = keyof typeof authArtByRoute

function authVariant(pathname: string): AuthVariant {
  if (pathname.includes('register')) return 'register'
  if (pathname.includes('forgot-password')) return 'forgotPassword'
  return 'login'
}

export function AuthLayout() {
  const { pathname } = useLocation()
  const variant = authVariant(pathname)

  return (
    <div className="h-svh max-h-svh overflow-hidden bg-background">
      <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <AuthArtPanel variant={variant} />
        <AuthFormPanel
          className="min-w-0"
          mobileBanner={<AuthMobileBanner variant={variant} />}
        >
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </AuthFormPanel>
      </div>
    </div>
  )
}
