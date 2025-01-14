import { PRODUCT_CATEGORIES } from '@/config'
import type { CollectionConfig, Access } from 'payload'
import type { Product } from '@/payload-types'
import { stripe } from '@/lib/stripe'

const isAdminOrHasAccess =
  (): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true

    const userProductIDs = (user.products || []).reduce<Array<string>>((acc, product) => {
      if (!product) return acc
      if (typeof product === 'string') {
        acc.push(product)
      } else {
        acc.push(product.id)
      }

      return acc
    }, [])

    return {
      id: {
        in: userProductIDs,
      },
    }
  }

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: isAdminOrHasAccess(),
    update: isAdminOrHasAccess(),
    delete: isAdminOrHasAccess(),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Product details',
    },
    {
      name: 'price',
      label: 'Price in USD',
      min: 0,
      max: 1000,
      type: 'number',
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    {
      name: 'product_files',
      label: 'Product file(s)',
      type: 'relationship',
      required: true,
      relationTo: 'users',
      hasMany: false,
    },
    {
      name: 'approvedForSale',
      label: 'Product Status',
      type: 'select',
      defaultValue: 'pending',
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        read: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
      options: [
        {
          label: 'Pending verification',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Denied',
          value: 'denied',
        },
      ],
    },
    {
      name: 'priceId',
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'stripeId',
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Product images',
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      // ADD USER
      async ({ req, data }) => {
        const user = req.user
        return { data, user: user?.id }
      },

      async ({ operation, data }) => {
        const product = data.data as Product
        if (operation === 'create') {
          const createdProduct = await stripe.products.create({
            name: product.name,
            default_price_data: {
              currency: 'USD',
              unit_amount: Math.round(product.price * 100),
            },
          })

          const updated = {
            ...product,
            stripeId: createdProduct.id,
            priceId: createdProduct.default_price as string,
          }

          return updated
        } else if (operation === 'update') {
          const updatedProduct = await stripe.products.update(product.stripeId!, {
            name: data.name,
            default_price: product.priceId!,
          })

          const updated = {
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price,
          }

          return updated
        }
      },
    ],
    afterChange: [
      // SYNC USER
      async ({ req, doc }) => {
        const fullUser = await req.payload.findByID({
          collection: 'users',
          id: req.user?.id as string,
        })

        if (fullUser && typeof fullUser === 'object') {
          const { products } = fullUser

          const allIDs = [
            ...(products?.map((product) => (typeof product === 'object' ? product.id : product)) ||
              []),
          ]

          const createdProductIDs = allIDs.filter((id, index) => allIDs.indexOf(id) === index)

          const dataToUpdate = [...createdProductIDs, doc.id]

          await req.payload.update({
            collection: 'users',
            id: fullUser.id,
            data: {
              products: dataToUpdate,
            },
          })
        }
      },
    ],
  },
}
