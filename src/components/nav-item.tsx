'use client'

import { Button } from './ui/button'
import { PRODUCT_CATEGORIES } from '@/config'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Category = (typeof PRODUCT_CATEGORIES)[number]
interface NavItemProps {
  category: Category
  handleOpen: () => void
  isOpen: boolean
  isAnyOpen: boolean
}

export const NavItem = ({ category, handleOpen, isAnyOpen, isOpen }: NavItemProps) => {
  return (
    <div className="flex">
      <div className="relative flex items-center">
        <Button onClick={handleOpen} variant={isOpen ? 'secondary' : 'ghost'} className="gap-1.5">
          {category.label}
          <ChevronDown
            className={cn('h-4 w-4 text-muted-foreground transition-all', {
              '-rotate-180': isOpen,
            })}
          />
        </Button>
      </div>

      {isOpen && (
        <div
          className={cn('absolute inset-x-0 top-full text-sm text-muted-foreground', {
            'animate-in fade-in slide-in-from-top-5': !isAnyOpen,
          })}
        >
          <div className="absolute inset-0 top-1/2 bg-white shadow" aria-hidden="true" />

          <div className="relative bg-white">
            <div className="mx-auto max-w-7xl px-8">
              <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                <div className="col-span-4 col-start-1 grid grid-cols-3 gap-x-8">
                  {category.featured.map((item) => (
                    <div className="group relative text-base sm:text-sm" key={item.name}>
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                        <Image
                          src={item.imageSrc}
                          width={320}
                          height={180}
                          className="object-cover object-center"
                          alt="product category"
                        />
                      </div>

                      <Link href={item.href} className="mt-6 block font-medium text-gray-900">
                        {item.name}
                      </Link>
                      <p className="mt-1" aria-hidden="true">
                        Shop now
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
