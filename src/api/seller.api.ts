import api from '@/api/axios'
import { normalizeProductFromApi } from '@/lib/product-images'
import type { Order, OrderStatus } from '@/types/order'
import type {
  SellerDashboardStats,
  SellerProduct,
  SellerProductInput,
} from '@/types/seller'

export type SellerMediaUploadResult = {
  url: string
  r2_key: string
  file_name: string
}

export const sellerApi = {
  uploadMedia: async (file: File, kind: 'IMAGE' | 'VIDEO' = 'IMAGE'): Promise<SellerMediaUploadResult> => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    const response = await api.post<SellerMediaUploadResult>('/seller/uploads', form)
    return response.data
  },

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
    return response.data.map((p) => normalizeProductFromApi(p) as SellerProduct)
  },

  getProductById: async (id: string): Promise<SellerProduct> => {
    const response = await api.get<SellerProduct>(`/seller/products/${id}`)
    return normalizeProductFromApi(response.data) as SellerProduct
  },

  createProduct: async (input: SellerProductInput): Promise<SellerProduct> => {
    const response = await api.post<SellerProduct>('/seller/products', input)
    return normalizeProductFromApi(response.data) as SellerProduct
  },

  updateProduct: async (id: string, input: SellerProductInput): Promise<SellerProduct> => {
    const response = await api.put<SellerProduct>(`/seller/products/${id}`, input)
    return normalizeProductFromApi(response.data) as SellerProduct
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/seller/products/${id}`)
  },
}
