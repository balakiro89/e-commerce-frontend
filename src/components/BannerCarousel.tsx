import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bannerSlides } from '@/data/banners'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 6500

export function BannerCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slides = useMemo(
    () => (Array.isArray(bannerSlides) ? bannerSlides : []),
    [],
  )
  const total = slides.length || 1

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + total) % total)
    },
    [total],
  )

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, total])

  useEffect(() => {
    if (slides.length === 0) return
    const preload = (i: number) => {
      const url = slides[i]?.imageUrl
      if (!url) return
      const img = new Image()
      img.src = url
    }
    preload((index + 1) % total)
    preload((index - 1 + total) % total)
  }, [index, slides, total])

  const slide = slides[index] ?? slides[0]
  if (!slide) return null

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm"
      aria-roledescription="carousel"
      aria-label="Featured art categories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid min-h-0 md:min-h-[360px] lg:min-h-[400px] lg:grid-cols-2">
        <div
          key={`copy-${slide.id}`}
          className="animate-dashboard-slide-enter relative order-2 flex flex-col justify-center gap-4 bg-gradient-to-br from-secondary/40 to-background p-6 pb-16 sm:p-8 sm:pb-16 md:p-10 md:pb-10 lg:order-1"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Art categories
          </p>
          <h2 className="font-serif text-2xl leading-tight text-foreground sm:text-3xl lg:text-4xl">
            {slide.title}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {slide.subtitle}
          </p>
          <p className="text-sm font-medium text-primary/90 italic">
            Limited pieces · Curated for creators like you
          </p>
          <div className="pt-1">
            <Button asChild className="h-11 rounded-full px-6">
              <Link to={slide.ctaHref}>{slide.ctaLabel}</Link>
            </Button>
          </div>
        </div>

        <div
          key={`img-${slide.id}`}
          className="animate-dashboard-slide-enter relative order-1 min-h-[220px] sm:min-h-[280px] lg:order-2 lg:min-h-full"
        >
          <img
            src={slide.imageUrl}
            alt={slide.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/5"
            aria-hidden
          />
        </div>
      </div>

      <div
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-4"
        role="tablist"
        aria-label="Slide indicators"
      >
        {slides.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to ${item.title}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-primary' : 'w-2 bg-primary/35 hover:bg-primary/50',
            )}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute left-2 top-[38%] h-9 w-9 rounded-full bg-background/90 shadow-sm backdrop-blur-sm sm:left-3 md:top-1/2 md:-translate-y-1/2"
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute right-2 top-[38%] h-9 w-9 rounded-full bg-background/90 shadow-sm backdrop-blur-sm sm:right-3 md:top-1/2 md:-translate-y-1/2"
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </section>
  )
}
