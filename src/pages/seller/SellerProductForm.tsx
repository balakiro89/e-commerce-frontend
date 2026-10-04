import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { sellerApi } from '@/api/seller.api'
import { createEffectGuard } from '@/lib/effect-guard'
import { PageBackLink } from '@/components/PageBackLink'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingButton } from '@/components/ui/loading-button'
import {
  MAX_PRODUCT_PHOTOS,
  readFilesAsDataUrls,
  sellerProductFormSchema,
  validateProductMedia,
  type SellerProductFormValues,
} from '@/schemas/seller-product.schema'

export default function SellerProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [loadingProduct, setLoadingProduct] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [existingVideo, setExistingVideo] = useState<string | undefined>()
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SellerProductFormValues>({
    resolver: zodResolver(sellerProductFormSchema),
    defaultValues: {
      is_active: true,
      product_type: 'WATERCOLOR_ART',
      stock: 0,
      price: 0,
    },
  })

  const isActive = watch('is_active')

  useEffect(() => {
    const urls = photoFiles.map((file) => URL.createObjectURL(file))
    setPhotoPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoFiles])

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview(null)
      return
    }
    const url = URL.createObjectURL(videoFile)
    setVideoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [videoFile])

  useEffect(() => {
    if (!id) return
    const guard = createEffectGuard()
    setLoadingProduct(true)
    sellerApi
      .getProductById(id)
      .then((product) => {
        if (!guard.isActive()) return
        reset({
          name: product.name,
          short_description: product.short_description,
          description: product.description,
          price: product.price,
          stock: product.stock,
          product_type: product.product_type,
          is_active: product.is_active,
        })
        setExistingImages(product.image_urls ?? [product.image_url])
        setExistingVideo(product.video_url)
      })
      .catch(() => {
        if (guard.isActive()) setLoadError('Product not found.')
      })
      .finally(() => {
        if (guard.isActive()) setLoadingProduct(false)
      })
    return () => guard.cancel()
  }, [id, reset])

  const onPhotosChange = (fileList: FileList | null) => {
    if (!fileList) {
      setPhotoFiles([])
      return
    }
    setPhotoFiles(Array.from(fileList).slice(0, MAX_PRODUCT_PHOTOS))
  }

  const onSubmit = async (values: SellerProductFormValues) => {
    setMediaError(null)
    const validation = validateProductMedia(photoFiles, videoFile)
    if (validation) {
      setMediaError(validation)
      return
    }
    if (!isEdit && photoFiles.length === 0 && existingImages.length === 0) {
      setMediaError('Add at least one product photo.')
      return
    }

    try {
      const newPhotoUrls = photoFiles.length ? await readFilesAsDataUrls(photoFiles) : []
      const image_urls =
        newPhotoUrls.length > 0
          ? [...newPhotoUrls, ...existingImages].slice(0, MAX_PRODUCT_PHOTOS)
          : existingImages.length
            ? existingImages
            : ['/banners/category-watercolor-art.jpg']

      let video_url = existingVideo
      if (videoFile) {
        const [videoData] = await readFilesAsDataUrls([videoFile])
        video_url = videoData
      }

      const payload = {
        ...values,
        image_urls,
        video_url,
      }

      if (isEdit && id) {
        await sellerApi.updateProduct(id, payload)
      } else {
        await sellerApi.createProduct(payload)
      }
      navigate('/seller/products')
    } catch {
      setMediaError('Could not save product. Please try again.')
    }
  }

  if (loadingProduct) return <LoadingState message="Loading product..." />

  if (loadError) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={loadError} />
        <PageBackLink to="/seller/products" label="Back to products" variant="outline" />
      </div>
    )
  }

  const hasPhotoPreview = photoPreviews.length > 0 || existingImages.length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageBackLink to="/seller/products" label="Back to products" />
      <div>
        <h1 className="font-serif text-3xl">{isEdit ? 'Update product' : 'Create product'}</h1>
        <p className="text-sm text-muted-foreground">
          Up to {MAX_PRODUCT_PHOTOS} photos (10 MB each) and 1 video (50 MB max).
        </p>
      </div>

      {mediaError ? <ErrorMessage message={mediaError} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <input type="hidden" {...register('product_type')} />

        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="short_description">Short description</Label>
          <Input id="short_description" {...register('short_description')} />
          {errors.short_description ? (
            <p className="text-sm text-destructive">{errors.short_description.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Full description</Label>
          <textarea
            id="description"
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('description')}
          />
          {errors.description ? (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" step="0.01" {...register('price')} />
            {errors.price ? <p className="text-sm text-destructive">{errors.price.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" {...register('stock')} />
            {errors.stock ? <p className="text-sm text-destructive">{errors.stock.message}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={isActive}
            onChange={(e) => setValue('is_active', e.target.checked)}
          />
          <Label htmlFor="is_active">Product is active</Label>
        </div>

        <div className="space-y-3">
          <Label htmlFor="photos">Photos (max {MAX_PRODUCT_PHOTOS})</Label>
          <Input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onPhotosChange(e.target.files)}
          />
          {hasPhotoPreview ? (
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Uploaded photos</p>
              <div className="flex flex-wrap gap-3">
                {photoPreviews.map((url, index) => (
                  <img
                    key={`new-${url}`}
                    src={url}
                    alt={`Upload preview ${index + 1}`}
                    className="h-24 w-24 rounded-lg border border-border object-cover shadow-sm"
                  />
                ))}
                {isEdit
                  ? existingImages.map((url, index) => (
                      <img
                        key={`existing-${index}-${url.slice(0, 24)}`}
                        src={url}
                        alt={`Saved photo ${index + 1}`}
                        className="h-24 w-24 rounded-lg border border-border object-cover shadow-sm"
                      />
                    ))
                  : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <Label htmlFor="video">Video (optional, max 50 MB)</Label>
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
          {videoPreview ? (
            <video
              src={videoPreview}
              controls
              className="max-h-48 w-full rounded-lg border border-border bg-black/5"
            />
          ) : null}
          {!videoPreview && existingVideo ? (
            <video
              src={existingVideo}
              controls
              className="max-h-48 w-full rounded-lg border border-border bg-black/5"
            />
          ) : null}
        </div>

        <div className="flex gap-3 pt-2">
          <LoadingButton type="submit" loading={isSubmitting} loadingText="Saving…">
            {isEdit ? 'Update product' : 'Create product'}
          </LoadingButton>
          <Button type="button" variant="outline" onClick={() => navigate('/seller/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
