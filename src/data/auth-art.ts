import { COMPANY_NAME } from './brand'

export const authArtByRoute = {
  login: {
    alt: `${COMPANY_NAME} sign in artwork`,
    title: 'Welcome back',
    subtitle: 'Sign in to explore curated art and supplies crafted for creators.',
  },
  register: {
    alt: `${COMPANY_NAME} registration artwork`,
    title: `Join ${COMPANY_NAME}`,
    subtitle: 'Create a buyer account and discover paintings, materials, and more.',
  },
  forgotPassword: {
    alt: `${COMPANY_NAME} password reset artwork`,
    title: 'Reset your password',
    subtitle: `Secure access to your ${COMPANY_NAME} account.`,
  },
} as const
