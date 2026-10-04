import api from '@/api/axios'
import type { AuthResponse, EmailCheckResponse, User } from '@/types/auth'
import type { ProfileFormValues } from '@/schemas/profile.schema'

export interface LoginPayload {
  email_or_mobile: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  mobile: string
  password: string
}

export interface ResetPasswordPayload {
  email: string
  password: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  checkEmail: (email: string) =>
    api
      .post<EmailCheckResponse>('/auth/forgot-password/check', { email })
      .then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post('/auth/forgot-password/reset', payload).then((r) => r.data),

  getProfile: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (payload: Partial<ProfileFormValues>) =>
    api.put<User>('/auth/profile', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout'),
}
