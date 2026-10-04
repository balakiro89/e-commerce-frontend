import { cn } from '@/lib/utils'

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('h-4 w-4', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-4 w-4', className)} fill="currentColor">
      <path d="M13.5 8.5H15V6h-1.5C11.57 6 10.5 7.34 10.5 9v1.5H9v2.5h1.5V18h2.5v-5H15l.5-2.5h-2z" />
    </svg>
  )
}
