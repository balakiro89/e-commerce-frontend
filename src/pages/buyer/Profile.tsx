import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/api/auth.api'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorMessage } from '@/components/ErrorMessage'
import { PageBackLink } from '@/components/PageBackLink'
import { LoadingState } from '@/components/LoadingState'
import { profileSchema, type ProfileFormValues } from '@/schemas/profile.schema'
import { createEffectGuard } from '@/lib/effect-guard'
import { useAuthStore } from '@/store/auth.store'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const localSession = useAuthStore((s) => s.localSession)
  const setUser = useAuthStore((s) => s.setUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (localSession && user) {
      reset({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
      })
      setLoading(false)
      return
    }
    const guard = createEffectGuard()
    authApi
      .getProfile()
      .then((profile) => {
        if (!guard.isActive()) return
        reset({
          username: profile.username,
          email: profile.email,
          password: '',
          confirmPassword: '',
        })
        setUser(profile)
      })
      .catch(() => {
        if (guard.isActive()) setError('Could not load profile.')
      })
      .finally(() => {
        if (guard.isActive()) setLoading(false)
      })
    return () => guard.cancel()
  }, [localSession, reset, setUser, user])

  const onSubmit = async (values: ProfileFormValues) => {
    setError(null)
    setSuccess(null)
    try {
      if (localSession && user) {
        setUser({
          ...user,
          username: values.username,
          email: values.email,
        })
        reset({
          username: values.username,
          email: values.email,
          password: '',
          confirmPassword: '',
        })
        setSuccess('Profile updated successfully.')
        return
      }
      const payload: Partial<ProfileFormValues> = {
        username: values.username,
        email: values.email,
      }
      if (values.password) payload.password = values.password
      const updated = await authApi.updateProfile(payload)
      setUser(updated)
      reset({
        username: updated.username,
        email: updated.email,
        password: '',
        confirmPassword: '',
      })
      setSuccess('Profile updated successfully.')
    } catch {
      setError('Could not update profile. Please try again.')
    }
  }

  if (loading) return <LoadingState message="Loading profile..." />

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageBackLink to="/dashboard" label="Back to dashboard" />
      <div>
        <h1 className="font-serif text-3xl">Profile</h1>
        {user?.mobile ? (
          <p className="text-sm text-muted-foreground">Mobile: {user.mobile}</p>
        ) : null}
      </div>

      {error ? <ErrorMessage message={error} /> : null}
      {success ? (
        <p className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm" role="status">
          {success}
        </p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register('username')} />
          {errors.username ? (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password (optional)</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <LoadingButton type="submit" loading={isSubmitting} loadingText="Saving…">
          Save changes
        </LoadingButton>
      </form>
    </div>
  )
}
