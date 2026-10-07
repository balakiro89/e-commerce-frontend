import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, ShoppingCart } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { signOut } from '@/lib/auth-session'
import { isSellerUser } from '@/lib/user-type'
import { useAuthStore } from '@/store/auth.store'
import { selectCartItemCount } from '@/store/cart.selectors'
import { useCartStore } from '@/store/cart.store'
import { SITE_HEADER_CLASS, siteHeaderNavLinkClass } from '@/lib/site-header'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
] as const

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const showCart = !isSellerUser(user)
  const cartCount = useCartStore(selectCartItemCount)

  const handleLogout = () => {
    void signOut().then(() => navigate('/login'))
  }

  return (
    <header className={SITE_HEADER_CLASS}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 [&_button]:text-header-foreground [&_button]:hover:bg-header-foreground/10">
        <BrandLogo to="/dashboard" nameClassName="text-header-foreground" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={siteHeaderNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {showCart ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/cart" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="sr-only">Cart</span>
                    {cartCount > 0 ? (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                        {cartCount}
                      </span>
                    ) : null}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cart</TooltipContent>
            </Tooltip>
          ) : null}

          {isAuthenticated ? <UserAccountMenu /> : null}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4" aria-label="Mobile">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-base font-medium text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {showCart ? (
                  <Link
                    to="/cart"
                    className="text-base font-medium text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                  </Link>
                ) : null}
                {isAuthenticated ? (
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
