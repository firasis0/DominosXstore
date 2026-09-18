import { Plus, X } from "lucide-react";

import styles from "./styles.module.scss";

let nextId = 1;

const VARIANT_TYPES = [
    {
        value: "color",
        label: "Color",
    },
    {
        value: "model",
        label: "Model",
    },
];

const getDefaultVariant = () => ({
    id: `new-${nextId++}`,
    type: "color",
    value: "",
    color_hex: "#000000",
});

export default function VariantsEditor({
    variants,
    onChange,
}) {
    const addVariant = () => {
        onChange([
            ...variants,
            getDefaultVariant(),
        ]);
    };

    const removeVariant = (id) => {
        onChange(
            variants.filter(
                (variant) => variant.id !== id
            )
        );
    };

    const updateVariant = (
        id,
        field,
        value
    ) => {
        onChange(
            variants.map((variant) => {
                if (variant.id !== id) {
                    return variant;
                }

                return {
                    ...variant,
                    [field]: value,
                };
            })
        );
    };

    const changeType = (id, type) => {
        onChange(
            variants.map((variant) => {
                if (variant.id !== id) {
                    return variant;
                }

                return {
                    ...variant,
                    type,
                    value: "",
                    color_hex:
                        type === "color"
                            ? variant.color_hex ||
                              "#000000"
                            : null,
                };
            })
        );
    };

    return (
        <div className={styles.VariantsEditor}>
            {variants.map((variant) => (
                <div
                    className={
                        styles.VariantsEditor__Row
                    }
                    key={variant.id}
                >
                    <select
                        value={variant.type}
                        onChange={(event) =>
                            changeType(
                                variant.id,
                                event.target.value
                            )
                        }
                    >
                        {VARIANT_TYPES.map(
                            (type) => (
                                <option
                                    key={type.value}
                                    value={type.value}
                                >
                                    {type.label}
                                </option>
                            )
                        )}
                    </select>

                    {variant.type ===
                    "color" ? (
                        <div
                            className={
                                styles.VariantsEditor__Color
                            }
                        >
                            <input
                                type="text"
                                value={
                                    variant.value
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateVariant(
                                        variant.id,
                                        "value",
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Color name"
                                aria-label="Color name"
                            />

                            <label
                                className={
                                    styles.VariantsEditor__ColorPicker
                                }
                                title="Choose color"
                            >
                                <input
                                    type="color"
                                    value={
                                        variant.color_hex ||
                                        "#000000"
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateVariant(
                                            variant.id,
                                            "color_hex",
                                            event.target
                                                .value
                                        )
                                    }
                                />

                                <span
                                    style={{
                                        backgroundColor:
                                            variant.color_hex ||
                                            "#000000",
                                    }}
                                />

                                <strong>
                                    {variant.color_hex ||
                                        "#000000"}
                                </strong>
                            </label>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={
                                variant.value
                            }
                            onChange={(event) =>
                                updateVariant(
                                    variant.id,
                                    "value",
                                    event.target.value
                                )
                            }
                            placeholder="Model (e.g. G Pro X2)"
                            aria-label="Model"
                        />
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            removeVariant(
                                variant.id
                            )
                        }
                        aria-label="Remove variant"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}

            <button
                type="button"
                className={
                    styles.VariantsEditor__Add
                }
                onClick={addVariant}
            >
                <Plus size={14} />
                Add variant
            </button>
        </div>
    );
}