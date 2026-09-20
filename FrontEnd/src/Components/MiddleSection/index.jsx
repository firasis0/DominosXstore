import { useEffect, useState } from "react";

import styles from "./styles.module.scss";

import Categories from "./Categories";
import Brands from "./Brands";
import BestDeals from "./BestDeals";
import InventoryCarousel from "./InventoryCarousel";
import Banner from "../TopSection/Banner";

import HomeData from "../../../Data/HomeData.json";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

const HOST_BASE_URL =
    import.meta.env.VITE_HOST_BASE_URL ||
    API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `${HOST_BASE_URL}${
        imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
};

export default function MiddleSection() {
    const [
        middleBannerImages,
        setMiddleBannerImages,
    ] = useState(
        HomeData.MiddleSection.MiddleBanner.imgs
    );

    useEffect(() => {
        const controller =
            new AbortController();

        const loadMiddleBanner = async () => {
            try {
                const response =
                    await fetch(
                        `${API_BASE_URL}/content/pages/home/images`,
                        {
                            signal:
                                controller.signal,
                        }
                    );

                if (!response.ok) {
                    return;
                }

                const data =
                    await response.json();

                if (
                    !data.success ||
                    !Array.isArray(
                        data.data?.images?.middle
                    )
                ) {
                    return;
                }

                const images =
                    data.data.images.middle;

                if (images.length === 0) {
                    return;
                }

                const imageUrls = [
                    ...images,
                ]
                    .sort(
                        (a, b) =>
                            Number(
                                a.sort_order || 0
                            ) -
                            Number(
                                b.sort_order || 0
                            )
                    )
                    .map((image) =>
                        getImageUrl(
                            image.image_url
                        )
                    )
                    .filter(Boolean);

                if (imageUrls.length > 0) {
                    setMiddleBannerImages(
                        imageUrls
                    );
                }
            } catch (error) {
                if (
                    error.name !==
                    "AbortError"
                ) {
                    console.error(
                        "Load Home middle banner error:",
                        error
                    );
                }
            }
        };

        loadMiddleBanner();

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <main
            className={
                styles.MiddleSection
            }
        >
            <Categories />

            <BestDeals />

            <InventoryCarousel
                eyebrow="Built for your setup"
                title="Keyboards and desk essentials"
                mode="keyboards"
            />

            <InventoryCarousel
                eyebrow="Brand spotlight"
                title="GameSir favorites"
                mode="gamesir"
            />

            <InventoryCarousel
                eyebrow="Fresh from inventory"
                title="More gear worth discovering"
                mode="random"
            />

            <Banner
                bannerData={
                    middleBannerImages
                }
            />

            <Brands
                data={
                    HomeData.MiddleSection.marks
                }
                title="Shop by Brand"
            />
        </main>
    );
}