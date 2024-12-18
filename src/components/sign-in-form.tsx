'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useForm } from 'react-hook-form'
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from '@/lib/validators/account-credentials-validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api-rpc'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const SignInForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isSeller = searchParams.get('as') === 'seller'
  const origin = searchParams.get('origin')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
    defaultValues: {
      email: 'test@email.com',
      password: '123456789',
    },
  })

  const continueAsSeller = () => {
    router.push('?as=seller')
  }

  const continueAsBuyer = () => {
    router.replace('/sign-in', undefined)
  }

  const { mutate: signIn, isPending } = useMutation({
    mutationFn: async ({ email, password }: TAuthCredentialsValidator) => {
      const res = await api.auth['sign-in'].$post({ json: { email, password } })
      if (!res.ok) {
        toast.error('Something went wrong. Please try again')
        return null
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Signed in successfully')
      router.refresh()

      if (origin) {
        router.push(`/${origin}`)
        return
      }

      if (isSeller) {
        router.push('/admin')
        return
      }

      router.push('/')
    },
    onError: () => {
      toast.error('Something went wrong. Please try again')
    },
  })

  function onSubmit({ email, password }: TAuthCredentialsValidator) {
    signIn({ email, password })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1 py-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              type="email"
              className={cn({
                'focus-visible:ring-red-500': errors.email,
              })}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email?.message}</p>}
          </div>

          <div className="grid gap-1 py-2">
            <Label htmlFor="password">Password</Label>
            <Input
              {...register('password')}
              type="password"
              className={cn({
                'focus-visible:ring-red-500': errors.password,
              })}
              placeholder="********"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password?.message}</p>}
          </div>

          <Button disabled={isPending}>Sign in</Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        onClick={isSeller ? continueAsBuyer : continueAsSeller}
        variant="secondary"
        disabled={isPending}
      >
        {isSeller ? 'Continue as customer' : 'Continue as seller'}
      </Button>
    </>
  )
}
