import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorMessage } from '@/components/ErrorMessage'
import { COMPANY_NAME } from '@/data/brand'
import {
  forgotEmailSchema,
  forgotPasswordSchema,
  type ForgotEmailFormValues,
  type ForgotPasswordFormValues,
} from '@/schemas/auth.schema'
import { cn } from '@/lib/utils'

type Step = 'email' | 'reset' | 'not_found' | 'success'

const inputClass =
  'h-11 rounded-lg border-border/80 bg-muted/30 transition-all duration-200 focus:bg-background focus:shadow-sm'

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const emailForm = useForm<ForgotEmailFormValues>({
    resolver: zodResolver(forgotEmailSchema),
  })

  const resetForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const checkEmail = async (values: ForgotEmailFormValues) => {
    setError(null)
    try {
      const result = await authApi.checkEmail(values.email)
      setEmail(values.email)
      if (result.exists) {
        resetForm.reset({ email: values.email, password: '', confirmPassword: '' })
        setStep('reset')
      } else {
        setStep('not_found')
      }
    } catch {
      setError('Unable to verify email. Please try again.')
    }
  }

  const updatePassword = async (values: ForgotPasswordFormValues) => {
    setError(null)
    try {
      await authApi.resetPassword({
        email: values.email,
        password: values.password,
      })
      setStep('success')
    } catch {
      setError('Could not update password. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-auth-field-enter space-y-2 text-center lg:text-left">
        <h1 className="font-serif text-[2rem] font-semibold leading-tight text-primary">Forgot password</h1>
        <p className="text-sm text-muted-foreground">Reset your {COMPANY_NAME} password securely</p>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      {step === 'email' ? (
        <form onSubmit={emailForm.handleSubmit(checkEmail)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-foreground">
              Email address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={cn(
                  inputClass,
                  'pl-10',
                  emailForm.formState.errors.email && 'border-destructive',
                )}
                {...emailForm.register('email')}
              />
            </div>
            {emailForm.formState.errors.email ? (
              <p className="text-sm text-destructive">
                {emailForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <LoadingButton
            type="submit"
            className="group h-11 w-full rounded-full text-base font-medium"
            loading={emailForm.formState.isSubmitting}
            loadingText="Checking email…"
          >
            Check Email
            <ArrowRight className="h-4 w-4" />
          </LoadingButton>
        </form>
      ) : null}

      {step === 'not_found' ? (
        <div className="space-y-4 text-center lg:text-left">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find an account with this email address.
          </p>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep('email')}>
            Try another email
          </Button>
        </div>
      ) : null}

      {step === 'reset' ? (
        <form onSubmit={resetForm.handleSubmit(updatePassword)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="font-semibold text-foreground">
              Email address
            </Label>
            <Input id="reset-email" value={email} readOnly disabled className={inputClass} />
            <input type="hidden" {...resetForm.register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-semibold text-foreground">
              New password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                className={cn(inputClass, 'pl-10', resetForm.formState.errors.password && 'border-destructive')}
                {...resetForm.register('password')}
              />
            </div>
            {resetForm.formState.errors.password ? (
              <p className="text-sm text-destructive">
                {resetForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password" className="font-semibold text-foreground">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm new password"
                className={cn(
                  inputClass,
                  'pl-10',
                  resetForm.formState.errors.confirmPassword && 'border-destructive',
                )}
                {...resetForm.register('confirmPassword')}
              />
            </div>
            {resetForm.formState.errors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
          <LoadingButton
            type="submit"
            className="group h-11 w-full rounded-full text-base font-medium"
            loading={resetForm.formState.isSubmitting}
            loadingText="Updating password…"
          >
            Update Password
            <ArrowRight className="h-4 w-4" />
          </LoadingButton>
        </form>
      ) : null}

      {step === 'success' ? (
        <div className="space-y-4 text-center lg:text-left">
          <p className="text-sm text-muted-foreground">
            Your password has been updated. You can sign in with your new password.
          </p>
          <Button asChild className="rounded-full">
            <Link to="/login">Back to Login</Link>
          </Button>
        </div>
      ) : null}

      {step !== 'success' ? (
        <p className="text-center text-sm lg:text-left">
          <Link to="/login" className="font-medium text-primary no-underline hover:underline">
            Back to Login
          </Link>
        </p>
      ) : null}
    </div>
  )
}
