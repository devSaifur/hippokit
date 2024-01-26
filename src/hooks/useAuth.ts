import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useAuth() {
  const router = useRouter()

  async function signOut() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) throw new Error('Failed to sign out')

      toast.success('Signed out successfully')

      router.push('/sign-in')
    } catch (err) {
      toast.error('Failed to sign out, please try agin')

      if (err instanceof Error) console.error(err.message)
    }
  }
}
