'use client'

import Link from 'next/link'
import { ProductListing } from './product-listing'
import { TQueryValidator } from '@/lib/validators/query-validator'
import type { Product } from '@/payload-types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-rpc'

interface ProductReelProps {
  title: string
  subtile?: string
  href?: string
  query: TQueryValidator
}

const FALLBACK_LIMIT: number = 4

export const ProductReel = (props: ProductReelProps) => {
  const { title, subtile, href, query } = props

  const { data: queryResults, isPending } = useInfiniteQuery({
    queryKey: ['products', query],
    queryFn: async () => {
      const res = await api.products.$post({
        json: {
          limit: query.limit ?? FALLBACK_LIMIT,
          query,
        },
      })
      if (!res.ok) {
        return null
      }
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage?.toString(),
    initialPageParam: '1',
  })

  const products = queryResults?.pages.flatMap((page) => page?.items)

  let map: (Product | null)[] = []

  if (products && products.length) {
    map = products as any as (Product | null)[]
  } else if (isPending) {
    map = new Array<null>(query.limit ?? FALLBACK_LIMIT).fill(null)
  }

  return (
    <section className="py-12">
      <div className="mb-4 md:flex md:items-center md:justify-between">
        <div className="max-w-2xl lg:max-w-4xl lg:px-0">
          {title && <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>}
          {subtile && <p className="mt-2 text-sm text-muted-foreground">{subtile}</p>}
        </div>

        {href && (
          <Link
            href={href}
            className="hidden text-sm font-medium text-blue-600 hover:text-blue-500 md:block"
          >
            Shop the collection <span aria-hidden="true">&rarr;</span>
          </Link>
        )}
      </div>

      <div className="relative">
        <div className="mt-6 grid grid-cols-2 items-center gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8">
          {map.map((product, i) => (
            <ProductListing product={product} index={i} key={`product-${i}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
