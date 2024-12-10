import { Hono } from 'hono'
import { render } from '@react-email/components'
import { getPayload } from 'payload'
import type Stripe from 'stripe'

import { ReceiptEmailHtml } from '@/components/emails/receipt-email'
import { stripe } from '@/lib/stripe'
import config from '@payload-config'
import { sendEmail } from '@/lib/nodemailer'
import type { Product } from '@/payload-types'

export const webhooks = new Hono().post('/stripe', async (c) => {
  const body = c.req.raw.body as any as string | Buffer
  const sig = c.req.raw.headers.get('stripe-signature') || ''

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return c.body(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`, 400)
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    return c.body(`Webhook Error: No user present in metadata`, 400)
  }

  if (event.type === 'checkout.session.completed') {
    const payload = await getPayload({ config })

    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        id: {
          equals: session.metadata.userId,
        },
      },
    })

    const [user] = users

    if (!user) {
      return c.body(`Webhook Error: No such user exists.`, 404)
    }

    const { docs: orders } = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })

    const [order] = orders

    if (!order) {
      return c.body(`Webhook Error: No such order exists.`, 404)
    }

    await payload.update({
      collection: 'orders',
      data: {
        _isPaid: true,
      },
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })

    // send receipt
    try {
      const emailHtml = await render(
        <ReceiptEmailHtml
          date={new Date()}
          email={user.email}
          orderId={session.metadata.orderId}
          products={order.products as Product[]}
        />,
      )

      await sendEmail(user.email, 'Thanks for your order! This is your receipt.', emailHtml)

      return c.status(200)
    } catch (error) {
      return c.status(500)
    }
  }
})
