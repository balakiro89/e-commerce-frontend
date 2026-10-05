import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { LoadingButton } from '@/components/ui/loading-button'
import { RequiredLabel } from '@/components/RequiredLabel'
import { COMPANY_NAME } from '@/data/brand'
import { Input } from '@/components/ui/input'
import { ErrorMessage } from '@/components/ErrorMessage'
import { getApiErrorMessage } from '@/lib/api-error'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema'
import { cn } from '@/lib/utils'

const inputClass =
  'h-11 rounded-lg border-border/80 bg-muted/30 transition-all duration-200 focus:bg-background focus:shadow-sm'

const fieldClass = 'space-y-2.5'

export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
      await authApi.register({
        username: values.username,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
      })
      navigate('/login', { replace: true, state: { registered: true } })
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
        <div className={fieldClass}>
          <RequiredLabel htmlFor="username" className="font-semibold text-foreground">
            Username
          </RequiredLabel>
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
        <div className={fieldClass}>
          <RequiredLabel htmlFor="email" className="font-semibold text-foreground">
            Email
          </RequiredLabel>
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
        <div className={fieldClass}>
          <RequiredLabel htmlFor="mobile" className="font-semibold text-foreground">
            Mobile number
          </RequiredLabel>
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
        <div className={fieldClass}>
          <RequiredLabel htmlFor="password" className="font-semibold text-foreground">
            Password
          </RequiredLabel>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a password"
              className={cn(inputClass, 'pl-10 pr-10', errors.password && 'border-destructive')}
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
