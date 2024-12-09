import { Api } from '@/app/(frontend)/api/next/[...slug]/route'
import { hc } from 'hono/client'

export const api = hc<Api>('/').api.next
