import api from '@/api/axios'
import { isCartEnabledForCurrentUser } from '@/lib/cart-access'

export interface CartValidateItem {
  product_id: string
  quantity: number
}

export interface CartValidateResponse {
  valid: boolean
  total: number
  items: {
    product_id: string
    quantity: number
    unit_price: number
    subtotal: number
    in_stock: boolean
  }[]
}

export const cartApi = {
  validate: (items: CartValidateItem[]) => {
    if (!isCartEnabledForCurrentUser()) {
      return Promise.reject(new Error('Cart validation is not available for seller accounts'))
    }
    return api.post<CartValidateResponse>('/cart/validate', { items }).then((r) => r.data)
  },
}
