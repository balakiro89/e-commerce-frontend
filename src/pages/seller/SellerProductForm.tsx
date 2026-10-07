import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { sellerApi } from '@/api/seller.api'
import { createEffectGuard } from '@/lib/effect-guard'
import { getApiErrorMessage } from '@/lib/api-error'
import { PageBlurOverlay } from '@/components/PageBlurOverlay'
import { PageBackLink } from '@/components/PageBackLink'
import { fetchOnce } from '@/lib/fetch-once'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RequiredLabel } from '@/components/RequiredLabel'
import { LoadingButton } from '@/components/ui/loading-button'
import { cn } from '@/lib/utils'
import {
  MAX_PRODUCT_PHOTOS,
  sellerProductFormSchema,
  validateProductMedia,
  type SellerProductFormValues,
} from '@/schemas/seller-product.schema'

export default function SellerProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [loadingProduct, setLoadingProduct] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [existingVideo, setExistingVideo] = useState<string | undefined>()
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'uploading' | 'saving'>('idle')

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
  const isBusy = isSubmitting || submitPhase !== 'idle'

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
    fetchOnce(`seller-product-${id}`, () => sellerApi.getProductById(id))
      .then((product) => {
        if (!guard.isActive()) return
        reset({
          name: product.name,
          short_description: product.short_description,
          description: product.description,
          price: Math.round(product.price),
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

  const photoSlotsRemaining =
    MAX_PRODUCT_PHOTOS - existingImages.length - photoFiles.length

  const onPhotosChange = (fileList: FileList | null) => {
    if (!fileList?.length) return
    setMediaError(null)
    const picked = Array.from(fileList).filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name))
    if (picked.length === 0) {
      setMediaError('Please choose image files (JPEG, PNG, WebP, etc.).')
      if (photoInputRef.current) photoInputRef.current.value = ''
      return
    }

    setPhotoFiles((prev) => {
      const room = MAX_PRODUCT_PHOTOS - existingImages.length - prev.length
      if (room <= 0) return prev
      const accepted = picked.slice(0, room)
      if (picked.length > room) {
        queueMicrotask(() =>
          setMediaError(
            `Only ${room} more photo${room === 1 ? '' : 's'} can be added (max ${MAX_PRODUCT_PHOTOS} total).`,
          ),
        )
      }
      return [...prev, ...accepted]
    })
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const removeNewPhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: SellerProductFormValues) => {
    setMediaError(null)
    const validation = validateProductMedia(photoFiles, videoFile)
    if (validation) {
      setMediaError(validation)
      return
    }
    if (existingImages.length + photoFiles.length > MAX_PRODUCT_PHOTOS) {
      setMediaError(`You can only have ${MAX_PRODUCT_PHOTOS} photos per product.`)
      return
    }
    if (!isEdit && photoFiles.length === 0 && existingImages.length === 0) {
      setMediaError('Add at least one product photo.')
      return
    }

    try {
      setSubmitPhase('uploading')
      const image_urls = [...existingImages]

      const uploads = await Promise.all(
        photoFiles.map((file) => sellerApi.uploadMedia(file, 'IMAGE')),
      )
      image_urls.push(...uploads.map((u) => u.url))

      const trimmedImages = image_urls.slice(0, MAX_PRODUCT_PHOTOS)

      let video_url = existingVideo
      if (videoFile) {
        const uploaded = await sellerApi.uploadMedia(videoFile, 'VIDEO')
        video_url = uploaded.url
      }

      setSubmitPhase('saving')
      const payload = {
        ...values,
        image_urls: trimmedImages,
        video_url,
      }

      if (isEdit && id) {
        await sellerApi.updateProduct(id, payload)
      } else {
        await sellerApi.createProduct(payload)
      }
      navigate('/seller/products')
    } catch (err) {
      setMediaError(getApiErrorMessage(err, 'Could not save product. Please try again.'))
    } finally {
      setSubmitPhase('idle')
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

  const totalPhotos = photoPreviews.length + existingImages.length
  const canAddMorePhotos = totalPhotos < MAX_PRODUCT_PHOTOS

  const submitLabel =
    submitPhase === 'uploading'
      ? 'Uploading to Cloudflare…'
      : submitPhase === 'saving'
        ? 'Saving product…'
        : isEdit
          ? 'Update product'
          : 'Create product'

  const showPageOverlay = submitPhase !== 'idle'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {showPageOverlay ? <PageBlurOverlay message={submitLabel} /> : null}
      <PageBackLink to="/seller/products" label="Back to products" />
      <div>
        <h1 className="font-serif text-3xl">{isEdit ? 'Update product' : 'Create product'}</h1>
        <p className="text-sm text-muted-foreground">
          Choose up to {MAX_PRODUCT_PHOTOS} photos (10 MB each). Files upload to Cloudflare R2 when
          you click {isEdit ? 'Update' : 'Create'} product.
        </p>
      </div>

      {mediaError ? <ErrorMessage message={mediaError} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <input type="hidden" {...register('product_type')} />

        <div className="space-y-2">
          <RequiredLabel htmlFor="name">Product name</RequiredLabel>
          <Input id="name" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="short_description">Short description</RequiredLabel>
          <Input id="short_description" {...register('short_description')} />
          {errors.short_description ? (
            <p className="text-sm text-destructive">{errors.short_description.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="description">Full description</RequiredLabel>
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
            <RequiredLabel htmlFor="price">Price (₹)</RequiredLabel>
            <Input id="price" type="number" step="1" min="1" {...register('price')} />
            {errors.price ? <p className="text-sm text-destructive">{errors.price.message}</p> : null}
          </div>
          <div className="space-y-2">
            <RequiredLabel htmlFor="stock">Stock</RequiredLabel>
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
          <RequiredLabel htmlFor="is_active" optional>
            Product is active
          </RequiredLabel>
        </div>

        <div className="space-y-3">
          <RequiredLabel htmlFor="photos">
            Photos ({totalPhotos}/{MAX_PRODUCT_PHOTOS})
          </RequiredLabel>

          <input
            ref={photoInputRef}
            id="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*"
            multiple={photoSlotsRemaining > 1}
            className="sr-only"
            onChange={(e) => onPhotosChange(e.target.files)}
          />

          {canAddMorePhotos ? (
            <button
              type="button"
              className={cn(
                'flex w-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/80',
                'bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/35',
                'touch-manipulation active:scale-[0.99]',
              )}
              onClick={() => photoInputRef.current?.click()}
            >
              <span className="text-sm font-medium text-foreground">
                {totalPhotos === 0 ? 'Tap to choose photos' : 'Add more photos'}
              </span>
              <span className="text-xs text-muted-foreground">
                Up to {photoSlotsRemaining} more · 10 MB each · JPG, PNG, WebP
              </span>
            </button>
          ) : (
            <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              Maximum {MAX_PRODUCT_PHOTOS} photos selected. Remove one to add another.
            </p>
          )}

          {totalPhotos > 0 || videoPreview || existingVideo ? (
            <div className="space-y-3 rounded-lg border border-border/60 bg-card p-3 sm:p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Review media before saving (photos and video upload to Cloudflare when you submit)
              </p>
              {totalPhotos > 0 ? (
              <ul className="grid grid-cols-3 gap-2 sm:gap-3">
                {existingImages.map((url, index) => (
                  <li
                    key={`existing-${index}-${url.slice(0, 32)}`}
                    className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted shadow-sm"
                  >
                    <img
                      src={url}
                      alt={`Saved photo ${index + 1}`}
                      className="h-full w-full object-cover"
                      decoding="async"
                    />
                    {isEdit ? (
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow touch-manipulation"
                        aria-label={`Remove saved photo ${index + 1}`}
                        onClick={() => removeExistingPhoto(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {index + 1}
                    </span>
                  </li>
                ))}
                {photoPreviews.map((url, index) => {
                  const displayIndex = existingImages.length + index + 1
                  const file = photoFiles[index]
                  return (
                    <li
                      key={`new-${file?.name ?? 'file'}-${file?.size ?? index}-${file?.lastModified ?? index}`}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted shadow-sm"
                    >
                      <img
                        src={url}
                        alt={`Selected photo ${displayIndex}`}
                        className="h-full w-full object-cover"
                        decoding="async"
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow touch-manipulation"
                        aria-label={`Remove photo ${displayIndex}`}
                        onClick={() => removeNewPhoto(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {displayIndex}
                      </span>
                    </li>
                  )
                })}
                {Array.from({ length: Math.max(0, MAX_PRODUCT_PHOTOS - totalPhotos) }).map((_, i) => (
                  <li
                    key={`empty-slot-${i}`}
                    className="aspect-square rounded-lg border border-dashed border-border/50 bg-muted/15"
                    aria-hidden
                  />
                ))}
              </ul>
              ) : null}
              {videoPreview || existingVideo ? (
                <div className="space-y-1 border-t border-border/60 pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Video preview</p>
                  <video
                    src={videoPreview ?? existingVideo}
                    controls
                    playsInline
                    className="max-h-56 w-full rounded-lg border border-border bg-black/5 object-contain"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <RequiredLabel htmlFor="video" optional>
            Video (max 50 MB)
          </RequiredLabel>
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <LoadingButton type="submit" loading={isBusy} loadingText={submitLabel} disabled={isBusy}>
            {submitLabel}
          </LoadingButton>
          <Button type="button" variant="outline" onClick={() => navigate('/seller/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
