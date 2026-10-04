import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Lock, Mail, Phone, User } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { LoadingButton } from '@/components/ui/loading-button'
import { COMPANY_NAME } from '@/data/brand'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorMessage } from '@/components/ErrorMessage'
import { getApiErrorMessage } from '@/lib/api-error'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema'
import { homePathForUser, normalizeUser } from '@/lib/user-type'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const inputClass =
  'h-11 rounded-lg border-border/80 bg-muted/30 transition-all duration-200 focus:bg-background focus:shadow-sm'

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null)
    try {
      const data = await authApi.register({
        username: values.username,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
      })
      const user = normalizeUser(data.user)
      login(user, data.access_token)
      navigate(homePathForUser(user), { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create account. Please check your details and try again.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-auth-field-enter space-y-2 text-center lg:text-left">
        <h1 className="font-serif text-[2rem] font-semibold leading-tight text-primary">Create account</h1>
        <p className="text-sm text-muted-foreground">Join {COMPANY_NAME} as a buyer</p>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="username" className="font-semibold text-foreground">
            Username
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="username"
              autoComplete="username"
              placeholder="Choose a username"
              className={cn(inputClass, 'pl-10', errors.username && 'border-destructive')}
              {...register('username')}
            />
          </div>
          {errors.username ? (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className={cn(inputClass, 'pl-10', errors.email && 'border-destructive')}
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile" className="font-semibold text-foreground">
            Mobile number
          </Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="mobile"
              type="tel"
              autoComplete="tel"
              placeholder="Enter mobile number"
              className={cn(inputClass, 'pl-10', errors.mobile && 'border-destructive')}
              {...register('mobile')}
            />
          </div>
          {errors.mobile ? (
            <p className="text-sm text-destructive">{errors.mobile.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="font-semibold text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className={cn(inputClass, 'pl-10', errors.password && 'border-destructive')}
              {...register('password')}
            />
          </div>
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-semibold text-foreground">
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              className={cn(inputClass, 'pl-10', errors.confirmPassword && 'border-destructive')}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <LoadingButton
          type="submit"
          className="group h-11 w-full rounded-full text-base font-medium"
          loading={isSubmitting}
          loadingText="Creating account…"
        >
          Create New Account
          <ArrowRight className="h-4 w-4" />
        </LoadingButton>
      </form>

      <p className="text-center text-sm text-muted-foreground lg:text-left">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary no-underline hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
