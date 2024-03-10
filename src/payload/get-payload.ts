import 'dotenv/config'
import nodemailer from 'nodemailer'
import payload, { Payload } from 'payload'
import { InitOptions } from 'payload/config'

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
})

let cached = (global as any).getPayloadClient

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  }
}

interface Args {
  initOptions?: Partial<InitOptions>
}

export const getPayloadClient = async ({
  initOptions,
}: Args = {}): Promise<Payload> => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing')
  }

  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      email: {
        transport: transporter,
        fromAddress: 'onboarding@resend.dev',
        fromName: 'HippoKit',
      },
      secret: process.env.PAYLOAD_SECRET,
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    })
  }

  try {
    cached.client = await cached.promise
  } catch (error: unknown) {
    cached.promise = null
    throw error
  }

  return cached.client
}
