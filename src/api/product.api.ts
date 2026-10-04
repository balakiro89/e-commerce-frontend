import api from '@/api/axios'
import { getMockProductById, getMockProductsPage } from '@/data/mock-products'
import { isLocalCatalogSession } from '@/lib/local-auth'
import type { PaginatedProducts, Product, ProductQueryParams } from '@/types/product'

function normalizePaginated(
  raw: unknown,
  params: ProductQueryParams,
): PaginatedProducts {
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  if (Array.isArray(raw)) {
    const total = raw.length
    const start = (page - 1) * limit
    return {
      items: raw.slice(start, start + limit) as Product[],
      page,
      limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    }
  }

  if (!raw || typeof raw !== 'object') {
    return { items: [], page, limit, total: 0, total_pages: 1 }
  }

  const data = raw as Record<string, unknown>
  const nested = data.data
  const source =
    nested && typeof nested === 'object' ? (nested as Record<string, unknown>) : data

  const itemsRaw = source.items ?? source.products ?? source.results
  const items = Array.isArray(itemsRaw) ? (itemsRaw as Product[]) : []

  const total = typeof source.total === 'number' ? source.total : items.length
  const total_pages =
    typeof source.total_pages === 'number'
      ? source.total_pages
      : Math.max(1, Math.ceil(total / limit))

  return {
    items,
    page: typeof source.page === 'number' ? source.page : page,
    limit: typeof source.limit === 'number' ? source.limit : limit,
    total,
    total_pages,
  }
}

export const productApi = {
  getProducts: async (params: ProductQueryParams): Promise<PaginatedProducts> => {
    if (isLocalCatalogSession()) {
      return getMockProductsPage(params)
    }
    try {
      const response = await api.get<unknown>('/products', { params })
      return normalizePaginated(response.data, params)
    } catch {
      return getMockProductsPage(params)
    }
  },

  getProductById: async (id: string) => {
    if (isLocalCatalogSession()) {
      const product = getMockProductById(id)
      if (!product) throw new Error('Product not found')
      return product
    }
    try {
      const response = await api.get<Product>(`/products/${id}`)
      return response.data
    } catch {
      const product = getMockProductById(id)
      if (product) return product
      throw new Error('Product not found')
    }
  },
}
