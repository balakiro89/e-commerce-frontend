import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedSellerOrders, seedSellerProducts } from '@/data/mock-seller-seed'
import type { Order, OrderStatus } from '@/types/order'
import type { SellerProduct, SellerProductInput } from '@/types/seller'

interface SellerCatalogState {
  products: SellerProduct[]
  orders: Order[]
  initialized: boolean
  ensureSeeded: () => void
  listProducts: () => SellerProduct[]
  getProduct: (id: string) => SellerProduct | undefined
  createProduct: (input: SellerProductInput) => SellerProduct
  updateProduct: (id: string, input: SellerProductInput) => SellerProduct | null
  deleteProduct: (id: string) => void
  listOrders: () => Order[]
  updateOrderStatus: (id: string, status: OrderStatus) => void
}

function toSellerProduct(input: SellerProductInput, id: string): SellerProduct {
  const image_url = input.image_urls[0] ?? '/banners/category-watercolor-art.jpg'
  return {
    id,
    name: input.name,
    short_description: input.short_description,
    description: input.description,
    price: input.price,
    stock: input.stock,
    product_type: input.product_type,
    is_active: input.is_active,
    image_url,
    image_urls: input.image_urls.length ? input.image_urls : [image_url],
    video_url: input.video_url,
    updated_at: new Date().toISOString(),
  }
}

export const useSellerCatalogStore = create<SellerCatalogState>()(
  persist(
    (set, get) => ({
      products: [],
      orders: [],
      initialized: false,
      ensureSeeded: () => {
        if (get().initialized) return
        set({
          products: seedSellerProducts(),
          orders: seedSellerOrders(),
          initialized: true,
        })
      },
      listProducts: () => get().products,
      getProduct: (id) => get().products.find((p) => p.id === id),
      createProduct: (input) => {
        const id = `seller-${crypto.randomUUID()}`
        const product = toSellerProduct(input, id)
        set((state) => ({ products: [product, ...state.products] }))
        return product
      },
      updateProduct: (id, input) => {
        let updated: SellerProduct | null = null
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== id) return p
            updated = toSellerProduct(input, id)
            return updated
          }),
        }))
        return updated
      },
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      listOrders: () => get().orders,
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, order_status: status } : o,
          ),
        })),
    }),
    {
      name: 'epic-vault-seller-catalog',
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        initialized: state.initialized,
      }),
    },
  ),
)
