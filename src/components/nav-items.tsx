'use client'

import { NavItem } from './nav-item'
import { PRODUCT_CATEGORIES } from '@/config'
import { useOnClickOutside } from '@/hooks/use-click-outside'
import { RefObject, useEffect, useRef, useState } from 'react'

export const NavItems = () => {
  const [activeIndex, setActiveIndex] = useState<null | number>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveIndex(null)
      }
    }

    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [])

  const isAnyOpen = activeIndex !== null
  const navRef = useRef<HTMLDivElement | null>(null)

  useOnClickOutside(navRef as RefObject<HTMLElement>, () => setActiveIndex(null))

  return (
    <div className="flex h-full gap-4" ref={navRef}>
      {PRODUCT_CATEGORIES.map((category, i) => {
        function handleOpen() {
          if (activeIndex === i) {
            setActiveIndex(null)
          } else {
            setActiveIndex(i)
          }
        }

        const isOpen = i === activeIndex

        return (
          <NavItem
            category={category}
            handleOpen={handleOpen}
            isOpen={isOpen}
            isAnyOpen={isAnyOpen}
            key={category.value}
          />
        )
      })}
    </div>
  )
}
