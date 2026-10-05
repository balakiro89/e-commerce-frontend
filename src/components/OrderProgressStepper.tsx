import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order'

const STEPS = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'] as const

/** Highest completed step index (0–3) from fulfillment status after payment. */
function completedStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'DELIVERED':
      return 3
    case 'SHIPPED':
      return 2
    case 'PROCESSING':
    case 'CONFIRMED':
      return 1
    case 'CANCELLED':
      return -1
    default:
      return 0
  }
}

interface OrderProgressStepperProps {
  orderStatus: OrderStatus
}

export function OrderProgressStepper({ orderStatus }: OrderProgressStepperProps) {
  const completedThrough = completedStepIndex(orderStatus)
  if (completedThrough < 0) {
    return <p className="text-sm text-muted-foreground">This order was cancelled.</p>
  }

  return (
    <ol
      className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:gap-0"
      aria-label="Order progress"
    >
      {STEPS.map((label, index) => {
        const completed = index <= completedThrough
        const current =
          completedThrough < STEPS.length - 1 && index === completedThrough + 1
        const segmentFilled = (segmentIndex: number) => segmentIndex < completedThrough

        return (
          <li key={label} className="flex flex-1 flex-col items-center sm:min-w-0">
            <div className="flex w-full items-center">
              {index > 0 ? (
                <span
                  className={cn(
                    'hidden h-0.5 flex-1 sm:block',
                    segmentFilled(index - 1) ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              ) : (
                <span className="hidden flex-1 sm:block" aria-hidden />
              )}
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground',
                  current && !completed && 'border-primary text-primary',
                )}
                aria-current={current ? 'step' : undefined}
              >
                {index + 1}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    'hidden h-0.5 flex-1 sm:block',
                    segmentFilled(index) ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              ) : (
                <span className="hidden flex-1 sm:block" aria-hidden />
              )}
            </div>
            <span
              className={cn(
                'mt-2 px-1 text-center text-xs font-medium sm:text-sm',
                completed ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
