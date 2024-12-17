import type { CollectionConfig } from 'payload'

export const ProductFiles: CollectionConfig = {
  slug: 'product_files',
  labels: {
    singular: 'Product File',
    plural: 'Product Files',
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
  admin: {
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    read: async ({ req }) => {
      const user = req.user

      if (!user) return false

      if (user.role === 'admin') return true

      const { docs: products } = await req.payload.find({
        collection: 'products',
        depth: 0,
        where: {
          user: {
            equals: user.id,
          },
        },
      })

      const ownProductFileIds = products.map((product) => product.product_files).flat()

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
              'Search dept is not sufficient to find purchased file IDs',
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
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        const user = req.user
        return {
          ...data,
          user: user?.id,
        }
      },
    ],
  },
  upload: {
    staticDir: 'product_files',
    mimeTypes: ['image/*', 'font/*', 'application/postscript'],
  },
}
