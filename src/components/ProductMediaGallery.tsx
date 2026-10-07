import { useCallback, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { normalizeProductImageUrls } from '@/lib/product-images'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ProductMediaGalleryProps {
  productName: string
  imageUrl: string
  imageUrls?: string[]
  videoUrl?: string
  className?: string
}

export function ProductMediaGallery({
  productName,
  imageUrl,
  imageUrls,
  videoUrl,
  className,
}: ProductMediaGalleryProps) {
  const images = useMemo(
    () => normalizeProductImageUrls(imageUrls, imageUrl),
    [imageUrl, imageUrls],
  )

  const [index, setIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  const multiple = images.length > 1
  const safeIndex = Math.min(index, Math.max(0, images.length - 1))
  const activeSrc = images[safeIndex] ?? imageUrl

  const goTo = useCallback(
    (next: number) => {
      setShowVideo(false)
      if (images.length === 0) return
      setIndex((next + images.length) % images.length)
    },
    [images.length],
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30 p-3 sm:min-h-[360px]">
        {showVideo && videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            className="max-h-[min(70vh,520px)] w-full bg-black object-contain"
          />
        ) : (
          <img
            key={activeSrc}
            src={activeSrc}
            alt={`${productName}${multiple ? ` — image ${safeIndex + 1} of ${images.length}` : ''}`}
            className="max-h-[min(70vh,520px)] w-full object-contain"
            decoding="async"
          />
        )}

        {multiple && !showVideo ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/90 shadow-sm backdrop-blur-sm"
              onClick={() => goTo(safeIndex - 1)}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/90 shadow-sm backdrop-blur-sm"
              onClick={() => goTo(safeIndex + 1)}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>

      {multiple && !showVideo ? (
        <div
          className="flex justify-center gap-2"
          role="tablist"
          aria-label={`${productName} image carousel`}
        >
          {images.map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-200',
                i === safeIndex ? 'w-6 bg-primary' : 'w-2 bg-primary/35 hover:bg-primary/50',
              )}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      ) : null}

      {(multiple || videoUrl) && (
        <div className="flex gap-2 overflow-x-auto pb-1 touch-pan-x">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              className={cn(
                'relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 sm:h-16 sm:w-16',
                !showVideo && i === safeIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border opacity-90 hover:opacity-100',
              )}
              onClick={() => {
                setShowVideo(false)
                setIndex(i)
              }}
              aria-label={`View image ${i + 1}`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
          {videoUrl ? (
            <button
              type="button"
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-md border-2 bg-black/80 sm:h-16 sm:w-16',
                showVideo ? 'border-primary ring-2 ring-primary/20' : 'border-border',
              )}
              onClick={() => setShowVideo(true)}
              aria-label="View product video"
            >
              <Play className="h-5 w-5 text-white" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
