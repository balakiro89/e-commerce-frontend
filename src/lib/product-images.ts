/** Ordered gallery URLs; preserves upload/sort order from API. */
export function normalizeProductImageUrls(
  imageUrls: string[] | undefined,
  imageUrl: string | undefined,
): string[] {
  if (imageUrls?.length) {
    return imageUrls.filter(Boolean)
  }
  if (imageUrl) return [imageUrl]
  return []
}

/** Primary thumbnail — first gallery image. */
export function productPrimaryImageUrl(
  imageUrls: string[] | undefined,
  imageUrl: string | undefined,
  fallback = '/banners/category-watercolor-art.jpg',
): string {
  return normalizeProductImageUrls(imageUrls, imageUrl)[0] ?? fallback
}

const FALLBACK = '/banners/category-watercolor-art.jpg'

/** Ensures API payloads always expose `image_urls` + `image_url` (first image). */
export function normalizeProductFromApi<T extends { image_url?: string; image_urls?: string[] }>(
  product: T,
): T & { image_url: string; image_urls: string[] } {
  const image_urls = normalizeProductImageUrls(product.image_urls, product.image_url)
  const image_url = product.image_url && image_urls.includes(product.image_url)
    ? product.image_url
    : image_urls[0] ?? product.image_url ?? FALLBACK
  return { ...product, image_url, image_urls: image_urls.length ? image_urls : [image_url] }
}
