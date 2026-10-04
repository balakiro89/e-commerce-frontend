import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DASHBOARD_BANNER_URL, COMPANY_NAME } from '@/data/brand'

export function DashboardHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-[#eef1ec] via-background to-secondary/40 shadow-[0_12px_40px_rgba(22,56,40,0.06)]">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-primary/[0.05] blur-3xl"
        aria-hidden
      />

      <div className="relative grid items-stretch lg:grid-cols-2">
        <div className="animate-auth-field-enter order-2 flex flex-col justify-center gap-4 px-6 py-8 sm:px-8 sm:py-10 lg:order-1 lg:py-12 lg:pl-10 lg:pr-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Welcome to {COMPANY_NAME}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Art that inspires · Supplies that deliver
            </p>
            <h2 className="font-serif text-3xl font-semibold leading-[1.15] text-primary sm:text-4xl lg:text-[2.65rem]">
              Create boldly.
              <br />
              <span className="text-foreground/90">Collect beautifully.</span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              From Tanjore gold foil to watercolor dreams and studio-grade materials — everything
              you need to turn blank canvas into legacy.
            </p>
          </div>
          <div>
            <Button asChild className="h-11 rounded-full px-6 text-base shadow-sm">
              <Link to="/products">
                Shop all collections
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="animate-auth-field-enter auth-stagger-1 relative order-1 lg:order-2">
          <Link
            to="/products"
            className="relative block aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto lg:min-h-[320px]"
          >
            <img
              src={DASHBOARD_BANNER_URL}
              alt="Epic Vault — curated art and supplies for creators"
              className="h-full w-full object-cover object-[center_55%] sm:object-right transition-transform duration-500 hover:scale-[1.02]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#eef1ec] lg:via-[#eef1ec]/40 lg:to-transparent"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
