import { PrimaryActionEmailHtml } from '@/components/emails/primary-action'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  fields: [
    {
      name: 'products',
      label: 'Products',
      admin: {
        condition: () => false,
      },
      type: 'relationship',
      hasMany: true,
      relationTo: 'products',
    },
    {
      name: 'product_files',
      label: 'Product Files',
      admin: {
        condition: () => false,
      },
      type: 'relationship',
      relationTo: 'product_files',
      hasMany: true,
    },
    {
      name: 'role',
      defaultValue: 'user',
      required: true,
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
  admin: {
    hidden: ({ user }) => user?.role !== 'admin',
    defaultColumns: ['id'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false

      if (user.role === 'admin') {
        return true
      }

      return {
        id: {
          equals: user.id,
        },
      }
    },
    create: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {
        return PrimaryActionEmailHtml({
          actionLabel: 'verify your account',
          buttonText: 'Verify Account',
          href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`,
        })
      },
    },
  },
}
