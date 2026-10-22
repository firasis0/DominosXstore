import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { useStoreBranding } from "@/Context/StoreBrandingContext";
import { API_BASE_URL } from "@/lib/authFetch.js";
import { resolveStoreImageUrl } from "@/lib/storeData";

export default function OurStory() {
    const { name: storeName } = useStoreBranding();
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        const controller =
            new AbortController();

        const loadImage = async () => {
            try {
                const response = await fetch(
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
                    !data.data?.ourStoryImage
                ) {
                    setImageUrl(null);
                    return;
                }

                setImageUrl(
                    resolveStoreImageUrl(
                        data.data.ourStoryImage
                    )
                );
            } catch (error) {
                if (
                    error.name !==
                    "AbortError"
                ) {
                    setImageUrl(null);
                }
            }
        };

        loadImage();

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <section className={styles.OurStory}>
            <div
                className={
                    styles.OurStory__Container
                }
            >
                <div
                    id="ourStory"
                    className={
                        styles.OurStory__ImageWrapper
                    }
                >
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Gaming setup"
                            className={
                                styles.OurStory__Image
                            }
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                </div>

                <div
                    className={
                        styles.OurStory__Content
                    }
                >
                    <span
                        className={
                            styles.OurStory__Eyebrow
                        }
                    >
                        Our Story
                    </span>

                    <h2
                        className={
                            styles.OurStory__Title
                        }
                    >
                        Built around gaming.
                        <br />
                        Driven by quality.
                    </h2>

                    <p
                        className={
                            styles.OurStory__Text
                        }
                    >
                        {storeName} was created for
                        gamers who want better gear
                        without unnecessary
                        complexity. We bring
                        together gaming equipment
                        that combines performance,
                        quality, and design.
                    </p>

                    <p
                        className={
                            styles.OurStory__Text
                        }
                    >
                        From the mouse in your hand
                        to the headset on your desk,
                        every piece of equipment
                        should make your gaming
                        experience better.
                    </p>

                    <a
                        href="/shop"
                        className={
                            styles.OurStory__Button
                        }
                    >
                        Explore our shop
                        <span>→</span>
                    </a>
                </div>
            </div>
        </section>
    );
}