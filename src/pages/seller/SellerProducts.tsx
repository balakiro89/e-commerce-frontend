import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createEffectGuard } from '@/lib/effect-guard'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { sellerApi } from '@/api/seller.api'
import { OptimizedImage } from '@/components/OptimizedImage'
import { PageBackLink } from '@/components/PageBackLink'
import { Pagination } from '@/components/Pagination'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PRODUCT_TYPE_LABELS } from '@/types/product'
import { productPrimaryImageUrl } from '@/lib/product-images'
import { formatPrice } from '@/lib/utils'
import type { SellerProduct } from '@/types/seller'
import { PageBlurOverlay } from '@/components/PageBlurOverlay'
import { fetchOnce } from '@/lib/fetch-once'
import { DEFAULT_PAGE_SIZE, paginateList } from '@/lib/list-pagination'
import { useClampedPage } from '@/lib/use-clamped-page'

export default function SellerProducts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const page = Number(searchParams.get('page') ?? '1') || 1

  const onPageChange = useCallback(
    (p: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (p <= 1) next.delete('page')
        else next.set('page', String(p))
        return next
      })
    },
    [setSearchParams],
  )

  const load = useCallback((isActive: () => boolean = () => true) => {
    setLoading(true)
    setError(null)
    fetchOnce('seller-products', () => sellerApi.getProducts())
      .then((result) => {
        if (isActive()) setProducts(result)
      })
      .catch(() => {
        if (isActive()) setError('Could not load products.')
      })
      .finally(() => {
        if (isActive()) setLoading(false)
      })
  }, [])

  useEffect(() => {
    const guard = createEffectGuard()
    load(guard.isActive)
    return () => guard.cancel()
  }, [load])

  const paginated = useMemo(
    () => paginateList(products, page, DEFAULT_PAGE_SIZE),
    [products, page],
  )

  useClampedPage(page, paginated.total_pages, onPageChange)

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    sellerApi
      .deleteProduct(id)
      .then(() => setProducts((prev) => prev.filter((p) => p.id !== id)))
      .catch(() => setError('Could not delete product. Please try again.'))
      .finally(() => setDeleting(false))
  }

  return (
    <div className="space-y-6">
      {deleting ? <PageBlurOverlay message="Deleting product…" /> : null}
      <PageBackLink to="/seller/dashboard" label="Back to dashboard" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Product list</h1>
          <p className="text-sm text-muted-foreground">Create, update, or remove your catalog items.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/seller/products/new">
            <Plus className="h-4 w-4" />
            Create product
          </Link>
        </Button>
      </div>

      {loading ? <LoadingState message="Loading products..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => load()} retryLoading={loading} /> : null}

      {!loading && !error && paginated.total === 0 ? (
        <EmptyState title="No products in your catalog." />
      ) : null}

      {!loading && !error && paginated.total > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.items.map((product) => (
                  <tr key={product.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <OptimizedImage
                          src={productPrimaryImageUrl(product.image_urls, product.image_url)}
                          alt=""
                          wrapperClassName="h-12 w-12 shrink-0 rounded-md"
                          className="object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {product.short_description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{PRODUCT_TYPE_LABELS[product.product_type]}</td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      {product.is_active ? (
                        <span className="text-primary">Active</span>
                      ) : (
                        <span className="text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                              <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                              <Link
                                to={`/seller/products/${product.id}/edit`}
                                aria-label={`Edit ${product.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              disabled={deleting}
                              aria-label={`Delete ${product.name}`}
                              onClick={() => handleDelete(product.id, product.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={paginated.page}
            totalPages={paginated.total_pages}
            onPageChange={onPageChange}
          />
        </>
      ) : null}
    </div>
  )
}
