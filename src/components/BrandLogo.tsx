import { Link } from 'react-router-dom'
import { COMPANY_LOGO_URL, COMPANY_NAME } from '@/data/brand'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  to?: string
  showName?: boolean
  className?: string
  imageClassName?: string
  nameClassName?: string
}

export function BrandLogo({
  to = '/dashboard',
  showName = true,
  className,
  imageClassName,
  nameClassName,
}: BrandLogoProps) {
  const content = (
    <>
      <img
        src={COMPANY_LOGO_URL}
        alt={`${COMPANY_NAME} logo`}
        className={cn('h-10 w-10 shrink-0 rounded-md object-contain', imageClassName)}
      />
      {showName ? (
        <span
          className={cn(
            'font-serif text-lg font-semibold tracking-tight text-foreground',
            nameClassName,
          )}
        >
          {COMPANY_NAME}
        </span>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn('inline-flex items-center gap-2.5', className)}
      >
        {content}
      </Link>
    )
  }

  return <div className={cn('inline-flex items-center gap-2.5', className)}>{content}</div>
}
