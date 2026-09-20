import styles from "./styles.module.scss";

import Autoplay from "embla-carousel-autoplay";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/Components/ui/carousel";

export default function Banner({ bannerData = [] }) {
    const normalizedBannerData = bannerData
        .map((item) => {
            if (typeof item === "string") {
                return {
                    src: item,
                    alt: "Banner image",
                };
            }

            if (item && typeof item === "object") {
                return {
                    src: item.src || item.image_url || "",
                    alt: item.alt || "Banner image",
                };
            }

            return null;
        })
        .filter((item) => item?.src);

    if (normalizedBannerData.length === 0) {
        return null;
    }

    return (
        <div>
            <Carousel
                className={styles.Carousel}
                plugins={[
                    Autoplay({
                        delay: 5000,
                        stopOnInteraction: false,
                    }),
                ]}
            >
                <CarouselContent
                    className={styles.Carousel__Content}
                >
                    {normalizedBannerData.map(
                        (image, index) => (
                            <CarouselItem
                                key={`${image.src}-${index}`}
                                className={
                                    styles.Carousel__Item
                                }
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                />
                            </CarouselItem>
                        )
                    )}
                </CarouselContent>

                {normalizedBannerData.length > 1 && (
                    <>
                        <CarouselPrevious
                            className={
                                styles.Carousel__Previous
                            }
                        />

                        <CarouselNext
                            className={
                                styles.Carousel__Next
                            }
                        />
                    </>
                )}
            </Carousel>
        </div>
    );
}