import type { Order, OrderStatus } from '@/types/order'
import type { Product, ProductType } from '@/types/product'

export interface SellerProduct extends Product {
  image_urls: string[]
  video_url?: string
  updated_at: string
}

export interface SellerDashboardStats {
  todays_orders: number
  todays_order_value: number
  active_products: number
  out_of_stock_products: number
  as_of: string
}

export interface SellerProductInput {
  name: string
  short_description: string
  description: string
  price: number
  stock: number
  product_type: ProductType
  is_active: boolean
  image_urls: string[]
  video_url?: string
}

export type { Order, OrderStatus }
