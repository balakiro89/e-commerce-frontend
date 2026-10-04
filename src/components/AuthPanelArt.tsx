import { Leaf } from 'lucide-react'
import { COMPANY_LOGO_URL, COMPANY_NAME, COMPANY_TAGLINE } from '@/data/brand'
import { cn } from '@/lib/utils'

export interface AuthPanelArtProps {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle: string
  className?: string
  imageClassName?: string
  showBranding?: boolean
  compact?: boolean
}

/** Auth sidebar: shared artwork with app logo and route-specific heading copy. */
export function AuthPanelArt({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  className,
  imageClassName,
  showBranding = true,
  compact = false,
}: AuthPanelArtProps) {
  return (
    <div className={cn('relative overflow-hidden bg-primary', className)}>
      <img
        src={imageSrc}
        alt={imageAlt}
        draggable={false}
        className={cn(
          'pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center',
          imageClassName,
        )}
      />

      {showBranding ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 z-10 flex flex-col items-center text-center text-primary-foreground',
            compact ? 'top-[6%] gap-1 px-3' : 'top-[8%] gap-3 px-6 sm:top-[10%]',
          )}
        >
          <img
            src={COMPANY_LOGO_URL}
            alt={`${COMPANY_NAME} logo`}
            className={cn(
              'rounded-full object-cover shadow-lg',
              compact ? 'h-14 w-14' : 'h-[5.5rem] w-[5.5rem] sm:h-24 sm:w-24',
            )}
          />
          {!compact ? (
            <>
              <p className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</p>
              <div className="flex w-full max-w-xs items-center gap-3 opacity-90">
                <span className="h-px flex-1 bg-primary-foreground/50" aria-hidden />
                <Leaf className="h-3.5 w-3.5 text-primary-foreground/75" aria-hidden />
                <span className="h-px flex-1 bg-primary-foreground/50" aria-hidden />
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-primary-foreground/90 sm:text-sm">
                {subtitle}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
                {COMPANY_TAGLINE}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
