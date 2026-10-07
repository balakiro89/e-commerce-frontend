import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { UserAccountMenu } from '@/components/UserAccountMenu'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { signOut } from '@/lib/auth-session'
import { SITE_HEADER_CLASS, siteHeaderNavLinkClass } from '@/lib/site-header'

export function SellerHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const navItems = [
    { to: '/seller/dashboard', label: 'Dashboard' },
    { to: '/seller/orders', label: 'Orders' },
    { to: '/seller/products', label: 'Products' },
  ]

  const handleLogout = () => {
    void signOut().then(() => navigate('/login'))
  }

  return (
    <header className={SITE_HEADER_CLASS}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 [&_button]:text-header-foreground [&_button]:hover:bg-header-foreground/10">
        <BrandLogo to="/seller/dashboard" nameClassName="text-header-foreground" />

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex" aria-label="Seller">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={siteHeaderNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <UserAccountMenu />

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Seller menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4" aria-label="Mobile seller">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-base font-medium text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
