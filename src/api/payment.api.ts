import api from '@/api/axios'
import type { PaymentInitResponse } from '@/types/order'

export const paymentApi = {
  initiate: (orderId: string) =>
    api
      .post<PaymentInitResponse>('/payments/initiate', { order_id: orderId })
      .then((r) => r.data),
}
