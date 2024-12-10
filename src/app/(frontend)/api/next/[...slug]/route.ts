import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { paymentRoutes } from '@/server/routes/payment'
import { authRoutes } from '@/server/routes/auth'
import { productsRoutes } from '@/server/routes/products'
import { webhooks } from '@/server/routes/webhooks'

const api = new Hono()
  .basePath('/api/next')
  .route('/auth', authRoutes)
  .route('/payment', paymentRoutes)
  .route('/products', productsRoutes)
  .route('/webhooks', webhooks)
  .get('/hello', (c) => c.text('hello'))

export const GET = handle(api)
export const POST = handle(api)

export type Api = typeof api
