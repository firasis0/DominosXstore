import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import Breadcrumbs from "./Breadcrumbs";
import Gallery from "./Gallery";
import Info from "./Info";
import OrderForm from "./OrderForm";

import styles from "./styles.module.scss";

const SITE_URL = "https://dominosdz.store";

export default function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedVariants, setSelectedVariants] = useState({});

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const API_BASE_URL =
                    import.meta.env.VITE_API_BASE_URL;

                const response = await fetch(
                    `${API_BASE_URL}/shop`
                );

                if (!response.ok) {
                    throw new Error(
                        `Server returned status: ${response.status}`
                    );
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(
                        result.message ||
                            "Failed to fetch products"
                    );
                }

                const foundProduct = result.data.find(
                    (item) => item.id === Number(id)
                );

                setProduct(foundProduct ?? null);

                setSelectedVariants({});
            } catch (error) {
                console.error(
                    "Error fetching store product:",
                    error
                );

                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (!product) {
            return;
        }

        const productName =
            product.name || "Gaming Product";

        const productDescription =
            product.description ||
            `Buy ${productName} at DOMINOS STORE. Shop gaming accessories and gaming gear in Algeria.`;

        const pageTitle =
            `${productName} — DOMINOS STORE`;

        const canonicalUrl =
            `${SITE_URL}/shop/${product.id}`;

        const productImage =
            product.images?.[0] || null;

        const imageUrl = productImage
            ? productImage.startsWith("http")
                ? productImage
                : `${SITE_URL}${productImage}`
            : null;

        document.title = pageTitle;

        const updateMetaTag = (
            attribute,
            attributeValue,
            content
        ) => {
            let element = document.head.querySelector(
                `meta[${attribute}="${attributeValue}"]`
            );

            if (!element) {
                element = document.createElement("meta");

                element.setAttribute(
                    attribute,
                    attributeValue
                );

                document.head.appendChild(element);
            }

            element.setAttribute(
                "content",
                content
            );
        };

        const updateLinkTag = (
            rel,
            href
        ) => {
            let element = document.head.querySelector(
                `link[rel="${rel}"]`
            );

            if (!element) {
                element = document.createElement("link");

                element.setAttribute(
                    "rel",
                    rel
                );

                document.head.appendChild(element);
            }

            element.setAttribute(
                "href",
                href
            );
        };

        updateMetaTag(
            "name",
            "description",
            productDescription
        );

        updateMetaTag(
            "name",
            "robots",
            "index, follow"
        );

        updateMetaTag(
            "property",
            "og:type",
            "product"
        );

        updateMetaTag(
            "property",
            "og:url",
            canonicalUrl
        );

        updateMetaTag(
            "property",
            "og:title",
            pageTitle
        );

        updateMetaTag(
            "property",
            "og:description",
            productDescription
        );

        updateMetaTag(
            "property",
            "og:site_name",
            "DOMINOS STORE"
        );

        updateMetaTag(
            "property",
            "og:locale",
            "en_DZ"
        );

        updateMetaTag(
            "name",
            "twitter:card",
            "summary_large_image"
        );

        updateMetaTag(
            "name",
            "twitter:title",
            pageTitle
        );

        updateMetaTag(
            "name",
            "twitter:description",
            productDescription
        );

        if (imageUrl) {
            updateMetaTag(
                "property",
                "og:image",
                imageUrl
            );

            updateMetaTag(
                "name",
                "twitter:image",
                imageUrl
            );
        }

        updateLinkTag(
            "canonical",
            canonicalUrl
        );

        const existingStructuredData =
            document.head.querySelector(
                'script[data-seo="product"]'
            );

        if (existingStructuredData) {
            existingStructuredData.remove();
        }

        const structuredData = {
            "@context":
                "https://schema.org",

            "@type":
                "Product",

            name:
                productName,

            description:
                productDescription,

            url:
                canonicalUrl,
        };

        if (imageUrl) {
            structuredData.image = [
                imageUrl,
            ];
        }

        if (
            product.price !==
            undefined
        ) {
            structuredData.offers = {
                "@type":
                    "Offer",

                url:
                    canonicalUrl,

                priceCurrency:
                    "DZD",

                price: String(
                    product.discount_price ??
                        product.price
                ),

                availability:
                    product.stock > 0
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",

                seller: {
                    "@type":
                        "Organization",

                    name:
                        "DOMINOS STORE",
                },
            };
        }

        const structuredDataScript =
            document.createElement(
                "script"
            );

        structuredDataScript.type =
            "application/ld+json";

        structuredDataScript.dataset.seo =
            "product";

        structuredDataScript.textContent =
            JSON.stringify(
                structuredData
            );

        document.head.appendChild(
            structuredDataScript
        );

        return () => {
            const script =
                document.head.querySelector(
                    'script[data-seo="product"]'
                );

            if (script) {
                script.remove();
            }
        };
    }, [product]);

    if (loading) {
        return (
            <main
                className={
                    styles.ProductDetails
                }
            >
                <div
                    className={
                        styles.ProductDetails__NotFound
                    }
                >
                    <h1>
                        Loading...
                    </h1>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main
                className={
                    styles.ProductDetails
                }
            >
                <div
                    className={
                        styles.ProductDetails__NotFound
                    }
                >
                    <h1>
                        Product not found
                    </h1>
                </div>
            </main>
        );
    }

    return (
        <main
            className={
                styles.ProductDetails
            }
        >
            <div
                className={
                    styles.ProductDetails__Container
                }
            >
                <Breadcrumbs
                    product={product}
                />

                <div
                    className={
                        styles.ProductDetails__Top
                    }
                >
                    <Gallery
                        product={product}
                    />

                    <div
                        className={
                            styles.ProductDetails__Info
                        }
                    >
                        <Info
                            product={product}
                            selectedVariants={
                                selectedVariants
                            }
                            onVariantChange={
                                setSelectedVariants
                            }
                        />

                        <OrderForm
                            product={product}
                            selectedVariants={
                                selectedVariants
                            }
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
