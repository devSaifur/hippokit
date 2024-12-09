'use client'

import { useEffect, useState } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type SwiperType from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'

interface ImageSliderProps {
  urls: string[]
}

export const ImageSlider = ({ urls }: ImageSliderProps) => {
  const [swiper, setSwiper] = useState<null | SwiperType>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slideConfig, setSlideConfig] = useState({
    isBeginning: true,
    isEnd: activeIndex === (urls.length ?? 0) - 1,
  })

  useEffect(() => {
    swiper?.on('slideChange', ({ activeIndex }) => {
      setActiveIndex(activeIndex)
      setSlideConfig({
        isBeginning: activeIndex === 0,
        isEnd: activeIndex === (urls.length ?? 0) - 1,
      })
    })
  }, [swiper, urls])

  const activeStyle =
    'absolute top-1/2 z-50 grid aspect-square h-8 w-8 -translate-y-1/2 place-items-center rounded-full border-2 border-zinc-300 bg-white opacity-100 hover:scale-105 active:scale-[0.97]'
  const inactiveStyle = 'hidden text-gray-400'

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
      <div className="absolute inset-0 z-10 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.preventDefault()
            swiper?.slideNext()
          }}
          className={cn(activeStyle, 'right-3 transition', {
            [inactiveStyle]: slideConfig.isEnd,
            'text-zinc-300 opacity-100 hover:bg-zinc-300': !slideConfig.isEnd,
          })}
        >
          <ChevronRight className="h-4 w-4 text-zinc-700" aria-label="next image" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            swiper?.slidePrev()
          }}
          className={cn(activeStyle, 'left-3 transition', {
            [inactiveStyle]: slideConfig.isBeginning,
            'text-zinc-300 opacity-100 hover:bg-zinc-300': !slideConfig.isBeginning,
          })}
        >
          <ChevronLeft className="h-4 w-4 text-zinc-700" aria-label="previous image" />
        </button>
      </div>

      <Swiper
        pagination={{
          renderBullet: (_, className) => {
            return `<span class="rounded-full transition ${className}"></span>`
          },
        }}
        onSwiper={(swiper) => setSwiper(swiper)}
        spaceBetween={50}
        slidesPerView={1}
        modules={[Pagination]}
        className="h-full w-full"
      >
        {urls.map((url, i) => (
          <SwiperSlide className="relative -z-10 h-full w-full" key={i}>
            <Image
              src={url}
              fill
              loading="eager"
              className="-z-10 h-full w-full object-cover object-center"
              alt="product"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
