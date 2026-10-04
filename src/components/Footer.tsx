import { Mail } from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '@/components/icons/SocialIcons'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { COMPANY_WEBSITE, SOCIAL_LINKS } from '@/data/brand'

const footerLinks = [
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact us', href: '#contact' },
  { label: 'Cancellation and returns', href: '#cancellation-returns' },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={SOCIAL_LINKS.email} aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Gmail</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Instagram</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Facebook</TooltipContent>
          </Tooltip>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
          aria-label="Footer links"
        >
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap no-underline hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="shrink-0 whitespace-nowrap">
          {year} {COMPANY_WEBSITE}
        </p>
      </div>
    </footer>
  )
}
