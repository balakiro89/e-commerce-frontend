import api from '@/api/axios'
import type { Order, OrderStatus } from '@/types/order'
import type {
  SellerDashboardStats,
  SellerProduct,
  SellerProductInput,
} from '@/types/seller'

export const sellerApi = {
  getDashboardStats: async (): Promise<SellerDashboardStats> => {
    const response = await api.get<SellerDashboardStats>('/seller/dashboard/stats')
    return response.data
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/seller/orders')
    return response.data
  },

  updateOrderStatus: async (orderId: string, order_status: OrderStatus): Promise<Order> => {
    const response = await api.patch<Order>(`/seller/orders/${orderId}`, { order_status })
    return response.data
  },

  getProducts: async (): Promise<SellerProduct[]> => {
    const response = await api.get<SellerProduct[]>('/seller/products')
    return response.data
  },

  getProductById: async (id: string): Promise<SellerProduct> => {
    const response = await api.get<SellerProduct>(`/seller/products/${id}`)
    return response.data
  },

  createProduct: async (input: SellerProductInput): Promise<SellerProduct> => {
    const response = await api.post<SellerProduct>('/seller/products', input)
    return response.data
  },

  updateProduct: async (id: string, input: SellerProductInput): Promise<SellerProduct> => {
    const response = await api.put<SellerProduct>(`/seller/products/${id}`, input)
    return response.data
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/seller/products/${id}`)
  },
}
