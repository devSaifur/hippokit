import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { paymentRoutes } from '@/server/routes/payment'
import { authRoutes } from '@/server/routes/auth'
import { productsRoutes } from '@/server/routes/products'
import { webhooks } from '@/server/routes/webhooks'

export const runtime = 'edge'

const api = new Hono()
  .basePath('/api/next')
  .route('/auth', authRoutes)
  .route('/payment', paymentRoutes)
  .route('/products', productsRoutes)
  .route('/webhooks', webhooks)

export const GET = handle(api)
export const POST = handle(api)

export type Api = typeof api
