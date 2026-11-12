import { useState } from "react";

import { X } from "lucide-react";

import ProductForm from "../ProductForm";
import {
    emptyVariantsState,
    validateVariants,
    variantsToPayload,
} from "../VariantsEditor/variantsForm";

import styles from "../styles.module.scss";

const emptyValues = () => ({
    name: "",

    description: "",

    category_id: "",

    brand_id: "",

    is_on_sale: false,

    is_active: true,

    images: [],

    // options + skus (stock and price live on each variant)
    ...emptyVariantsState(),
});

export default function AddProductModal({
    categoryOptions,
    brandOptions,
    onClose,
    onCreate,
}) {
    const [values, setValues] =
        useState(emptyValues);

    const [validationError, setValidationError] =
        useState("");

    const handleValuesChange = (nextValues) => {
        setValues(nextValues);

        if (validationError) {
            setValidationError("");
        }
    };

    const handleCreate = async () => {
        setValidationError("");

        if (!values.name.trim()) {
            return setValidationError("Enter the product name.");
        }

        if (!values.brand_id || !values.category_id) {
            return setValidationError("Choose a brand and a category.");
        }

        const variantError = validateVariants(values, {
            isOnSale: values.is_on_sale,
        });

        if (variantError) {
            return setValidationError(variantError);
        }

        const message = await onCreate({
            name: values.name.trim(),

            description: values.description,

            category_id:
                Number(values.category_id),

            brand_id:
                Number(values.brand_id),

            is_on_sale:
                values.is_on_sale,

            is_active:
                values.is_active,

            images:
                values.images.map(
                    (image) => image.url
                ),

            ...variantsToPayload(values),
        });

        if (message) {
            setValidationError(message);
        }
    };

    return (
        <div
            className={
                styles.Products__ModalOverlay
            }
            onClick={onClose}
        >
            <div
                className={
                    styles.Products__Modal
                }
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div
                    className={
                        styles.Products__ModalHeader
                    }
                >
                    <div>
                        <span>Catalog</span>

                        <h2>Add product</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close add product dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div
                    className={
                        styles.Products__ModalBody
                    }
                >
                    <ProductForm
                        values={values}
                        onChange={
                            handleValuesChange
                        }
                        categoryOptions={
                            categoryOptions
                        }
                        brandOptions={
                            brandOptions
                        }
                        idPrefix="new-product"
                    />
                </div>

                {validationError && (
                    <p
                        className={
                            styles.Products__ValidationError
                        }
                    >
                        {validationError}
                    </p>
                )}

                <div
                    className={
                        styles.Products__ModalActions
                    }
                >
                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={
                            styles.Products__Save
                        }
                        onClick={handleCreate}
                    >
                        Save product
                    </button>
                </div>
            </div>
        </div>
    );
}