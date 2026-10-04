import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cartApi } from '@/api/cart.api'
import { orderApi } from '@/api/order.api'
import { paymentApi } from '@/api/payment.api'
import { PageBackLink } from '@/components/PageBackLink'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import { checkoutSchema, type CheckoutFormValues } from '@/schemas/checkout.schema'
import { getApiErrorMessage } from '@/lib/api-error'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { formatPrice } from '@/lib/utils'
import type { PaymentInitResponse } from '@/types/order'
import { useCartStore } from '@/store/cart.store'

async function resolvePaymentInit(
  orderId: string,
  initial: PaymentInitResponse,
): Promise<PaymentInitResponse> {
  if (initial.razorpay_order_id && initial.razorpay_key_id) return initial
  return paymentApi.initiate(orderId)
}

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const [error, setError] = useState<string | null>(null)
  const [validatedTotal, setValidatedTotal] = useState<number | null>(null)
  const displaySubtotal =
    validatedTotal ??
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: 'India' },
  })

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <PageBackLink to="/cart" label="Back to cart" />
        <EmptyState title="Your cart is empty" />
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    setError(null)
    try {
      const cartItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))

      const validation = await cartApi.validate(cartItems)
      if (!validation.valid) {
        setError('Some items are out of stock or unavailable. Update your cart and try again.')
        return
      }
      setValidatedTotal(validation.total)

      const { order, payment: initialPayment } = await orderApi.createOrder({
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        shipping_address: {
          address: values.address,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          country: values.country,
        },
        items: cartItems,
      })

      const payment = await resolvePaymentInit(order.id, initialPayment)

      if (payment.redirect_url) {
        clearCart()
        window.location.href = payment.redirect_url
        return
      }

      if (payment.razorpay_order_id && payment.razorpay_key_id) {
        const razorpayResult = await openRazorpayCheckout({
          keyId: payment.razorpay_key_id,
          razorpayOrderId: payment.razorpay_order_id,
          amountInr: payment.amount,
          currency: payment.currency,
          customerName: values.customer_name,
          customerEmail: values.customer_email,
          customerPhone: values.customer_phone,
          description: `Order ${order.order_number}`,
        })

        await paymentApi.verify({
          order_id: order.id,
          razorpay_order_id: razorpayResult.razorpay_order_id,
          razorpay_payment_id: razorpayResult.razorpay_payment_id,
          razorpay_signature: razorpayResult.razorpay_signature,
        })
      }

      clearCart()
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not place order. Please try again.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageBackLink to="/cart" label="Back to cart" />
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div>
          <h1 className="font-serif text-3xl">Checkout</h1>
          {error ? <div className="mt-4"><ErrorMessage message={error} /></div> : null}
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Customer details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer_name">Name</Label>
              <Input id="customer_name" {...register('customer_name')} />
              {errors.customer_name ? (
                <p className="text-sm text-destructive">{errors.customer_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email</Label>
              <Input id="customer_email" type="email" {...register('customer_email')} />
              {errors.customer_email ? (
                <p className="text-sm text-destructive">{errors.customer_email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input id="customer_phone" {...register('customer_phone')} />
              {errors.customer_phone ? (
                <p className="text-sm text-destructive">{errors.customer_phone.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
              {errors.address ? (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
              {errors.city ? (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
              {errors.state ? (
                <p className="text-sm text-destructive">{errors.state.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register('pincode')} />
              {errors.pincode ? (
                <p className="text-sm text-destructive">{errors.pincode.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} />
              {errors.country ? (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <LoadingButton
          type="submit"
          size="lg"
          loading={isSubmitting}
          loadingText="Processing…"
        >
          Proceed to Payment
        </LoadingButton>
      </form>

      <aside className="h-fit rounded-lg border border-border p-6">
        <h2 className="font-medium">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.product.id} className="flex justify-between gap-4">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(displaySubtotal)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total (estimate)</dt>
            <dd>{formatPrice(displaySubtotal)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Final amount is calculated and validated by the server at payment.
        </p>
      </aside>
      </div>
    </div>
  )
}
