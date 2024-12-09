import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getPayload } from 'payload'
import { z } from 'zod'
import type Stripe from 'stripe'

import config from '@payload-config'
import { stripe } from '@/lib/stripe'
import { getUser } from '@/server/middleware'

export const paymentRoutes = new Hono()
  .post(
    '/create-session',
    zValidator('json', z.object({ productIds: z.array(z.string()) })),
    getUser,
    async (c) => {
      const user = c.get('user')
      const { productIds } = c.req.valid('json')

      if (productIds.length === 0) {
        return c.json({ message: 'No products found' }, 404)
      }

      const payload = await getPayload({ config })

      const { docs: products } = await payload.find({
        collection: 'products',
        where: {
          id: {
            in: productIds,
          },
        },
      })

      const filteredProducts = products.filter((prod) => Boolean(prod.priceId))

      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id) as string[],
          user: user.id,
        },
      })

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

      filteredProducts.forEach((product) => {
        line_items.push({
          price: product.priceId as string,
          quantity: 1,
        })
      })

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ['card'],
          mode: 'payment',
          metadata: {
            userId: user.id,
            orderId: order.id,
          },
          line_items,
        })

        return c.json({ url: stripeSession.url })
      } catch (err) {
        return c.json({ url: null })
      }
    },
  )
  .post(
    '/poll-order-status',
    zValidator('json', z.object({ orderId: z.string() })),
    getUser,
    async (c) => {
      const { orderId } = c.req.valid('json')

      const payload = await getPayload({ config })

      try {
        const { docs: orders } = await payload.find({
          collection: 'orders',
          where: {
            id: {
              equals: orderId,
            },
          },
        })
        if (!orders.length) {
          return c.json({ message: 'Order not found' }, 404)
        }
        const [order] = orders
        return c.json({ isPaid: order._isPaid })
      } catch (err) {
        if (err instanceof Error) console.error(err.message)
        return c.json({ message: 'Internal server error' }, 500)
      }
    },
  )
