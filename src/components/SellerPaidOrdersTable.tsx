import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShipOrderDialog } from '@/components/ShipOrderDialog'
import { downloadOrderSummary, downloadOrdersCsv } from '@/lib/download-order-summary'
import {
  formatOrderProductNames,
  formatPaymentStatusLabel,
  formatShippingAddress,
} from '@/lib/order-format'
import {
  formatFulfillmentStatusLabel,
  normalizeSellerFulfillmentStatus,
  SELLER_FULFILLMENT_STATUSES,
  type SellerFulfillmentStatus,
  type ShipmentService,
} from '@/lib/shipment'
import { formatDateTime } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order } from '@/types/order'

interface SellerPaidOrdersTableProps {
  orders: Order[]
  title?: string
  description?: string
  /** Page listing: table only (matches seller product list styling). */
  layout?: 'default' | 'page'
  updatingOrderId?: string | null
  onFulfillmentChange?: (
    orderId: string,
    status: SellerFulfillmentStatus,
    shipping?: { tracking_id: string; shipment_service: ShipmentService },
  ) => void | Promise<void>
}

export function SellerPaidOrdersTable({
  orders,
  title = 'Paid orders',
  description = 'Orders with successful payment only.',
  layout = 'default',
  updatingOrderId = null,
  onFulfillmentChange,
}: SellerPaidOrdersTableProps) {
  const [shipDialogOrder, setShipDialogOrder] = useState<Order | null>(null)
  const isPageLayout = layout === 'page'

  if (orders.length === 0 && !isPageLayout) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
        No paid orders yet.
      </div>
    )
  }

  if (orders.length === 0 && isPageLayout) {
    return null
  }

  const handleStatusSelect = (order: Order, value: SellerFulfillmentStatus) => {
    if (!onFulfillmentChange) return
    const current = normalizeSellerFulfillmentStatus(order.order_status)
    if (value === current) return

    if (value === 'SHIPPED') {
      setShipDialogOrder(order)
      return
    }

    void onFulfillmentChange(order.id, value)
  }

  const confirmShip = async (payload: {
    tracking_id: string
    shipment_service: ShipmentService
  }) => {
    if (!shipDialogOrder || !onFulfillmentChange) return
    try {
      await onFulfillmentChange(shipDialogOrder.id, 'SHIPPED', payload)
      setShipDialogOrder(null)
    } catch {
      // Keep dialog open; parent surfaces the error message.
    }
  }

  const table = (
    <div
      className={
        isPageLayout
          ? 'overflow-x-auto rounded-xl border border-border/60'
          : 'overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm'
      }
    >
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer name</th>
              <th className="px-4 py-3 font-medium">Product name</th>
              <th className="px-4 py-3 font-medium">Delivery address</th>
              <th className="px-4 py-3 font-medium">Mobile</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Date & time</th>
              {onFulfillmentChange ? (
                <th className="px-4 py-3 font-medium">Fulfillment</th>
              ) : null}
              <th className="px-4 py-3 font-medium">Download</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const fulfillmentStatus = normalizeSellerFulfillmentStatus(order.order_status)
              const hasShipping = Boolean(order.tracking_id && order.shipment_service)

              return (
                <tr key={order.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{order.order_number}</td>
                  <td className="whitespace-nowrap px-4 py-3">{order.customer_name}</td>
                  <td className="max-w-[200px] px-4 py-3">{formatOrderProductNames(order)}</td>
                  <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                    {formatShippingAddress(order)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{order.customer_phone}</td>
                  <td className="px-4 py-3">{formatPaymentStatusLabel(order.payment_status)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDateTime(order.created_at)}
                  </td>
                  {onFulfillmentChange ? (
                    <td className="min-w-[200px] px-4 py-3 align-top">
                      <Select
                        value={fulfillmentStatus}
                        disabled={updatingOrderId === order.id}
                        onValueChange={(value) =>
                          handleStatusSelect(order, value as SellerFulfillmentStatus)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SELLER_FULFILLMENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {formatFulfillmentStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {hasShipping ? (
                        <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                          <p>
                            <span className="font-medium text-foreground">Tracking:</span>{' '}
                            {order.tracking_id}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Courier:</span>{' '}
                            {order.shipment_service}
                          </p>
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void downloadOrderSummary(order)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
    </div>
  )

  return (
    <>
      {isPageLayout ? (
        table
      ) : (
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
          {table}
        </section>
      )}

      <ShipOrderDialog
        order={shipDialogOrder}
        open={shipDialogOrder !== null}
        onOpenChange={(open) => {
          if (!open) setShipDialogOrder(null)
        }}
        onConfirm={confirmShip}
        submitting={shipDialogOrder !== null && updatingOrderId === shipDialogOrder.id}
      />
    </>
  )
}
