import api from '@/api/axios'
import { asArray } from '@/lib/arrays'
import type { CreateOrderPayload, CreateOrderResponse, Order } from '@/types/order'

export const orderApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<unknown>('/orders')
    return asArray<Order>(response.data)
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`)
    return response.data
  },

  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>('/orders', payload)
    return response.data
  },
}
