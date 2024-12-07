import { ReceiptEmailHtml } from './components/emails/ReceiptEmail'
import { stripe } from './lib/stripe'
import type { Product } from './payload-types'
import { getPayloadClient } from './get-payload'
import { WebhookRequest } from './server'
import dotenv from 'dotenv'
import type { Request, Response } from 'express'
import path from 'path'
import { Resend } from 'resend'
import type Stripe from 'stripe'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const webhookRequest = req as any as WebhookRequest
  const body = webhookRequest.rawBody
  const signature = req.headers['stripe-signature'] || ''

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return res
      .status(400)
      .send(
        `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`
      )
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    return res.status(400).send(`Webhook Error: No user present in metadata`)
  }

  if (event.type === 'checkout.session.completed') {
    const payload = await getPayloadClient()

    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        id: {
          equals: session.metadata.userId,
        },
      },
    })

    const [user] = users

    if (!user) return res.status(404).json({ error: 'No such user exists.' })

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

    if (!order) return res.status(404).json({ error: 'No such order exists.' })

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
      const data = await resend.emails.send({
        from: 'HippoKit <saifur2akash@gmail.com>',
        to: [user.email as string],
        subject: 'Thanks for your order! This is your receipt.',
        html: 'Hello',
        react: ReceiptEmailHtml({
          date: new Date(),
          email: user.email as string,
          orderId: session.metadata.orderId,
          products: order.products as Product[],
        }) as any,
      })
      res.status(200).json({ data })
    } catch (error) {
      res.status(500).json({ error })
    }
  }

  return res.status(200).send()
}
