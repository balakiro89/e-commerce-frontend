import { Loader2, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface QuantitySelectorProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  loading?: boolean
}

export function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  loading,
}: QuantitySelectorProps) {
  const isDisabled = disabled || loading

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label="Quantity">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={isDisabled || value <= min}
            onClick={() => onChange(Math.max(min, value - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Decrease quantity</TooltipContent>
      </Tooltip>
      <span className="min-w-[2rem] text-center text-sm font-medium" aria-live="polite">
        {value}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={isDisabled || value >= max}
            onClick={() => onChange(Math.min(max, value + 1))}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Increase quantity</TooltipContent>
      </Tooltip>
    </div>
  )
}
