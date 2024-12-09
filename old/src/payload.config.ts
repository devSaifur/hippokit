import { Media } from '@/collections/Media'
import { Orders } from '@/collections/Orders'
import { ProductFile } from '@/collections/ProductFile'
import { Users } from '@/collections/Users'
import { Products } from '@/collections/products/Products'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload'
import path from 'path';


export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  collections: [Users, Products, Media, ProductFile, Orders],
  routes: {
    admin: '/sell',
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- HippoKit',
      openGraph: {
        title: 'HippoKit',
        images: [
          {
            url: '/thumbnail.jpg',
          }
        ]
      },
      icons: [{
        fetchPriority: 'high',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon.ico',
      }]
    },
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URL!,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})
