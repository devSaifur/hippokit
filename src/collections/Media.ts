import { Access, CollectionConfig } from 'payload'

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
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
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        return { ...data, user: req.user?.id }
      },
    ],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.referrer

      if (!req.user || !referer?.includes('admin')) {
        return true
      }

      return isAdminOrHasAccessToImages()({ req })
    },
    delete: isAdminOrHasAccessToImages(),
    update: isAdminOrHasAccessToImages(),
  },
  admin: {
    hidden: ({ user }) => user?.role !== 'admin',
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
}
