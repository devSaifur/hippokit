export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      NEXT_PUBLIC_SERVER_URL: string
      MONGODB_URL: string
      STRIPE_SECRET_KEY: string
      STRIPE_WEBHOOK_SECRET: string
      EMAIL_APP_USER: string
      EMAIL_APP_PASSWORD: string
    }
  }
}
