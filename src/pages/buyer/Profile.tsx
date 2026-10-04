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
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/store/auth.store'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
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
    const guard = createEffectGuard()
    authApi
      .getProfile()
      .then((profile) => {
        if (!guard.isActive()) return
        reset({
          username: profile.username,
          email: profile.email,
          mobile: profile.mobile,
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
  }, [reset, setUser])

  const onSubmit = async (values: ProfileFormValues) => {
    setError(null)
    setSuccess(null)
    try {
      const updated = await authApi.updateProfile({
        username: values.username,
        email: values.email,
        mobile: values.mobile,
      })
      setUser(updated)
      reset({
        username: updated.username,
        email: updated.email,
        mobile: updated.mobile,
      })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update profile. Please try again.'))
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
          <Label htmlFor="mobile">Mobile</Label>
          <Input id="mobile" {...register('mobile')} />
          {errors.mobile ? (
            <p className="text-sm text-destructive">{errors.mobile.message}</p>
          ) : null}
        </div>
        <LoadingButton type="submit" loading={isSubmitting} loadingText="Saving…">
          Save changes
        </LoadingButton>
      </form>
    </div>
  )
}
