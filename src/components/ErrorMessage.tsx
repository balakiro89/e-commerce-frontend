import { Loader2 } from 'lucide-react'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
  retryLoading?: boolean
}

export function ErrorMessage({
  message = 'Something went wrong. Please try again.',
  onRetry,
  retryLoading = false,
}: ErrorMessageProps) {
  return (
    <div
      className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retryLoading}
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-2 disabled:opacity-50"
        >
          {retryLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          Try again
        </button>
      ) : null}
    </div>
  )
}
