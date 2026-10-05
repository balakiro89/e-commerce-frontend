import type { AxiosResponse } from 'axios'
import api from '@/api/axios'
import { isCartEnabledForCurrentUser } from '@/lib/cart-access'
import type { ServerCartPayload } from '@/lib/map-server-cart'

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

interface SuccessEnvelope<T> {
  success: boolean
  message: string
  data: T
}

function unwrapCart(response: AxiosResponse<SuccessEnvelope<ServerCartPayload>>): ServerCartPayload {
  return response.data.data
}

function assertCartApiEnabled(): void {
  if (!isCartEnabledForCurrentUser()) {
    throw new Error('Cart API is not available for seller accounts')
  }
}

export const cartApi = {
  getCart: () => {
    assertCartApiEnabled()
    return api.get<SuccessEnvelope<ServerCartPayload>>('/cart').then(unwrapCart)
  },

  addItem: (productId: string, quantity: number) => {
    assertCartApiEnabled()
    return api
      .post<SuccessEnvelope<ServerCartPayload>>('/cart/items', {
        product_id: productId,
        quantity,
      })
      .then(unwrapCart)
  },

  updateItem: (productId: string, quantity: number) => {
    assertCartApiEnabled()
    return api
      .patch<SuccessEnvelope<ServerCartPayload>>(`/cart/items/${productId}`, { quantity })
      .then(unwrapCart)
  },

  removeItem: (productId: string) => {
    assertCartApiEnabled()
    return api
      .delete<SuccessEnvelope<ServerCartPayload>>(`/cart/items/${productId}`)
      .then(unwrapCart)
  },

  clearCart: () => {
    assertCartApiEnabled()
    return api.delete<SuccessEnvelope<null>>('/cart').then(() => undefined)
  },

  validate: (items: CartValidateItem[]) => {
    assertCartApiEnabled()
    return api.post<CartValidateResponse>('/cart/validate', { items }).then((r) => r.data)
  },
}
