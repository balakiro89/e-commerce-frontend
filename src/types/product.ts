export type ProductType =
  | 'TANJORE_PAINTING'
  | 'PENCIL_ART'
  | 'WATERCOLOR_ART'
  | 'PAINTING_MATERIALS'

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  TANJORE_PAINTING: 'Tanjore Painting',
  PENCIL_ART: 'Pencil Art',
  WATERCOLOR_ART: 'Watercolor Art',
  PAINTING_MATERIALS: 'Painting Materials',
}

export interface Product {
  id: string
  name: string
  description: string
  short_description: string
  price: number
  /** Primary thumbnail (first gallery image). */
  image_url: string
  /** All product images in upload/sort order. */
  image_urls: string[]
  video_url?: string
  product_type: ProductType
  stock: number
  is_active: boolean
}

export interface PaginatedProducts {
  items: Product[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ProductQueryParams {
  page?: number
  limit?: number
  search?: string
  min_price?: number
  max_price?: number
  product_type?: ProductType
  in_stock?: boolean
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'
}
