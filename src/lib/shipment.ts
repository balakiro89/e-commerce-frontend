export const SHIPMENT_SERVICES = [
  'DTDC',
  'The Professional Couriers',
  'ST Couriers',
  'Franch Express Network',
  'Blue Dart',
] as const

export type ShipmentService = (typeof SHIPMENT_SERVICES)[number]

export const SELLER_FULFILLMENT_STATUSES = ['CONFIRMED', 'SHIPPED', 'DELIVERED'] as const

export type SellerFulfillmentStatus = (typeof SELLER_FULFILLMENT_STATUSES)[number]

export function normalizeSellerFulfillmentStatus(status: string): SellerFulfillmentStatus {
  if (status === 'SHIPPED' || status === 'DELIVERED') return status
  return 'CONFIRMED'
}

export function formatFulfillmentStatusLabel(status: string): string {
  const normalized = normalizeSellerFulfillmentStatus(status)
  return normalized.charAt(0) + normalized.slice(1).toLowerCase()
}
