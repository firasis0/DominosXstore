import { Palette, Plus, Sparkles, X } from "lucide-react";

import OptionCard from "./OptionCard";
import {
    combinationKey,
    generateCombinations,
    missingCombinations,
    newOption,
    newSku,
    skusUsingValue,
    startingPrice,
    totalStock,
} from "./variantsForm";

import styles from "./styles.module.scss";

const optionTitle = (option) =>
    option.kind === "color" ? "Color" : option.name.trim() || "Option";

export default function VariantsEditor({
    options,
    skus,
    images,
    isOnSale,
    onChange,
}) {
    const emit = (changes) => onChange({ options, skus, ...changes });

    const hasColor = options.some((option) => option.kind === "color");

    const usedValueIds = new Set(
        skus.flatMap((sku) => Object.values(sku.options))
    );

    const missingCount = missingCombinations({ options, skus }).length;

    const stockTotal = totalStock(skus);
    const fromPrice = startingPrice(skus, isOnSale);

    // ---- options ----------------------------------------------------------

    const changeOption = (nextOption) =>
        emit({
            options: options.map((option) =>
                option.id === nextOption.id ? nextOption : option
            ),
        });

    const removeOption = (option) => {
        const nextOptions = options.filter((item) => item.id !== option.id);
        const seen = new Set();
        const nextSkus = [];

        for (const sku of skus) {
            const rest = { ...sku.options };
            delete rest[option.id];

            const candidate = { ...sku, options: rest };
            const key = combinationKey(nextOptions, candidate);

            if (!seen.has(key)) {
                seen.add(key);
                nextSkus.push(candidate);
            }
        }

        const merged = skus.length - nextSkus.length;

        if (
            merged > 0 &&
            !window.confirm(
                `Removing "${optionTitle(option)}" merges ${merged} variant(s) into the others. Continue?`
            )
        ) {
            return;
        }

        emit({ options: nextOptions, skus: nextSkus });
    };

    const removeValue = (option, valueId) => {
        const affected = skusUsingValue(skus, option.id, valueId);

        if (
            affected.length > 0 &&
            !window.confirm(
                `This value is used by ${affected.length} variant(s). They will be removed too. Continue?`
            )
        ) {
            return;
        }

        const affectedIds = new Set(affected.map((sku) => sku.id));

        emit({
            options: options.map((item) =>
                item.id === option.id
                    ? {
                          ...item,
                          values: item.values.filter(
                              (value) => value.id !== valueId
                          ),
                      }
                    : item
            ),
            skus: skus.filter((sku) => !affectedIds.has(sku.id)),
        });
    };

    // ---- variants (rows) ---------------------------------------------------

    const updateSku = (id, changes) =>
        emit({
            skus: skus.map((sku) =>
                sku.id === id ? { ...sku, ...changes } : sku
            ),
        });

    const removeSku = (id) =>
        emit({ skus: skus.filter((sku) => sku.id !== id) });

    const addSku = () =>
        emit({
            skus: [...skus, newSku({}, skus[skus.length - 1] ?? {})],
        });

    const generate = () =>
        emit({ skus: generateCombinations({ options, skus }) });

    const gridStyle = {
        gridTemplateColumns: [
            options.length > 0
                ? `repeat(${options.length}, minmax(110px, 1fr))`
                : "minmax(110px, 1fr)",
            "90px",
            "110px",
            isOnSale ? "110px" : null,
            "34px",
        ]
            .filter(Boolean)
            .join(" "),
    };

    return (
        <div className={styles.VariantsEditor}>
            {/* 1. Options */}
            <div className={styles.Section}>
                <div className={styles.Section__Head}>
                    <div>
                        <strong>1. Options</strong>
                        <p>
                            What can the customer choose? Add a color, or your
                            own option such as Model, Size or Diameter.
                        </p>
                    </div>

                    <div className={styles.Section__Buttons}>
                        <button
                            type="button"
                            onClick={() => emit({ options: [...options, newOption("color")] })}
                            disabled={hasColor}
                        >
                            <Palette size={13} />
                            Color
                        </button>

                        <button
                            type="button"
                            onClick={() => emit({ options: [...options, newOption("custom")] })}
                        >
                            <Plus size={13} />
                            Custom option
                        </button>
                    </div>
                </div>

                {options.length === 0 ? (
                    <p className={styles.Empty}>
                        No options. The product is sold as a single variant
                        (fill in its stock and price below).
                    </p>
                ) : (
                    <div className={styles.Option__List}>
                        {options.map((option) => (
                            <OptionCard
                                key={option.id}
                                option={option}
                                images={images}
                                usedValueIds={usedValueIds}
                                onChange={changeOption}
                                onRemove={() => removeOption(option)}
                                onRemoveValue={(valueId) =>
                                    removeValue(option, valueId)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Stock and price per variant */}
            <div className={styles.Section}>
                <div className={styles.Section__Head}>
                    <div>
                        <strong>2. Stock &amp; price per variant</strong>
                        <p>
                            One row for every combination you really sell. A
                            combination without a row (for example Red + 35mm)
                            is not available to customers.
                        </p>
                    </div>

                    <div className={styles.Section__Buttons}>
                        <button
                            type="button"
                            onClick={generate}
                            disabled={missingCount === 0}
                            title="Create a row for every combination that has none yet"
                        >
                            <Sparkles size={13} />
                            {missingCount > 0
                                ? `Generate ${missingCount} missing`
                                : "All combinations added"}
                        </button>
                    </div>
                </div>

                <div className={styles.Table__Scroll}>
                    <div className={styles.Table}>
                        <div className={styles.Table__Row + " " + styles.Table__Header} style={gridStyle}>
                            {options.length > 0 ? (
                                options.map((option) => (
                                    <span key={option.id}>{optionTitle(option)}</span>
                                ))
                            ) : (
                                <span>Variant</span>
                            )}
                            <span>Stock</span>
                            <span>Price (DA)</span>
                            {isOnSale && <span>Sale price (DA)</span>}
                            <span />
                        </div>

                        {skus.map((sku) => (
                            <div className={styles.Table__Row} style={gridStyle} key={sku.id}>
                                {options.length > 0 ? (
                                    options.map((option) => (
                                        <select
                                            key={option.id}
                                            value={sku.options[option.id] ?? ""}
                                            onChange={(event) =>
                                                updateSku(sku.id, {
                                                    options: {
                                                        ...sku.options,
                                                        [option.id]: event.target.value,
                                                    },
                                                })
                                            }
                                            aria-label={optionTitle(option)}
                                        >
                                            <option value="" disabled>
                                                Select
                                            </option>
                                            {option.values
                                                .filter((value) => value.value.trim())
                                                .map((value) => (
                                                    <option key={value.id} value={value.id}>
                                                        {value.value.trim()}
                                                    </option>
                                                ))}
                                        </select>
                                    ))
                                ) : (
                                    <span className={styles.Table__Default}>Default</span>
                                )}

                                <input
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={sku.stock}
                                    onChange={(event) =>
                                        updateSku(sku.id, { stock: event.target.value })
                                    }
                                    className={
                                        sku.stock !== "" && Number(sku.stock) === 0
                                            ? styles.Table__SoldOut
                                            : undefined
                                    }
                                    aria-label="Stock"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={sku.price}
                                    onChange={(event) =>
                                        updateSku(sku.id, { price: event.target.value })
                                    }
                                    aria-label="Price"
                                />

                                {isOnSale && (
                                    <input
                                        type="number"
                                        min="0"
                                        inputMode="numeric"
                                        placeholder="Sale"
                                        value={sku.discount_price}
                                        onChange={(event) =>
                                            updateSku(sku.id, {
                                                discount_price: event.target.value,
                                            })
                                        }
                                        aria-label="Sale price"
                                    />
                                )}

                                <button
                                    type="button"
                                    onClick={() => removeSku(sku.id)}
                                    disabled={skus.length === 1}
                                    aria-label="Remove variant"
                                    title={
                                        skus.length === 1
                                            ? "A product needs at least one variant"
                                            : "Remove variant"
                                    }
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.Footer}>
                    <button
                        type="button"
                        className={styles.Footer__Add}
                        onClick={addSku}
                    >
                        <Plus size={14} />
                        Add variant row
                    </button>

                    <p className={styles.Footer__Totals}>
                        <span>
                            Total stock <strong>{stockTotal}</strong>
                        </span>

                        {fromPrice !== null && (
                            <span>
                                Starting price{" "}
                                <strong>{fromPrice.toLocaleString("fr-DZ")} DA</strong>
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
