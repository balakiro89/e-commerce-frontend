import api from '@/api/axios'
import { isLocalCatalogSession } from '@/lib/local-auth'
import { useSellerCatalogStore } from '@/store/seller-catalog.store'
import type { Order, OrderStatus } from '@/types/order'
import type {
  SellerDashboardStats,
  SellerProduct,
  SellerProductInput,
} from '@/types/seller'

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function computeStats(products: SellerProduct[], orders: Order[]): SellerDashboardStats {
  const todayStart = startOfToday()
  const todaysOrders = orders.filter((o) => new Date(o.created_at) >= todayStart)
  return {
    todays_orders: todaysOrders.length,
    todays_order_value: todaysOrders.reduce((sum, o) => sum + o.total, 0),
    active_products: products.filter((p) => p.is_active).length,
    out_of_stock_products: products.filter((p) => p.stock <= 0).length,
    as_of: new Date().toISOString(),
  }
}

function localStore() {
  const store = useSellerCatalogStore.getState()
  store.ensureSeeded()
  return store
}

export const sellerApi = {
  getDashboardStats: async (): Promise<SellerDashboardStats> => {
    if (isLocalCatalogSession()) {
      const store = localStore()
      return computeStats(store.listProducts(), store.listOrders())
    }
    const response = await api.get<SellerDashboardStats>('/seller/dashboard/stats')
    return response.data
  },

  getOrders: async (): Promise<Order[]> => {
    if (isLocalCatalogSession()) {
      return localStore().listOrders()
    }
    const response = await api.get<Order[]>('/seller/orders')
    return response.data
  },

  updateOrderStatus: async (orderId: string, order_status: OrderStatus) => {
    if (isLocalCatalogSession()) {
      localStore().updateOrderStatus(orderId, order_status)
      return
    }
    await api.patch(`/seller/orders/${orderId}`, { order_status })
  },

  getProducts: async (): Promise<SellerProduct[]> => {
    if (isLocalCatalogSession()) {
      return localStore().listProducts()
    }
    const response = await api.get<SellerProduct[]>('/seller/products')
    return response.data
  },

  getProductById: async (id: string): Promise<SellerProduct> => {
    if (isLocalCatalogSession()) {
      const product = localStore().getProduct(id)
      if (!product) throw new Error('Product not found')
      return product
    }
    const response = await api.get<SellerProduct>(`/seller/products/${id}`)
    return response.data
  },

  createProduct: async (input: SellerProductInput) => {
    if (isLocalCatalogSession()) {
      return localStore().createProduct(input)
    }
    const response = await api.post<SellerProduct>('/seller/products', input)
    return response.data
  },

  updateProduct: async (id: string, input: SellerProductInput) => {
    if (isLocalCatalogSession()) {
      const updated = localStore().updateProduct(id, input)
      if (!updated) throw new Error('Product not found')
      return updated
    }
    const response = await api.put<SellerProduct>(`/seller/products/${id}`, input)
    return response.data
  },

  deleteProduct: async (id: string) => {
    if (isLocalCatalogSession()) {
      localStore().deleteProduct(id)
      return
    }
    await api.delete(`/seller/products/${id}`)
  },
}
