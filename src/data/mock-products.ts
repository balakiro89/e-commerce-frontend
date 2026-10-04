import type { PaginatedProducts, Product, ProductQueryParams } from '@/types/product'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: 'Classic Tanjore Deity',
    short_description: 'Traditional gold foil Tanjore painting',
    description:
      'Handcrafted Tanjore artwork with rich colors, gold foil work, and semi-precious stone accents.',
    price: 4999,
    image_url: '/banners/category-tanjore-paintings.jpg',
    product_type: 'TANJORE_PAINTING',
    stock: 5,
    is_active: true,
  },
  {
    id: 'mock-2',
    name: 'Watercolor Landscape',
    short_description: 'Soft hues on archival paper',
    description: 'Original watercolor piece inspired by southern Indian landscapes.',
    price: 3499,
    image_url: '/banners/category-watercolor-art.jpg',
    product_type: 'WATERCOLOR_ART',
    stock: 3,
    is_active: true,
  },
  {
    id: 'mock-3',
    name: 'Pencil Portrait Study',
    short_description: 'Detailed graphite portrait',
    description: 'Fine pencil work with subtle shading and high contrast detail.',
    price: 2799,
    image_url: '/banners/category-pencil-art.jpg',
    product_type: 'PENCIL_ART',
    stock: 8,
    is_active: true,
  },
  {
    id: 'mock-4',
    name: 'Artist Brush Set',
    short_description: 'Professional grade brushes',
    description: 'A curated set of brushes for watercolor and acrylic work.',
    price: 1299,
    image_url: '/banners/category-painting-raw-materials.jpg',
    product_type: 'PAINTING_MATERIALS',
    stock: 20,
    is_active: true,
  },
  {
    id: 'mock-5',
    name: 'Tanjore Mini Panel',
    short_description: 'Compact devotional panel',
    description: 'Smaller format Tanjore panel ideal for home altars and gifting.',
    price: 2199,
    image_url: '/banners/category-tanjore-paintings.jpg',
    product_type: 'TANJORE_PAINTING',
    stock: 0,
    is_active: true,
  },
  {
    id: 'mock-6',
    name: 'Watercolor Florals',
    short_description: 'Botanical watercolor series',
    description: 'Delicate floral composition on cotton rag paper.',
    price: 3999,
    image_url: '/banners/category-watercolor-art.jpg',
    product_type: 'WATERCOLOR_ART',
    stock: 4,
    is_active: true,
  },
]

export function getMockProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}

export function getMockProductsPage(params: ProductQueryParams): PaginatedProducts {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  let list = [...MOCK_PRODUCTS]

  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q),
    )
  }

  if (params.product_type) {
    list = list.filter((p) => p.product_type === params.product_type)
  }

  if (params.in_stock === true) list = list.filter((p) => p.stock > 0)
  if (params.in_stock === false) list = list.filter((p) => p.stock <= 0)

  if (params.min_price != null) {
    list = list.filter((p) => p.price >= params.min_price!)
  }
  if (params.max_price != null) {
    list = list.filter((p) => p.price <= params.max_price!)
  }

  switch (params.sort) {
    case 'price_asc':
      list.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      list.sort((a, b) => b.price - a.price)
      break
    case 'name_asc':
      list.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      list.sort((a, b) => b.name.localeCompare(a.name))
      break
    default:
      break
  }

  const total = list.length
  const total_pages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const items = list.slice(start, start + limit)

  return { items, page, limit, total, total_pages }
}
