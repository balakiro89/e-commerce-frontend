import api from '@/api/axios'
import { asArray } from '@/lib/arrays'
import { isLocalCatalogSession } from '@/lib/local-auth'
import type { CreateOrderPayload, CreateOrderResponse, Order } from '@/types/order'

export const orderApi = {
  getOrders: async () => {
    if (isLocalCatalogSession()) return [] as Order[]
    const response = await api.get<unknown>('/orders')
    return asArray<Order>(response.data)
  },

  getOrderById: async (id: string) => {
    if (isLocalCatalogSession()) throw new Error('Order not found')
    const response = await api.get<Order>(`/orders/${id}`)
    return response.data
  },

  createOrder: (payload: CreateOrderPayload) =>
    api.post<CreateOrderResponse>('/orders', payload).then((r) => r.data),
}
