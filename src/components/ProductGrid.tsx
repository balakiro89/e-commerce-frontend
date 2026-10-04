import { memo } from 'react'
import type { Product } from '@/types/product'
import { ProductCard } from '@/components/ProductCard'

interface ProductGridProps {
  products: Product[]
}

export const ProductGrid = memo(function ProductGrid({ products = [] }: ProductGridProps) {
  const list = Array.isArray(products) ? products : []
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {list.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
})
