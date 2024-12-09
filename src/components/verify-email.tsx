'use client'

import { useMutation } from '@tanstack/react-query'
import { buttonVariants } from './ui/button'
import { Loader2, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api-rpc'
import { toast } from 'sonner'

interface VerifyEmailProps {
  token: string
}

export const VerifyEmail = ({ token }: VerifyEmailProps) => {
  const { isPending, isSuccess, error } = useMutation({
    mutationKey: ['auth/verify-email', { token }],
    mutationFn: async () => {
      const res = await api.auth['verify-email'].$post({ json: { token } })
      if (!res.ok) {
        toast.error('Something went wrong while verifying the email')
        return null
      }
      return res.json()
    },
  })

  const Error = (
    <div className="flex flex-col items-center gap-2">
      <XCircle className="h-8 w-8 text-red-600" />
      <h3 className="text-xl font-semibold">There was a problem</h3>
      <p className="text-sm text-muted-foreground">
        This token is not valid or might be expired. Please try again
      </p>
    </div>
  )

  const Loading = (
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
      <h3 className="text-xl font-semibold">Verifying...</h3>
      <p className="text-sm text-muted-foreground">This won&apos;t take long, just a second...</p>
    </div>
  )

  const Success = (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative mb-4 h-60 w-60 text-muted-foreground">
        <Image src="/hippo-email-sent.png" fill alt="the email was sent" />
      </div>
      <h3 className="text-2xl font-semibold">You&apos;re all set!</h3>
      <p className="mt-1 text-center text-muted-foreground">Thank you for verifying your email</p>
      <Link href="/sign-in" className={buttonVariants({ className: 'mt-4' })}>
        Sign in
      </Link>
    </div>
  )

  if (error) return Error
  if (isPending) return Loading
  if (isSuccess) return Success
}
