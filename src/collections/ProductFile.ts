import { User } from '@/payload-types'
import { Access, CollectionConfig, PayloadRequest } from 'payload/types'

const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null

  if (user?.role === 'admin') return true
  if (!user) return false

  const { docs: products } = await req.payload.find({
    collection: 'products',
    depth: 0,
    where: {
      user: {
        equals: user.id,
      },
    },
  })

  const ownProductFileIds = products
    .map((product) => product.product_files)
    .flat()

  const { docs: Orders } = await req.payload.find({
    collection: 'orders',
    depth: 2,
    where: {
      user: {
        equals: user.id,
      },
    },
  })

  const purchasedProductFileIds = Orders.map((order) => {
    return order.products.map((product) => {
      if (typeof product === 'string')
        return req.payload.logger.error(
          'Search dept is not sufficient to find purchased file IDs'
        )

      return typeof product.product_files === 'string'
        ? product.product_files
        : product.product_files.id
    })
  })
    .filter(Boolean)
    .flat()

  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFileIds],
    },
  }
}

export const ProductFile: CollectionConfig = {
  slug: 'product_file',
  admin: {
    hidden: ({ user }) => user.role !== 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        const user = req.user as User | null
        return { ...data, user: user?.id }
      },
    ],
  },
  access: {
    read: yourOwnAndPurchased,
    update: ({ req }) => req.user.role === 'admin',
    delete: ({ req }) => req.user.role === 'admin',
  },
  upload: {
    staticURL: '/product_files',
    staticDir: 'product_files',
    mimeTypes: ['image/*', 'font/*', 'application/postscript'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: () => false,
      },
      hasMany: false,
      required: true,
    },
  ],
}
