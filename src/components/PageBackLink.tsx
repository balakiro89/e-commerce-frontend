import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PageBackLinkProps {
  to: string
  label: string
  variant?: 'ghost' | 'outline'
  className?: string
}

export function PageBackLink({
  to,
  label,
  variant = 'ghost',
  className,
}: PageBackLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size="sm" asChild className={cn('w-fit', className)}>
          <Link to={to}>
            <ArrowLeft className="h-4 w-4" />
            {label}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
