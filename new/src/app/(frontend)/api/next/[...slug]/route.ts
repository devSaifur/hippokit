import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { paymentRoutes } from '@/server/routes/payment'
import { authRoutes } from '@/server/routes/auth'

export const runtime = 'edge'

const api = new Hono()
  .basePath('/api/next')
  .route('/auth', authRoutes)
  .route('/payment', paymentRoutes)

export const GET = handle(api)
export const POST = handle(api)

export type Api = typeof api
