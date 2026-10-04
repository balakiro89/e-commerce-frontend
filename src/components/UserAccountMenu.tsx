import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { signOut } from '@/lib/auth-session'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

function userInitials(username: string): string {
  const parts = username.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

export function UserAccountMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }, [clearCloseTimer])

  const handleOpen = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  if (!user) return null

  const initials = userInitials(user.username)

  const handleLogout = () => {
    setOpen(false)
    void signOut().then(() => navigate('/login'))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('relative h-9 w-9 rounded-full p-0 hover:bg-accent')}
              aria-label={`Account menu for ${user.username}`}
              onMouseEnter={handleOpen}
              onMouseLeave={scheduleClose}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{user.username}</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        className="w-72"
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{user.username}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">{user.mobile}</p>
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
