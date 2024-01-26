import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { NextRequest } from 'next/server'
import { User } from 'payload/dist/auth'

export async function getServerSideUser(
  cookies: NextRequest['cookies'] | ReadonlyRequestCookies
) {
  const token = cookies.get('payload-token')?.value
  const meRes = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`,
    {
      headers: {
        Authorization: `JWT ${token}`,
      },
    }
  )

  const { user } = (await meRes.json()) as { user: User | null }
  return { user }
}
