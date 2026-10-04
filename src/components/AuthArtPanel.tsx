import { authArtByRoute } from '@/data/auth-art'
import { AUTH_PANEL_IMAGE } from '@/data/brand'
import { AuthPanelArt } from '@/components/AuthPanelArt'

type AuthArtKey = keyof typeof authArtByRoute

interface AuthArtPanelProps {
  variant: AuthArtKey
}

export function AuthArtPanel({ variant }: AuthArtPanelProps) {
  const art = authArtByRoute[variant]

  return (
    <aside
      className="relative hidden min-h-0 min-w-0 overflow-hidden bg-primary lg:sticky lg:top-0 lg:block lg:h-svh lg:max-h-svh"
      aria-label={art.alt}
    >
      <AuthPanelArt
        imageSrc={AUTH_PANEL_IMAGE}
        imageAlt={art.alt}
        title={art.title}
        subtitle={art.subtitle}
        className="relative h-full w-full"
      />
    </aside>
  )
}
