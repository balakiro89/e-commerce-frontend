import { MOCK_PRODUCTS } from '@/data/mock-products'
import type { Order } from '@/types/order'
import type { SellerProduct } from '@/types/seller'

const now = new Date()
const todayIso = now.toISOString()
const yesterday = new Date(now)
yesterday.setDate(yesterday.getDate() - 1)

export function seedSellerProducts(): SellerProduct[] {
  return MOCK_PRODUCTS.map((p) => ({
    ...p,
    image_urls: [p.image_url],
    updated_at: todayIso,
  }))
}

export function seedSellerOrders(): Order[] {
  return [
    {
      id: 'ord-today-1',
      order_number: 'EV-1042',
      created_at: todayIso,
      customer_name: 'Ananya Rao',
      customer_email: 'ananya@example.com',
      customer_phone: '9876543210',
      subtotal: 8498,
      total: 8498,
      payment_status: 'PAID',
      order_status: 'CONFIRMED',
      shipping_address: {
        address: '12 Art Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        country: 'India',
      },
      items: [
        {
          product_id: 'mock-1',
          product_name: 'Classic Tanjore Deity',
          product_type: 'TANJORE_PAINTING',
          image_url: '/banners/category-tanjore-paintings.jpg',
          quantity: 1,
          unit_price: 4999,
          subtotal: 4999,
        },
        {
          product_id: 'mock-2',
          product_name: 'Watercolor Landscape',
          product_type: 'WATERCOLOR_ART',
          image_url: '/banners/category-watercolor-art.jpg',
          quantity: 1,
          unit_price: 3499,
          subtotal: 3499,
        },
      ],
    },
    {
      id: 'ord-today-2',
      order_number: 'EV-1043',
      created_at: todayIso,
      customer_name: 'Rahul Mehta',
      customer_email: 'rahul@example.com',
      customer_phone: '9123456780',
      subtotal: 1299,
      total: 1299,
      payment_status: 'PAID',
      order_status: 'PROCESSING',
      shipping_address: {
        address: '88 Canvas Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
      },
      items: [
        {
          product_id: 'mock-4',
          product_name: 'Artist Brush Set',
          product_type: 'PAINTING_MATERIALS',
          image_url: '/banners/category-painting-raw-materials.jpg',
          quantity: 1,
          unit_price: 1299,
          subtotal: 1299,
        },
      ],
    },
    {
      id: 'ord-yesterday-1',
      order_number: 'EV-1038',
      created_at: yesterday.toISOString(),
      customer_name: 'Priya Nair',
      customer_email: 'priya@example.com',
      customer_phone: '9988776655',
      subtotal: 2799,
      total: 2799,
      payment_status: 'PAID',
      order_status: 'DELIVERED',
      shipping_address: {
        address: '5 Palette Road',
        city: 'Kochi',
        state: 'Kerala',
        pincode: '682001',
        country: 'India',
      },
      items: [
        {
          product_id: 'mock-3',
          product_name: 'Pencil Portrait Study',
          product_type: 'PENCIL_ART',
          image_url: '/banners/category-pencil-art.jpg',
          quantity: 1,
          unit_price: 2799,
          subtotal: 2799,
        },
      ],
    },
  ]
}
