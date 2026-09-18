import styles from './styles.module.scss'
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel"


export default function Banner(props) {
  const BannerData = props.bannerData;
  return (
    <div>
      <Carousel className={styles.Carousel} 
      plugins={[
      Autoplay({
      delay: 5000,
      stopOnInteraction: false,
    }),
  ]}>
        <CarouselContent className={styles.Carousel__Content} >
            {BannerData.map((img, index) => (
              <CarouselItem key={index} className={styles.Carousel__Item} >
                <img src={img.src} alt={img.alt} />
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className={styles.Carousel__Previous} />
        <CarouselNext className={styles.Carousel__Next} />
      </Carousel>
    </div>
  )
}
