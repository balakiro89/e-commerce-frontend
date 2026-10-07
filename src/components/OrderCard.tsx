import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatOrderIdDisplay, formatPaymentStatusLabel } from '@/lib/order-format'
import { formatDateTime, formatPrice } from '@/lib/utils'
import type { Order } from '@/types/order'

interface OrderCardProps {
  order: Order
}

export const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <h3 className="font-medium">{formatOrderIdDisplay(order.order_number)}</h3>
          <p className="text-sm text-muted-foreground">
            Placed on: {formatDateTime(order.created_at)}
          </p>
          <p className="mt-2 text-lg font-semibold">{formatPrice(order.total)}</p>
          <p className="text-sm text-muted-foreground">
            Payment: {formatPaymentStatusLabel(order.payment_status)} · Status:{' '}
            {order.order_status.charAt(0) + order.order_status.slice(1).toLowerCase()}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" asChild>
              <Link to={`/orders/${order.id}`} aria-label="View order">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View order</TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  )
})
