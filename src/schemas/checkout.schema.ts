import { z } from 'zod'

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Enter a valid email address'),
  customer_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  country: z.string().min(2, 'Country is required'),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
