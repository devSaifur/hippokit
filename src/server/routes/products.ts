import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getPayload } from 'payload'
import { z } from 'zod'

import { QueryValidator } from '@/lib/validators/query-validator'
import config from '@/payload.config'

export const productsRoutes = new Hono().get(
  '/',
  zValidator(
    'json',
    z.object({
      limit: z.number().min(1).max(100),
      cursor: z.string().nullish(),
      query: QueryValidator,
    }),
  ),
  async (c) => {
    const { cursor, query } = c.req.valid('json')
    const { sort, limit, ...queryOpts } = query

    const payload = await getPayload({ config })

    const parsedQueryOptions: Record<string, { equals: string }> = {}

    Object.entries(queryOpts).forEach(([key, value]) => {
      parsedQueryOptions[key] = { equals: value }
    })

    const page = Number(cursor) || 1

    const {
      docs: items,
      hasNextPage,
      nextPage,
    } = await payload.find({
      collection: 'products',
      where: {
        approvedForSell: {
          equals: 'approved',
        },
        ...parsedQueryOptions,
      },
      sort,
      depth: 1,
      limit,
      page,
    })
    return c.json({ items, nextPage: hasNextPage ? nextPage : null })
  },
)
