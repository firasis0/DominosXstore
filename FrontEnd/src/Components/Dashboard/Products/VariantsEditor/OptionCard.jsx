import { Palette, Plus, Trash2, X } from "lucide-react";

import ImagePicker from "./ImagePicker";
import { newValue } from "./variantsForm";

import styles from "./styles.module.scss";

// One option (Color, Model, Size...) and the values the customer can pick from.
export default function OptionCard({
    option,
    images,
    usedValueIds,
    onChange,
    onRemove,
    onRemoveValue,
}) {
    const isColor = option.kind === "color";

    const updateValue = (valueId, changes) => {
        onChange({
            ...option,
            values: option.values.map((item) =>
                item.id === valueId ? { ...item, ...changes } : item
            ),
        });
    };

    return (
        <div className={styles.Option}>
            <div className={styles.Option__Head}>
                {isColor ? (
                    <strong className={styles.Option__Title}>
                        <Palette size={15} />
                        Color
                    </strong>
                ) : (
                    <input
                        value={option.name}
                        onChange={(event) =>
                            onChange({ ...option, name: event.target.value })
                        }
                        placeholder="Option name (e.g. Model, Size, Diameter)"
                        aria-label="Option name"
                    />
                )}

                <button
                    type="button"
                    className={styles.Option__Remove}
                    onClick={onRemove}
                    aria-label="Remove this option"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className={styles.Option__Values}>
                {option.values.map((item) => (
                    <div className={styles.Value} key={item.id}>
                        {isColor && (
                            <label
                                className={styles.Value__Swatch}
                                title="Choose color"
                            >
                                <input
                                    type="color"
                                    value={item.color_hex || "#000000"}
                                    onChange={(event) =>
                                        updateValue(item.id, {
                                            color_hex: event.target.value,
                                        })
                                    }
                                />
                                <span
                                    style={{
                                        backgroundColor:
                                            item.color_hex || "#000000",
                                    }}
                                />
                            </label>
                        )}

                        <input
                            className={styles.Value__Name}
                            value={item.value}
                            onChange={(event) =>
                                updateValue(item.id, {
                                    value: event.target.value,
                                })
                            }
                            placeholder={isColor ? "Black" : "Value"}
                            aria-label="Value name"
                        />

                        <ImagePicker
                            images={images}
                            value={item.image_url}
                            onChange={(url) =>
                                updateValue(item.id, { image_url: url })
                            }
                        />

                        <button
                            type="button"
                            className={styles.Value__Remove}
                            onClick={() => onRemoveValue(item.id)}
                            aria-label="Remove value"
                        >
                            <X size={13} />
                        </button>

                        {item.value.trim() && !usedValueIds.has(item.id) && (
                            <span
                                className={styles.Value__Unused}
                                title="No variant uses this value yet. Add it in the table below."
                            >
                                unused
                            </span>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    className={styles.Option__AddValue}
                    onClick={() =>
                        onChange({
                            ...option,
                            values: [...option.values, newValue(option.kind)],
                        })
                    }
                >
                    <Plus size={13} />
                    Add value
                </button>
            </div>
        </div>
    );
}
