import { useEffect, useState } from "react";

import { resolveStoreImageUrl } from "@/lib/storeData";
import Banner from "@/Components/TopSection/Banner";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

export default function UploadedContentBanner({
    pageName,
    section = "top",
}) {
    const [bannerImages, setBannerImages] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        const loadBanner = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/content/pages/${pageName}/images`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Failed to load uploaded banner images.");
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(
                        data.message || "Failed to load uploaded banner images."
                    );
                }

                const images = data.data?.images?.[section];

                if (!Array.isArray(images)) {
                    setBannerImages([]);
                    return;
                }

                setBannerImages(
                    [...images]
                        .sort(
                            (a, b) =>
                                Number(a.sort_order || 0) -
                                Number(b.sort_order || 0)
                        )
                        .map((image) => ({
                            src: resolveStoreImageUrl(image.image_url),
                            alt: "Uploaded banner image",
                        }))
                        .filter((image) => image.src)
                );
            } catch (error) {
                if (error.name !== "AbortError") {
                    setBannerImages([]);
                }
            }
        };

        loadBanner();

        return () => controller.abort();
    }, [pageName, section]);

    return <Banner bannerData={bannerImages} />;
}
