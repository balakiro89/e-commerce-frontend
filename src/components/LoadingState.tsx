import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  compact?: boolean
}

export function LoadingState({
  message = 'Loading...',
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className={
        compact
          ? 'flex items-center justify-center gap-2 py-6 text-muted-foreground'
          : 'flex min-h-[12rem] flex-col items-center justify-center gap-3 text-muted-foreground'
      }
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">{message}</p>
    </div>
  )
}
