import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

const API_SERVER_URL = API_BASE_URL.replace(
    /\/api\/?$/,
    ""
);

const FALLBACK_IMAGE =
    "/images/AboutPage/dominos_insta.jpg";

const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return FALLBACK_IMAGE;
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

export default function OurStory() {
    const [imageUrl, setImageUrl] =
        useState(FALLBACK_IMAGE);

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
                    return;
                }

                setImageUrl(
                    getImageUrl(
                        data.data
                            .ourStoryImage
                    )
                );
            } catch (error) {
                if (
                    error.name !==
                    "AbortError"
                ) {
                    console.error(
                        "Load Our Story image error:",
                        error
                    );
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
                    <img
                        src={imageUrl}
                        alt="Gaming setup"
                        className={
                            styles.OurStory__Image
                        }
                    />
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
                        DOMINOS was created for
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