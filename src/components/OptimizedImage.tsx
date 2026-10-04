import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type OptimizedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** When true, loads immediately (LCP / hero). */
  priority?: boolean
  wrapperClassName?: string
}

/**
 * Image with async decode, lazy loading, and a lightweight skeleton until loaded.
 */
export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setLoaded(false)
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [src])

  return (
    <span className={cn('relative block overflow-hidden bg-muted', wrapperClassName)}>
      {!loaded ? (
        <span
          className="absolute inset-0 animate-pulse bg-muted-foreground/10"
          aria-hidden
        />
      ) : null}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={(e) => {
          setLoaded(true)
          onLoad?.(e)
        }}
        className={cn(
          'h-full w-full transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        {...props}
      />
    </span>
  )
}
