import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { ProductFile } from './collections/ProductFile'
import { Orders } from './collections/Orders'

import { transporter } from '@/lib/nodemailer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  collections: [Users, Products, ProductFile, Orders, Media],
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- HippoKit',
      openGraph: {
        title: 'HippoKit',
        images: [
          {
            url: '/thumbnail.jpg',
          },
        ],
      },
      icons: [
        {
          fetchPriority: 'high',
          type: 'image/png',
          sizes: '16x16',
          url: '/favicon.ico',
        },
      ],
    },
  },
  editor: slateEditor({}),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URL,
  }),
  email: nodemailerAdapter({
    defaultFromAddress: 'hippokit@hippokit.dev',
    defaultFromName: 'HippoKit',
    transport: transporter,
  }),
  sharp,
  plugins: [
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
        acl: 'public-read',
      },
    }),
  ],
})
