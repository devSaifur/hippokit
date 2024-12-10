import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import type { RemotePattern } from 'next/dist/shared/lib/image-config'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ] as RemotePattern[],
  },
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
