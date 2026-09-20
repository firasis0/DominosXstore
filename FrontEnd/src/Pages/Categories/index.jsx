import { useEffect, useState } from "react";

import CategoriesData from "../../../Data/CategoriesData.json";

import TopSection from "@/Components/About/TopSection";
import Banner from "@/Components/TopSection/Banner";
import Categories from "@/Components/Categories";
import Footer from "@/Components/Footer";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

const HOST_BASE_URL =
    import.meta.env.VITE_HOST_BASE_URL ||
    API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

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

export default function CategoriesPage() {
    const [bannerImages, setBannerImages] = useState(
        CategoriesData.banner.imgs
    );

    useEffect(() => {
        const controller = new AbortController();

        const loadBanner = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/content/pages/categories/images`,
                    {
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (
                    !data.success ||
                    !Array.isArray(data.data?.images?.top)
                ) {
                    return;
                }

                const images = data.data.images.top;

                if (images.length === 0) {
                    return;
                }

                const imageUrls = [...images]
                    .sort(
                        (a, b) =>
                            Number(a.sort_order || 0) -
                            Number(b.sort_order || 0)
                    )
                    .map((image) =>
                        getImageUrl(image.image_url)
                    )
                    .filter(Boolean);

                if (imageUrls.length > 0) {
                    setBannerImages(imageUrls);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(
                        "Load Categories banner error:",
                        error
                    );
                }
            }
        };

        loadBanner();

        return () => controller.abort();
    }, []);

    return (
        <>
            <TopSection />
            <Banner bannerData={bannerImages} />
            <Categories />
            <Footer />
        </>
    );
}