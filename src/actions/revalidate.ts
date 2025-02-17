'use server'

import { revalidateTag } from 'next/cache'

// For some reason I wasn't able revalidate the user from the api route (probably cause: Hono) so here is the workaround

export async function revalidateUserAction() {
  revalidateTag('user')
}
