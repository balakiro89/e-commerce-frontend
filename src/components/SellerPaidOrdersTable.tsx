import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadOrderSummary, downloadOrdersCsv } from '@/lib/download-order-summary'
import {
  formatOrderProductNames,
  formatPaymentStatusLabel,
  formatShippingAddress,
} from '@/lib/order-format'
import { formatDate } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order, OrderStatus } from '@/types/order'

const FULFILLMENT_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

interface SellerPaidOrdersTableProps {
  orders: Order[]
  title?: string
  description?: string
  updatingOrderId?: string | null
  onFulfillmentChange?: (orderId: string, status: OrderStatus) => void
}

export function SellerPaidOrdersTable({
  orders,
  title = 'Paid orders',
  description = 'Orders with successful payment only.',
  updatingOrderId = null,
  onFulfillmentChange,
}: SellerPaidOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
        No paid orders yet.
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => downloadOrdersCsv(orders)}
        >
          <Download className="h-4 w-4" />
          Download all (CSV)
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Product name</th>
              <th className="px-4 py-3 font-medium">Delivery address</th>
              <th className="px-4 py-3 font-medium">Mobile</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Date</th>
              {onFulfillmentChange ? (
                <th className="px-4 py-3 font-medium">Fulfillment</th>
              ) : null}
              <th className="px-4 py-3 font-medium">Download</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">{order.order_number}</td>
                <td className="max-w-[200px] px-4 py-3">{formatOrderProductNames(order)}</td>
                <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                  {formatShippingAddress(order)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{order.customer_phone}</td>
                <td className="px-4 py-3">{formatPaymentStatusLabel(order.payment_status)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(order.created_at)}
                </td>
                {onFulfillmentChange ? (
                  <td className="min-w-[160px] px-4 py-3">
                    <Select
                      value={order.order_status}
                      disabled={updatingOrderId === order.id}
                      onValueChange={(value) =>
                        onFulfillmentChange(order.id, value as OrderStatus)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FULFILLMENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadOrderSummary(order)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
