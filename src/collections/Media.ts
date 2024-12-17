import { Access, CollectionConfig } from 'payload'

const isAdminOrHasAccessToImages: Access = async ({ req }) => {
  const user = req.user

  if (!user) return false
  if (user.role === 'admin') return true

  return {
    user: {
      equals: user.id,
    },
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: ({ user }) => user?.role !== 'admin',
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
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        return { ...data, user: req.user?.id }
      },
    ],
  },
  access: {
    read: async (args) => {
      const referer = args.req.referrer

      if (!args.req.user || !referer?.includes('admin')) {
        return true
      }

      return isAdminOrHasAccessToImages(args)
    },
    delete: (args) => isAdminOrHasAccessToImages(args),
    update: (args) => isAdminOrHasAccessToImages(args),
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/*'],
  },
}
