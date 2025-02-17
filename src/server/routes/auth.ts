import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'

import { AuthCredentialsValidator } from '@/lib/validators/account-credentials-validator'
import config from '@/payload.config'
import { revalidateTag } from 'next/cache'

export const authRoutes = new Hono()
  .post('/sign-up', zValidator('json', AuthCredentialsValidator), async (c) => {
    const { email, password } = c.req.valid('json')
    try {
      const payload = await getPayload({ config })

      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
      })

      if (users.length !== 0) {
        return c.json({ message: 'User already exists' }, 409)
      }

      await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'user',
        },
      })

      return c.json({ message: 'User created successfully' }, 201)
    } catch (err) {
      console.error(err)
      return c.json({ message: 'Internal server error' }, 500)
    }
  })
  .post('/verify-email', zValidator('json', z.object({ token: z.string() })), async (c) => {
    const { token } = c.req.valid('json')
    try {
      const payload = await getPayload({ config })

      const isVerified = await payload.verifyEmail({
        collection: 'users',
        token,
      })

      if (!isVerified) {
        return c.json({ message: 'Invalid token' }, 401)
      }

      return c.json({ success: true })
    } catch (err) {
      console.error(err)
      return c.json({ message: 'Internal server error' }, 500)
    }
  })
  .post('/sign-in', zValidator('json', AuthCredentialsValidator), async (c) => {
    const { email, password } = c.req.valid('json')
    try {
      const payload = await getPayload({ config })

      const { token } = await payload.login({
        collection: 'users',
        data: { email, password },
      })

      if (!token) {
        return c.json({ message: 'Invalid credentials' }, 401)
      }

      const cookieStore = await cookies()
      cookieStore.set('payload-token', token, { secure: true })

      return c.json({ success: true }, 200)
    } catch (err) {
      console.error(err)
      return c.json({ message: 'Something went wrong' }, 500)
    }
  })
