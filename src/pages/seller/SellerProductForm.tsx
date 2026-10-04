import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { sellerApi } from '@/api/seller.api'
import { createEffectGuard } from '@/lib/effect-guard'
import { getApiErrorMessage } from '@/lib/api-error'
import { PageBackLink } from '@/components/PageBackLink'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingButton } from '@/components/ui/loading-button'
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
    if (!fileList?.length) return
    setPhotoFiles((prev) => {
      const merged = [...prev, ...Array.from(fileList)]
      return merged.slice(0, MAX_PRODUCT_PHOTOS)
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
    if (!isEdit && photoFiles.length === 0 && existingImages.length === 0) {
      setMediaError('Add at least one product photo.')
      return
    }

    try {
      setSubmitPhase('uploading')
      const image_urls = [...existingImages]

      for (const file of photoFiles) {
        const uploaded = await sellerApi.uploadMedia(file, 'IMAGE')
        image_urls.push(uploaded.url)
      }

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
  const hasPhotoPreview = totalPhotos > 0

  const submitLabel =
    submitPhase === 'uploading'
      ? 'Uploading to Cloudflare…'
      : submitPhase === 'saving'
        ? 'Saving product…'
        : isEdit
          ? 'Update product'
          : 'Create product'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="photos">
              Photos ({totalPhotos}/{MAX_PRODUCT_PHOTOS})
            </Label>
            {totalPhotos < MAX_PRODUCT_PHOTOS ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
              >
                Add photos
              </Button>
            ) : null}
          </div>
          <input
            ref={photoInputRef}
            id="photos"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onPhotosChange(e.target.files)}
          />
          {hasPhotoPreview ? (
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Selected photos (not uploaded until you save)
              </p>
              <div className="flex flex-wrap gap-3">
                {photoPreviews.map((url, index) => (
                  <div key={`new-${url}`} className="relative">
                    <img
                      src={url}
                      alt={`Selected photo ${index + 1}`}
                      className="h-24 w-24 rounded-lg border border-border object-cover shadow-sm"
                    />
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removeNewPhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}-${url.slice(0, 24)}`} className="relative">
                    <img
                      src={url}
                      alt={`Saved photo ${index + 1}`}
                      className="h-24 w-24 rounded-lg border border-border object-cover shadow-sm"
                    />
                    {isEdit ? (
                      <button
                        type="button"
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
                        aria-label={`Remove saved photo ${index + 1}`}
                        onClick={() => removeExistingPhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()}>
              Choose photos
            </Button>
          )}
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
