import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import Breadcrumbs from "./Breadcrumbs";
import Gallery from "./Gallery";
import Info from "./Info";
import OrderForm from "./OrderForm";

import styles from "./styles.module.scss";

export default function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Selected product variants
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

                // Reset selected variants when product changes
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

    if (loading) {
        return (
            <main className={styles.ProductDetails}>
                <div className={styles.ProductDetails__NotFound}>
                    <h1>Loading...</h1>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className={styles.ProductDetails}>
                <div className={styles.ProductDetails__NotFound}>
                    <h1>Product not found</h1>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.ProductDetails}>
            <div className={styles.ProductDetails__Container}>
                <Breadcrumbs product={product} />

                <div className={styles.ProductDetails__Top}>
                    <Gallery product={product} />

                    <div className={styles.ProductDetails__Info}>
                        <Info
                            product={product}
                            selectedVariants={selectedVariants}
                            onVariantChange={setSelectedVariants}
                        />

                        <OrderForm
                            product={product}
                            selectedVariants={selectedVariants}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}