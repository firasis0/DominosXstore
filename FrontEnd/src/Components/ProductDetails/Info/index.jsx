import {
    getAvailableStock,
    getOptionGroups,
    getPriceInfo,
    getValueStatus,
    isFullySelected,
} from "../../../lib/variants";

import styles from "./styles.module.scss";

export default function Info({
    product,
    selectedVariants,
    onSelectVariant,
}) {
    const groups = getOptionGroups(product);

    // Price follows the selection: "From ..." until every option is chosen
    const { price, oldPrice, isFrom } = getPriceInfo(
        product,
        selectedVariants
    );

    const availableStock = getAvailableStock(product, selectedVariants);
    const fullySelected = isFullySelected(product, selectedVariants);

    const stockLabel =
        availableStock <= 0
            ? "Out of stock"
            : fullySelected && availableStock <= 5
              ? `Only ${availableStock} left`
              : "In stock";

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
                {isFrom && (
                    <span className={styles.Info__From}>From</span>
                )}

                <strong>{price.toLocaleString()} DA</strong>

                {oldPrice !== null && (
                    <>
                        <span className={styles.Info__OldPrice}>
                            {oldPrice.toLocaleString()} DA
                        </span>

                        <span className={styles.Info__Discount}>
                            -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
                        </span>
                    </>
                )}
            </div>

            <div className={styles.Info__Stock}>
                <span
                    className={
                        availableStock > 0
                            ? styles.Info__StockDot
                            : styles.Info__StockDotOut
                    }
                />

                {stockLabel}
            </div>

            {product.description && (
                <p className={styles.Info__Description}>
                    {product.description}
                </p>
            )}

            {groups.length > 0 && (
                <div className={styles.Info__Variants}>
                    <div className={styles.Info__VariantsHeader}>
                        <span>Available options</span>
                    </div>

                    {groups.map((group) => (
                        <div
                            className={styles.Info__VariantGroup}
                            key={group.type}
                        >
                            <span className={styles.Info__VariantLabel}>
                                {group.type === "color" ? "Color" : group.type}
                            </span>

                            <div
                                className={
                                    group.type === "color"
                                        ? styles.Info__ColorList
                                        : styles.Info__OptionList
                                }
                            >
                                {group.values.map((variant) => {
                                    const isSelected =
                                        selectedVariants[variant.type] ===
                                        variant.value;

                                    const status = getValueStatus(
                                        product,
                                        selectedVariants,
                                        variant.type,
                                        variant.value
                                    );

                                    const hint = status.disabled
                                        ? status.reason === "sold-out"
                                            ? `${variant.value} - sold out`
                                            : `${variant.value} - not available with your selection`
                                        : variant.value;


                                    if (variant.type === "color") {
                                        return (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                title={hint}
                                                aria-label={hint}
                                                aria-pressed={isSelected}
                                                disabled={status.disabled}
                                                className={[
                                                    styles.Info__Color,
                                                    isSelected && styles.Info__ColorActive,
                                                    status.disabled && styles.Info__Unavailable,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                style={{
                                                    backgroundColor:
                                                        variant.color_hex ||
                                                        "#ffffff",
                                                }}
                                                onClick={() =>
                                                    onSelectVariant(variant)
                                                }
                                            />
                                        );
                                    }

                                    return (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            title={hint}
                                            aria-pressed={isSelected}
                                            disabled={status.disabled}
                                            className={[
                                                styles.Info__Option,
                                                isSelected && styles.Info__OptionActive,
                                                status.disabled && styles.Info__Unavailable,
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                            onClick={() =>
                                                onSelectVariant(variant)
                                            }
                                        >
                                            {variant.value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
