import type { Order } from '@/types/order'

export function formatOrderIdDisplay(orderNumber: string): string {
  return `Order ID - ${orderNumber}`
}

export function formatShippingAddress(order: Order): string {
  const { shipping_address: a } = order
  return [a.address, `${a.city}, ${a.state} ${a.pincode}`, a.country].filter(Boolean).join(', ')
}

export function formatOrderProductNames(order: Order): string {
  return order.items.map((item) => item.product_name).join('; ')
}

export function formatPaymentStatusLabel(status: Order['payment_status']): string {
  switch (status) {
    case 'PAID':
      return 'Paid'
    case 'FAILED':
      return 'Failed'
    case 'REFUNDED':
      return 'Refunded'
    default:
      return 'Pending'
  }
}
