import { User } from '@/payload-types'
import { cookies } from 'next/headers'

export async function getServerSideUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

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

  console.log({ user })
  return { user }
}
