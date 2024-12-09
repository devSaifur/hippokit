'use client'

import { api } from '@/lib/api-rpc'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface PaymentStatusProps {
  orderEmail: string
  orderId: string
  isPaid: boolean
}

export const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
  const router = useRouter()

  const { data } = useQuery({
    queryKey: ['payment/poll-order-status', { orderId }],
    queryFn: async () => {
      const res = await api.payment['poll-order-status'].$post({ json: { orderId } })
      if (!res.ok) {
        toast.error('Something went wrong while checking the order status')
        return null
      }
      return res.json()
    },
    enabled: isPaid === false,
    refetchInterval: ({ state }) => (state.data?.isPaid ? false : 1000),
  })

  useEffect(() => {
    if (data?.isPaid) router.refresh()
  }, [data?.isPaid, router])

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Shipping To</p>
        <p>{orderEmail}</p>
      </div>

      <div>
        <p className="font-medium text-gray-900">Order Status</p>
        <p>{isPaid ? 'Payment successful' : 'Pending payment'}</p>
      </div>
    </div>
  )
}
