import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from 'sonner'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'
import { cn, constructMetadata } from '@/lib/utils'
import '@/styles/index.css'

const geistSans = localFont({
  src: '../../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

export const metadata: Metadata = constructMetadata()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={cn('relative h-full font-sans antialiased', geistSans.variable)}>
        <main className="relative flex min-h-screen flex-col">
          <Providers>
            <Navbar />
            <div className="flex-1 flex-grow">{children}</div>
            <Footer />
          </Providers>
        </main>

        <Toaster position="top-center" />
      </body>
    </html>
  )
}
