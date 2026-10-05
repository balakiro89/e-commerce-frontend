import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

export interface CartState {
  cartOwnerId: string | null
  items: CartItem[]
  syncOwner: (userId: string | null) => void
  hydrateFromServer: (input: { userId: string; items: CartItem[] }) => void
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartOwnerId: null,
      items: [],
      syncOwner: (userId) => {
        if (userId === null) {
          // Logged out: keep persisted cart so the same user gets it back on login.
          return
        }
        const { cartOwnerId } = get()
        if (cartOwnerId === userId) return
        if (cartOwnerId === null) {
          set({ cartOwnerId: userId })
          return
        }
        set({ cartOwnerId: userId, items: [] })
      },
      hydrateFromServer: ({ userId, items }) => set({ cartOwnerId: userId, items }),
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: Math.min(item.quantity + quantity, product.stock),
                    }
                  : item,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { product, quantity: Math.min(quantity, product.stock) },
            ],
          }
        })
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: Math.min(quantity, item.product.stock),
                }
              : item,
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: 'art-gallery-cart',
      partialize: (state) => ({
        cartOwnerId: state.cartOwnerId,
        items: state.items,
      }),
    },
  ),
)
