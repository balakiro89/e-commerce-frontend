import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const inrCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatPrice(amount: number): string {
  return inrCurrencyFormatter.format(amount)
}

export function formatDate(date: string): string {
  return inDateFormatter.format(new Date(date))
}

/** Date and time in local timezone, e.g. "06 Oct 2026, 09:30 PM" */
export function formatDateTime(date: string): string {
  const d = new Date(date)
  const parts = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const time = `${part('hour').padStart(2, '0')}:${part('minute')} ${part('dayPeriod').toUpperCase()}`
  return `${inDateFormatter.format(d)}, ${time}`
}
