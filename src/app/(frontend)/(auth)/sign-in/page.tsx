'use client'

import { Icons } from '@/components/icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-rpc'
import { cn } from '@/lib/utils'
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from '@/lib/validators/account-credentials-validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function SignInPage() {
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
      email: '',
      password: '',
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
    <div className="container relative flex flex-col items-center justify-center pt-20 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Icons.logo className="h-20 w-20" />
          <h1 className="text-2xl font-bold">Sign in to your {isSeller && 'seller'} account</h1>
          <Link
            href="/sign-up"
            className={buttonVariants({
              variant: 'link',
              className: 'gap-1.5',
            })}
          >
            Don&apos;t have an account? <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6">
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
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password?.message}</p>
                )}
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
        </div>
      </div>
    </div>
  )
}
