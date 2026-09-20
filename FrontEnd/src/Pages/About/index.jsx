import { useEffect, useState } from "react";

import AboutData from "../../../Data/AboutData.json";

import TopSection from "@/Components/About/TopSection";
import Banner from "@/Components/TopSection/Banner";
import Footer from "@/Components/Footer";
import MiddleSection from "@/Components/About/MiddleSection";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

const HOST_BASE_URL = 
import.meta.env.VITE_HOST_BASE_URL

const API_SERVER_URL = API_BASE_URL.replace(
    /\/api\/?$/,
    ""
);

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

    return `${API_SERVER_URL}${
        imageUrl.startsWith("/")
            ? ""
            : "/"
    }${imageUrl}`;
};

export default function About() {
    const [
        topBannerImages,
        setTopBannerImages,
    ] = useState(
        AboutData.TopBanner.imgs
    );

    useEffect(() => {
        const controller =
            new AbortController();

        const loadTopBanner = async () => {
            try {
                const response =
                    await fetch(
                        `${API_BASE_URL}/content/pages/about/images`,
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
                    !data.data?.images?.top
                ) {
                    return;
                }

                const images =
                    data.data.images.top;

                if (images.length === 0) {
                    return;
                }

                setTopBannerImages(
                    images.map(
                        (image) =>
                            getImageUrl(
                                `${HOST_BASE_URL}${image.image_url}`
                            )
                    )
                );
            } catch (error) {
                if (
                    error.name !==
                    "AbortError"
                ) {
                    console.error(
                        "Load About top banner error:",
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
        <div>
            <TopSection />

            <Banner
                bannerData={
                    topBannerImages
                }
            />

            <MiddleSection />

            <Footer />
        </div>
    );
}