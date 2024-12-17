import { Icons } from '@/components/icons'
import { SignInForm } from '@/components/sign-in-form'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <div className="container relative flex flex-col items-center justify-center pt-20 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Icons.logo className="h-20 w-20" />
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
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
          <Suspense>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
