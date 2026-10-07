import { z } from 'zod'

const productTypeEnum = z.enum([
  'TANJORE_PAINTING',
  'PENCIL_ART',
  'WATERCOLOR_ART',
  'PAINTING_MATERIALS',
])

export const sellerProductFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  short_description: z.string().min(4, 'Short description is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.coerce
    .number()
    .int('Price must be a whole number')
    .positive('Price must be greater than 0'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  product_type: productTypeEnum,
  is_active: z.boolean(),
})

export type SellerProductFormValues = z.infer<typeof sellerProductFormSchema>

export const MAX_PRODUCT_PHOTOS = 3
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export function readFilesAsDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
          reader.readAsDataURL(file)
        }),
    ),
  )
}

export function validateProductMedia(
  photoFiles: File[],
  videoFile: File | null,
): string | null {
  if (photoFiles.length > MAX_PRODUCT_PHOTOS) {
    return `You can upload up to ${MAX_PRODUCT_PHOTOS} photos.`
  }
  for (const file of photoFiles) {
    if (!file.type.startsWith('image/')) return `${file.name} is not an image.`
    if (file.size > MAX_PHOTO_BYTES) return `${file.name} exceeds 10 MB.`
  }
  if (videoFile) {
    if (!videoFile.type.startsWith('video/')) return 'Video must be a valid video file.'
    if (videoFile.size > MAX_VIDEO_BYTES) return 'Video exceeds 50 MB.'
  }
  return null
}
