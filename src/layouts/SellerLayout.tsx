import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { LoadingState } from '@/components/LoadingState'
import { SellerHeader } from '@/components/SellerHeader'

export function SellerLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SellerHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
