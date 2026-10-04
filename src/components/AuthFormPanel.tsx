import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthFormPanelProps {
  children: ReactNode
  mobileBanner?: ReactNode
  className?: string
}

export function AuthFormPanel({ children, mobileBanner, className }: AuthFormPanelProps) {
  return (
    <div
      className={cn(
        'relative isolate flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto bg-[#eceee9] px-4 py-4 sm:px-8 sm:py-6',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/4 rounded-full bg-primary/[0.04] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto my-auto flex w-full min-h-0 max-w-[420px] flex-col justify-center gap-4 py-2">
        {mobileBanner}
        <Card className="animate-auth-card-enter shrink-0 rounded-2xl border border-border/40 bg-card shadow-[0_12px_40px_rgba(22,56,40,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(22,56,40,0.09)]">
          <CardContent className="p-6 sm:p-9">{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
