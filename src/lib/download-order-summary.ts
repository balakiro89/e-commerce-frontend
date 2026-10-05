import {
  formatOrderProductNames,
  formatPaymentStatusLabel,
  formatShippingAddress,
} from '@/lib/order-format'
import type { Order } from '@/types/order'

function summaryText(order: Order): string {
  return [
    `Order: ${order.order_number}`,
    `Product name: ${formatOrderProductNames(order)}`,
    `Delivery address: ${formatShippingAddress(order)}`,
    `Mobile number: ${order.customer_phone}`,
    `Payment status: ${formatPaymentStatusLabel(order.payment_status)}`,
  ].join('\n')
}

export function downloadOrderSummary(order: Order): void {
  const blob = new Blob([summaryText(order)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `order-${order.order_number}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadOrdersCsv(orderList: Order[]): void {
  const header = 'Order,Product name,Delivery address,Mobile number,Payment status'
  const rows = orderList.map((order) => {
    const cells = [
      order.order_number,
      formatOrderProductNames(order),
      formatShippingAddress(order),
      order.customer_phone,
      formatPaymentStatusLabel(order.payment_status),
    ]
    return cells.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
  })
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `paid-orders-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
