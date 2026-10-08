import type { ProductSort } from '@/components/ProductFilters'
import type { Product } from '@/types/product'

export function filterProductsBySearch(products: Product[], search: string): Product[] {
  const q = search.trim().toLowerCase()
  if (!q) return products
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.short_description.toLowerCase().includes(q),
  )
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const copy = [...products]
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return copy.sort((a, b) => {
        const ta = a.created_at ? Date.parse(a.created_at) : 0
        const tb = b.created_at ? Date.parse(b.created_at) : 0
        return tb - ta
      })
  }
}

export function applyProductListQuery(
  products: Product[],
  search: string,
  sort: ProductSort,
): Product[] {
  return sortProducts(filterProductsBySearch(products, search), sort)
}
