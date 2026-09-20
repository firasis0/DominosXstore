import { useEffect, useState } from "react";

import styles from "./styles.module.scss";

import { FaTiktok, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { ArrowUpRight } from "lucide-react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

const socialIcons = {
    tiktok: FaTiktok,
    instagram: FaInstagram,
    email: SiGmail,
};

export default function Connect() {
    const [socialLinks, setSocialLinks] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        const loadConnectContent = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/content/about/connect`,
                    {
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                            "Failed to load Connect content."
                    );
                }

                setSocialLinks(
                    result?.data?.connect?.socialLinks || []
                );
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error(
                    "Connect content error:",
                    error
                );

                setSocialLinks([]);
            }
        };

        loadConnectContent();

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <section className={styles.Connect}>
            <div className={styles.Connect__Container}>
                <div
                    id="contact"
                    className={styles.Connect__Header}
                >
                    <span
                        className={styles.Connect__Eyebrow}
                    >
                        Stay Connected
                    </span>

                    <h2 className={styles.Connect__Title}>
                        Let&apos;s connect.
                    </h2>

                    <p
                        className={
                            styles.Connect__Description
                        }
                    >
                        Follow DOMINOS, discover new gear,
                        and stay up to date with everything
                        happening in the gaming world.
                    </p>
                </div>

                <div className={styles.Connect__Grid}>
                    {socialLinks.map((social) => {
                        const Icon =
                            socialIcons[social.type];

                        if (!Icon || !social.href) {
                            return null;
                        }

                        const isEmail =
                            social.type === "email";

                        return (
                            <a
                                key={social.id}
                                href={social.href}
                                target={
                                    isEmail
                                        ? undefined
                                        : "_blank"
                                }
                                rel={
                                    isEmail
                                        ? undefined
                                        : "noopener noreferrer"
                                }
                                className={styles.SocialCard}
                            >
                                <div
                                    className={
                                        styles.SocialCard__Top
                                    }
                                >
                                    <div
                                        className={
                                            styles.SocialCard__Icon
                                        }
                                    >
                                        <Icon />
                                    </div>

                                    <ArrowUpRight
                                        className={
                                            styles.SocialCard__Arrow
                                        }
                                    />
                                </div>

                                <div
                                    className={
                                        styles.SocialCard__Info
                                    }
                                >
                                    <span
                                        className={
                                            styles.SocialCard__Name
                                        }
                                    >
                                        {social.name}
                                    </span>

                                    <span
                                        className={
                                            styles.SocialCard__Username
                                        }
                                    >
                                        {social.username}
                                    </span>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}