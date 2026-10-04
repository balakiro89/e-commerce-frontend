import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { Input } from '@/components/ui/input'
import { RequiredLabel } from '@/components/RequiredLabel'
import { LoadingButton } from '@/components/ui/loading-button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { getApiErrorMessage } from '@/lib/api-error'
import { homePathForUser, normalizeUser } from '@/lib/user-type'
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema'
import { useAuthStore } from '@/store/auth.store'
import { COMPANY_NAME } from '@/data/brand'
import { cn } from '@/lib/utils'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setError(null)
    try {
      const data = await authApi.login({
        email_or_mobile: values.email_or_mobile,
        password: values.password,
      })
      const user = normalizeUser(data.user)
      login(user, data.access_token)
      navigate(homePathForUser(user), { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email/mobile or password.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-auth-field-enter space-y-2 text-center lg:text-left">
        <h1 className="font-serif text-[2rem] font-semibold leading-tight text-primary">Sign in</h1>
        <p className="text-sm text-muted-foreground">Welcome back to {COMPANY_NAME}</p>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="animate-auth-field-enter auth-stagger-1 space-y-2">
          <RequiredLabel htmlFor="email_or_mobile" className="font-semibold text-foreground">
            Email or mobile
          </RequiredLabel>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200" />
            <Input
              id="email_or_mobile"
              autoComplete="username"
              placeholder="you@example.com or 9876543210"
              className={cn(
                'h-11 rounded-lg border-border/80 bg-muted/30 pl-10 transition-all duration-200 focus:bg-background focus:shadow-sm',
                errors.email_or_mobile && 'border-destructive',
              )}
              {...register('email_or_mobile')}
            />
          </div>
          {errors.email_or_mobile ? (
            <p className="text-sm text-destructive">{errors.email_or_mobile.message}</p>
          ) : null}
        </div>

        <div className="animate-auth-field-enter auth-stagger-2 space-y-2">
          <RequiredLabel htmlFor="password" className="font-semibold text-foreground">
            Password
          </RequiredLabel>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={cn(
                'h-11 rounded-lg border-border/80 bg-muted/30 pl-10 pr-10 transition-all duration-200 focus:bg-background focus:shadow-sm',
                errors.password && 'border-destructive',
              )}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="animate-auth-field-enter auth-stagger-3">
          <LoadingButton
            type="submit"
            className="group h-11 w-full rounded-full text-base font-medium transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            loading={isSubmitting}
            loadingText="Signing in…"
          >
            Login
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </LoadingButton>
        </div>
      </form>

      <div className="animate-auth-field-enter auth-stagger-4 flex flex-col gap-3 text-center text-sm lg:text-left">
        <Link
          to="/forgot-password"
          className="font-medium text-primary no-underline transition-opacity duration-200 hover:opacity-80 hover:underline"
        >
          Forgot Password
        </Link>
        <p className="text-muted-foreground">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary no-underline transition-opacity duration-200 hover:opacity-80 hover:underline"
          >
            Create New Account
          </Link>
        </p>
      </div>
    </div>
  )
}
