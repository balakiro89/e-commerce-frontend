import { cn } from '@/lib/utils'

export const SITE_HEADER_CLASS =
  'app-site-header sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--header)_90%,transparent)]'

export function siteHeaderNavLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'text-sm font-medium transition-colors hover:text-primary',
    isActive ? 'text-primary' : 'text-header-foreground/80',
  )
}
