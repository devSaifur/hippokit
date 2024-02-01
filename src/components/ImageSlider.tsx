import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'
import Image from 'next/image'

interface ImageSliderProps {
  urls: string[]
}

const ImageSlider = ({ urls }: ImageSliderProps) => {
  return (
    <Carousel>
      <CarouselContent>
        {urls.map((url, i) => (
          <CarouselItem key={i}>
            <Image
              src={url}
              fill
              loading="eager"
              className="-z-10 h-full w-full object-cover object-center"
              alt="product"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

export default ImageSlider
