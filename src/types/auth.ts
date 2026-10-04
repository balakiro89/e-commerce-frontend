export type UserType = 'buyer' | 'seller'

export interface User {
  id: string
  username: string
  email: string
  mobile: string
  /** @deprecated Prefer user_type */
  role: 'BUYER' | 'SELLER'
  user_type: UserType
}

export interface AuthResponse {
  user: User
  access_token: string
}

export interface EmailCheckResponse {
  exists: boolean
}
