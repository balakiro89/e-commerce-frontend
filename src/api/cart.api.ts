import api from '@/api/axios'

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
  validate: (items: CartValidateItem[]) =>
    api
      .post<CartValidateResponse>('/cart/validate', { items })
      .then((r) => r.data),
}
