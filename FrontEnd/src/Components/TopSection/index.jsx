import { useEffect, useState } from "react";

import HomeData from "../../../Data/HomeData.json";

import FixedTopBar from "../../Components/TopSection/FixedTopBar";
import Banner from "./Banner";
import Navbar from "../../Components/TopSection/Navbar";

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

export default function TopSection() {
    const [
        topBannerImages,
        setTopBannerImages,
    ] = useState(
        HomeData.TopSection.TopBanner.imgs
    );

    useEffect(() => {
        const controller =
            new AbortController();

        const loadTopBanner = async () => {
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
                        data.data?.images?.top
                    )
                ) {
                    return;
                }

                const images =
                    data.data.images.top;

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
                    setTopBannerImages(
                        imageUrls
                    );
                }
            } catch (error) {
                if (
                    error.name !==
                    "AbortError"
                ) {
                    console.error(
                        "Load Home top banner error:",
                        error
                    );
                }
            }
        };

        loadTopBanner();

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <>
            <FixedTopBar />

            <Navbar />

            <Banner
                bannerData={
                    topBannerImages
                }
            />
        </>
    );
}