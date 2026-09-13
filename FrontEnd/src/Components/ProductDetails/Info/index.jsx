import styles from "./styles.module.scss";

export default function Info({
    product,
    selectedVariants,
    onVariantChange,
}) {
    const hasDiscount =
        product.is_on_sale &&
        product.discount_price != null;

    const currentPrice = hasDiscount
        ? product.discount_price
        : product.price;

    const variants = product.variants ?? [];

    // Group variants by type
    const variantGroups = variants.reduce(
        (groups, variant) => {
            if (!groups[variant.type]) {
                groups[variant.type] = [];
            }

            groups[variant.type].push(variant);

            return groups;
        },
        {}
    );

    const handleVariantChange = (variant) => {
        onVariantChange((current) => ({
            ...current,
            [variant.type]: variant.value,
        }));
    };

    return (
        <section className={styles.Info}>
            {product.brand_name && (
                <span className={styles.Info__Brand}>
                    {product.brand_name}
                </span>
            )}

            <h1 className={styles.Info__Title}>
                {product.name}
            </h1>

            <div className={styles.Info__Pricing}>
                <strong>
                    {currentPrice.toLocaleString()} DA
                </strong>

                {hasDiscount && (
                    <>
                        <span className={styles.Info__OldPrice}>
                            {product.price.toLocaleString()} DA
                        </span>

                        <span className={styles.Info__Discount}>
                            -
                            {Math.round(
                                ((product.price -
                                    product.discount_price) /
                                    product.price) *
                                    100
                            )}
                            %
                        </span>
                    </>
                )}
            </div>

            <div className={styles.Info__Stock}>
                <span
                    className={
                        product.stock > 0
                            ? styles.Info__StockDot
                            : styles.Info__StockDotOut
                    }
                />

                {product.stock > 0
                    ? `In stock`
                    : "Out of stock"}
            </div>

            {product.description && (
                <p className={styles.Info__Description}>
                    {product.description}
                </p>
            )}

            {Object.keys(variantGroups).length > 0 && (
                <div className={styles.Info__Variants}>
                    <div className={styles.Info__VariantsHeader}>
                        <span>Available options</span>
                    </div>

                    {Object.entries(variantGroups).map(
                        ([type, typeVariants]) => (
                            <div
                                className={
                                    styles.Info__VariantGroup
                                }
                                key={type}
                            >
                                <span
                                    className={
                                        styles.Info__VariantLabel
                                    }
                                >
                                    {type === "color"
                                        ? "Color"
                                        : type}
                                </span>

                                <div
                                    className={
                                        type === "color"
                                            ? styles.Info__ColorList
                                            : styles.Info__OptionList
                                    }
                                >
                                    {typeVariants.map(
                                        (variant) => {
                                            const isSelected =
                                                selectedVariants[
                                                    variant.type
                                                ] ===
                                                variant.value;

                                            if (
                                                variant.type ===
                                                "color"
                                            ) {
                                                return (
                                                    <button
                                                        key={
                                                            variant.id
                                                        }
                                                        type="button"
                                                        title={
                                                            variant.value
                                                        }
                                                        aria-label={
                                                            variant.value
                                                        }
                                                        className={`
                                                            ${styles.Info__Color}
                                                            ${
                                                                isSelected
                                                                    ? styles.Info__ColorActive
                                                                    : ""
                                                            }
                                                        `}
                                                        style={{
                                                            backgroundColor:
                                                                variant.color_hex ||
                                                                "#ffffff",
                                                        }}
                                                        onClick={() =>
                                                            handleVariantChange(
                                                                variant
                                                            )
                                                        }
                                                    />
                                                );
                                            }

                                            return (
                                                <button
                                                    key={
                                                        variant.id
                                                    }
                                                    type="button"
                                                    className={`
                                                        ${styles.Info__Option}
                                                        ${
                                                            isSelected
                                                                ? styles.Info__OptionActive
                                                                : ""
                                                        }
                                                    `}
                                                    onClick={() =>
                                                        handleVariantChange(
                                                            variant
                                                        )
                                                    }
                                                >
                                                    {
                                                        variant.value
                                                    }
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </section>
    );
}