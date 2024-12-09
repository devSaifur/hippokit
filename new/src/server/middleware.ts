import { User } from '@/payload-types'
import type { PayloadRequest } from 'payload'
import { createMiddleware } from 'hono/factory'

export type ENV = {
  Variables: {
    user: User
  }
}

export const getUser = createMiddleware<ENV>(async (c, next) => {
  const { user } = c.req as any as PayloadRequest

  if (!user || !user.id) {
    return c.json({ message: 'Unauthorized' }, 404)
  }

  c.set('user', user)
  return next()
})
