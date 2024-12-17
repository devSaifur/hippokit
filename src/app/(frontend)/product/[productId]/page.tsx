import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Check, Shield } from 'lucide-react'

import { AddToCartButton } from '@/components/add-to-cart-btn'
import { ImageSlider } from '@/components/image-slider'
import { MaxWidthWrapper } from '@/components/max-width-wrapper'
import { ProductReel } from '@/components/product-reel'
import { PRODUCT_CATEGORIES } from '@/config'
import { formatPrice } from '@/lib/utils'
import config from '@payload-config'
import type { Product } from '@/payload-types'

interface PageProps {
  params: Promise<{
    productId: string
  }>
}

const BREADCRUMBS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'Products', href: '/products' },
]

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    limit: 1,
    where: {
      id: {
        equals: productId,
      },
      approvedForSale: {
        equals: 'approved',
      },
    },
  })

  const [product] = docs as any as Product[]

  if (!product) return notFound()

  const label = PRODUCT_CATEGORIES.find(({ value }) => value === product.category)?.label

  const validUrls = product?.images
    .map(({ image }) => (typeof image === 'string' ? image : image.url))
    .filter(Boolean) as string[]

  return (
    <MaxWidthWrapper className="bg-white">
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:max-w-lg lg:self-end">
            <ol className="flex items-center space-x-2">
              {BREADCRUMBS.map((breadcrumb, i) => (
                <li key={breadcrumb.href}>
                  <div className="flex items-center text-sm">
                    <Link
                      href={breadcrumb.href}
                      className="text-sm font-medium text-muted-foreground hover:text-gray-900"
                    >
                      {breadcrumb.name}
                    </Link>
                    {i !== BREADCRUMBS.length - 1 && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>
            </div>

            <section className="mt-4">
              <div className="flex items-center">
                <p className="font-medium text-gray-900">{formatPrice(product.price)}</p>
                <div className="ml-4 border-l border-gray-300 pl-4 text-muted-foreground">
                  {label}
                </div>
              </div>

              <div className="mt-4 space-y-6">
                <p className="text-base text-muted-foreground">{product.description}</p>
              </div>

              <div className="mt-6 flex items-center">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                <p className="ml-2 text-sm text-muted-foreground">Eligible for instant delivery</p>
              </div>
            </section>
          </div>

          {/* Product images */}
          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
            <div className="aspect-square rounded-lg">
              <ImageSlider urls={validUrls} />
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
            <div>
              <div className="mt-10">
                <AddToCartButton product={product} />
              </div>
              <div className="mt-6 text-center">
                <div className="group inline-flex text-sm font-medium">
                  <Shield className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  <span className="text-muted-foreground hover:text-gray-700">
                    30 Day Return Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReel
        href="/products"
        query={{ category: product.category, limit: 4 }}
        title={`Similar ${label}`}
        subtile={`Browse similar high-quality ${label} just like ${product.name}`}
      />
    </MaxWidthWrapper>
  )
}
