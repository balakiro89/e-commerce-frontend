import type * as React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type RequiredLabelProps = React.ComponentProps<typeof Label> & {
  optional?: boolean
}

/** Form label with a red asterisk for required fields. */
export function RequiredLabel({ children, className, optional, ...props }: RequiredLabelProps) {
  return (
    <Label className={cn(className)} {...props}>
      {children}
      {!optional ? (
        <span className="text-destructive" aria-hidden>
          {' '}
          *
        </span>
      ) : null}
    </Label>
  )
}
