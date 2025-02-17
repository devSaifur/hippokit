import { User } from '@/payload-types'
import { cookies } from 'next/headers'

export async function getServerSideUser() {
  const token = (await cookies()).get('payload-token')?.value

  if (!token) {
    return { user: null }
  }

  const meRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
    headers: {
      Authorization: `JWT ${token}`,
    },
    cache: 'force-cache',
    next: {
      tags: ['user'],
    },
  })

  const { user } = (await meRes.json()) as { user: User | null }

  return { user }
}
