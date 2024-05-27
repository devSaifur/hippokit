import { nextApp, nextHandler } from './next-utils'
import { getPayloadClient } from './payload/get-payload'
import { appRouter } from './trpc'
import { stripeWebhookHandler } from './webhooks'
import * as trpcExpress from '@trpc/server/adapters/express'
import bodyParser from 'body-parser'
import express from 'express'
import { IncomingMessage } from 'http'
import nextBuild from 'next/dist/build'
import path from 'path'
import { PayloadRequest } from 'payload/types'
import { parse } from 'url'

const app = express()
const PORT = Number(process.env.PORT) || 3000

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res })

export type ExpressContext = Awaited<ReturnType<typeof createContext>>
export type WebhookRequest = IncomingMessage & { rawBody: Buffer }

const start = async () => {
  const webhookMiddleware = bodyParser.json({
    verify: (req: WebhookRequest, _, buffer) => {
      req.rawBody = buffer
    },
  })

  app.post('/api/webhooks/stripe', webhookMiddleware, stripeWebhookHandler)

  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`)
      },
    },
  })

  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info('Next.js is building for production')

      //@ts-expect-error
      await nextBuild(path.join(__dirname, '../'))

      process.exit()
    })

    return
  }

  const cartRouter = express.Router()

  cartRouter.use(payload.authenticate)

  cartRouter.get('/', (req, res) => {
    const request = req as PayloadRequest

    if (!request.user) return res.redirect('/sign-in?origin=cart')

    const { query } = parse(req.url, true)

    return nextApp.render(req, res, '/cart', query)
  })

  app.use('/cart', cartRouter)

  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  )

  app.use((req, res) => nextHandler(req, res))

  nextApp.prepare().then(() => {
    payload.logger.info('Next.js started')

    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      )
    })
  })
}

start()
