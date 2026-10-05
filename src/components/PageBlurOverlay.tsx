interface PageBlurOverlayProps {
  message?: string
}

export function PageBlurOverlay({ message = 'Please wait…' }: PageBlurOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-lg border border-border bg-card px-6 py-4 shadow-lg">
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  )
}
