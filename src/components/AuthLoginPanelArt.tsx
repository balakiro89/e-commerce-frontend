import { AuthPanelArt, type AuthPanelArtProps } from '@/components/AuthPanelArt'
import { authArtByRoute } from '@/data/auth-art'

type AuthPanelArtLegacyProps = Omit<AuthPanelArtProps, 'title' | 'subtitle'> & {
  variant?: keyof typeof authArtByRoute
}

/** @deprecated Use AuthPanelArt with title/subtitle */
export function AuthLoginPanelArt({ variant = 'login', ...props }: AuthPanelArtLegacyProps) {
  const art = authArtByRoute[variant]
  return <AuthPanelArt {...props} title={art.title} subtitle={art.subtitle} />
}
