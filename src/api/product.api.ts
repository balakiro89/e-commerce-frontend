import api from '@/api/axios'
import type { PaginatedProducts, Product, ProductQueryParams } from '@/types/product'

function normalizePaginated(raw: unknown, params: ProductQueryParams): PaginatedProducts {
  const page = params.page ?? 1
  const limit = params.limit ?? 20

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
    const response = await api.get<unknown>('/products', { params })
    return normalizePaginated(response.data, params)
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  },
}
