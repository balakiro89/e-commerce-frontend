import type { ProductType } from '@/types/product'

export type OrderStatus =
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface OrderItem {
  product_id: string
  product_name: string
  product_type: ProductType
  image_url: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface ShippingAddress {
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface Order {
  id: string
  order_number: string
  created_at: string
  items: OrderItem[]
  subtotal: number
  total: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  shipping_address: ShippingAddress
  customer_name: string
  customer_email: string
  customer_phone: string
}

export interface CreateOrderPayload {
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: ShippingAddress
  items: { product_id: string; quantity: number }[]
}

export interface CreateOrderResponse {
  order: Order
  payment: PaymentInitResponse
}

export interface PaymentInitResponse {
  payment_id: string
  amount: number
  currency: string
  redirect_url?: string
}
