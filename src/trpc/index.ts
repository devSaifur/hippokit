import { publicProcedure, router } from './trpc'

export const appRouter = router({
  myApiRoute: publicProcedure.query(() => {
    return 'hello'
  }),
})

export type AppRouter = typeof appRouter
