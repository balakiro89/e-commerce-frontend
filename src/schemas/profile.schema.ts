import { z } from 'zod'

export const profileSchema = z
  .object({
    username: z
      .string()
      .min(2, 'Username must be at least 2 characters')
      .max(50, 'Username is too long'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6
      }
      return true
    },
    { message: 'Password must be at least 6 characters', path: ['password'] },
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword
      }
      return true
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  )

export type ProfileFormValues = z.infer<typeof profileSchema>
