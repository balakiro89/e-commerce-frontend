import { useEffect, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RequiredLabel } from '@/components/RequiredLabel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SHIPMENT_SERVICES, type ShipmentService } from '@/lib/shipment'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/order'

interface ShipOrderDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (payload: { tracking_id: string; shipment_service: ShipmentService }) => void
  submitting?: boolean
}

export function ShipOrderDialog({
  order,
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
}: ShipOrderDialogProps) {
  const [trackingId, setTrackingId] = useState('')
  const [shipmentService, setShipmentService] = useState<ShipmentService | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !order) return
    setTrackingId(order.tracking_id ?? '')
    setShipmentService(order.shipment_service ?? '')
    setError(null)
  }, [open, order])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = trackingId.trim()
    if (!trimmed) {
      setError('Tracking ID is required.')
      return
    }
    if (!shipmentService) {
      setError('Please select a shipment service.')
      return
    }
    setError(null)
    onConfirm({ tracking_id: trimmed, shipment_service: shipmentService })
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-border bg-card p-6 shadow-lg',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="font-serif text-lg font-semibold">
                Shipping details
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                Provide tracking information before marking order{' '}
                <span className="font-medium text-foreground">{order?.order_number}</span> as
                Shipped.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <RequiredLabel htmlFor="tracking_id">Tracking ID</RequiredLabel>
              <Input
                id="tracking_id"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                disabled={submitting}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <RequiredLabel htmlFor="shipment_service">Shipment service</RequiredLabel>
              <Select
                value={shipmentService || undefined}
                onValueChange={(value) => setShipmentService(value as ShipmentService)}
                disabled={submitting}
              >
                <SelectTrigger id="shipment_service">
                  <SelectValue placeholder="Select courier" />
                </SelectTrigger>
                <SelectContent>
                  {SHIPMENT_SERVICES.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating…' : 'Mark as Shipped'}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
