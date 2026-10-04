import api from '@/api/axios'
import { unwrapApiData } from '@/lib/api-response'
import type { PaymentInitResponse, PaymentVerifyPayload } from '@/types/order'

export const paymentApi = {
  initiate: async (orderId: string): Promise<PaymentInitResponse> => {
    const response = await api.post<unknown>('/payments/initiate', { order_id: orderId })
    return unwrapApiData<PaymentInitResponse>(response.data)
  },

  verify: async (payload: PaymentVerifyPayload): Promise<void> => {
    const response = await api.post<unknown>('/payments/verify', payload)
    unwrapApiData(response.data)
  },
}
