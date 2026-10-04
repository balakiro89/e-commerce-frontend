import { COMPANY_NAME } from '@/data/brand'

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayCheckoutInstance {
  open: () => void
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckoutInstance
  }
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'))
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout(options: {
  keyId: string
  razorpayOrderId: string
  amountInr: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  description?: string
}): Promise<RazorpaySuccessPayload> {
  await loadRazorpayScript()
  if (!window.Razorpay) throw new Error('Razorpay is unavailable')

  const amountPaise = Math.round(options.amountInr * 100)

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: options.keyId,
      amount: amountPaise,
      currency: options.currency,
      name: COMPANY_NAME,
      description: options.description ?? 'Order payment',
      order_id: options.razorpayOrderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: '#163828' },
      handler: (response: RazorpaySuccessPayload) => resolve(response),
    })

    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error?.description ?? 'Payment failed'))
    })

    rzp.open()
  })
}
