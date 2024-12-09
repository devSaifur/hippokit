import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { ProductFile } from './collections/ProductFile'
import { Orders } from './collections/Orders'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
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
  editor: lexicalEditor(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URL || '',
  }),
  sharp,
  plugins: [],
})
