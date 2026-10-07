import { jsPDF } from 'jspdf'
import { COMPANY_LOGO_URL, COMPANY_NAME } from '@/data/brand'
import {
  formatOrderIdDisplay,
  formatOrderProductNames,
  formatPaymentStatusLabel,
  formatShippingAddress,
} from '@/lib/order-format'
import type { Order } from '@/types/order'

async function loadImageDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Could not load logo for PDF')
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read logo for PDF'))
    reader.readAsDataURL(blob)
  })
}

function addLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(label, x, y)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(20, 20, 20)
  const lines = doc.splitTextToSize(value, maxWidth)
  doc.text(lines, x, y + 5)
  return y + 5 + lines.length * 5 + 6
}

export async function downloadOrderSummary(order: Order): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 18
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2
  let y = margin

  try {
    const logoData = await loadImageDataUrl(COMPANY_LOGO_URL)
    doc.addImage(logoData, 'JPEG', margin, y, 22, 22)
  } catch {
    // Continue without logo if asset fails to load
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(20, 20, 20)
  doc.text(COMPANY_NAME, margin + 28, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('Order summary', margin + 28, y + 17)

  y += 32

  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, pageWidth - margin, y)
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(20, 20, 20)
  doc.text(formatOrderIdDisplay(order.order_number), margin, y)
  y += 10

  y = addLabelValue(doc, 'Customer name', order.customer_name, margin, y, contentWidth)
  y = addLabelValue(doc, 'Email', order.customer_email, margin, y, contentWidth)
  y = addLabelValue(doc, 'Mobile number', order.customer_phone, margin, y, contentWidth)
  addLabelValue(
    doc,
    'Delivery address',
    formatShippingAddress(order),
    margin,
    y,
    contentWidth,
  )

  doc.save(`order-${order.order_number}.pdf`)
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
