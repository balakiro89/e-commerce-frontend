import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { COMPANY_LOGO_URL } from '@/data/brand'
import { formatDocumentTitle } from '@/lib/page-titles'

const FAVICON_ID = 'bk-enterprises-favicon'

function ensureFavicon() {
  let link = document.querySelector<HTMLLinkElement>(`link#${FAVICON_ID}`)
  if (!link) {
    link = document.createElement('link')
    link.id = FAVICON_ID
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/jpeg'
  link.href = COMPANY_LOGO_URL
}

export function useDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    ensureFavicon()
    document.title = formatDocumentTitle(pathname)
  }, [pathname])
}
