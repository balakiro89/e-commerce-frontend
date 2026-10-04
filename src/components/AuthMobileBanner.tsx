import { AUTH_PANEL_IMAGE } from '@/data/brand'
import { authArtByRoute } from '@/data/auth-art'
import { AuthPanelArt } from '@/components/AuthPanelArt'

type AuthArtKey = keyof typeof authArtByRoute

interface AuthMobileBannerProps {
  variant: AuthArtKey
}

export function AuthMobileBanner({ variant }: AuthMobileBannerProps) {
  const art = authArtByRoute[variant]

  return (
    <AuthPanelArt
      imageSrc={AUTH_PANEL_IMAGE}
      imageAlt={art.alt}
      title={art.title}
      subtitle={art.subtitle}
      compact
      className="relative h-[min(12rem,28vh)] shrink-0 rounded-xl border border-border/40 lg:hidden"
    />
  )
}
