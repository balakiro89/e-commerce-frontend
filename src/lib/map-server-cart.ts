import { normalizeProductFromApi } from '@/lib/product-images'
import type { CartItem } from '@/types/cart'
import type { Product, ProductType } from '@/types/product'

export interface ServerCartProduct {
  id: string
  name: string
  price: number
  stock: number
  image_url?: string
}

export interface ServerCartLine {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  product: ServerCartProduct
}

export interface ServerCartPayload {
  id: string
  items: ServerCartLine[]
  total: number
}

function mapLineProduct(product: ServerCartProduct): Product {
  return normalizeProductFromApi({
    id: product.id,
    name: product.name,
    description: '',
    short_description: '',
    price: product.price,
    image_url: product.image_url,
    image_urls: product.image_url ? [product.image_url] : [],
    product_type: 'WATERCOLOR_ART' as ProductType,
    stock: product.stock,
    is_active: true,
  })
}

export function mapServerCartToItems(payload: ServerCartPayload): CartItem[] {
  return payload.items.map((line) => ({
    product: mapLineProduct(line.product),
    quantity: line.quantity,
  }))
}
