import { useState } from "react";

import { ChevronDown, Trash2 } from "lucide-react";

import { TableCell, TableRow } from "@/Components/ui/table";
import { Switch } from "@/Components/ui/switch";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

import ProductForm from "../ProductForm";

import styles from "../styles.module.scss";

const formatPrice = (price) =>
    `${Number(price).toLocaleString("fr-DZ")} DA`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getServerBaseUrl = () => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
};

const getImageUrl = (url) => {
    if (!url) return "";

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `${getServerBaseUrl()}${url}`;
};

// Convert a product from the API into the shape used by ProductForm
const toFormValues = (product) => ({
    name: product.name,
    description: product.description ?? "",

    price: product.price,

    discount_price:
        product.discount_price ?? "",

    category_id:
        String(product.category_id),

    brand_id:
        String(product.brand_id),

    stock: product.stock,

    is_on_sale:
        product.is_on_sale,

    is_active:
        product.is_active,

    images: (product.images ?? []).map(
        (url, index) => ({
            id: `img-${index}-${url}`,
            url,
        })
    ),

    variants: (product.variants ?? []).map(
        (variant) => ({
            id:
                variant.id ??
                `variant-${Date.now()}-${Math.random()}`,

            type: variant.type,

            value: variant.value,

            color_hex:
                variant.color_hex ?? "#000000",
        })
    ),
});

export default function ProductRow({
    product,
    isExpanded,
    onToggleExpand,
    onToggleActive,
    onSave,
    onRemove,
    categoryOptions,
    brandOptions,
}) {
    const [draft, setDraft] = useState(() =>
        toFormValues(product)
    );

    const handleToggleExpand = () => {
        if (!isExpanded) {
            setDraft(toFormValues(product));
        }

        onToggleExpand();
    };

    const handleSave = () => {
        onSave(product.id, {
            name: draft.name,

            description: draft.description,

            price: Number(draft.price),

            discount_price:
                draft.discount_price === ""
                    ? null
                    : Number(draft.discount_price),

            category_id:
                Number(draft.category_id),

            brand_id:
                Number(draft.brand_id),

            stock:
                Number(draft.stock),

            is_on_sale:
                draft.is_on_sale,

            is_active:
                draft.is_active,

            images:
                draft.images.map(
                    (image) => image.url
                ),

            variants:
                draft.variants.map(
                    (variant) => ({
                        type: variant.type,
                        value: variant.value,
                        color_hex:
                            variant.type === "color"
                                ? variant.color_hex ||
                                  "#000000"
                                : null,
                    })
                ),
        });
    };

    return (
        <>
            <TableRow
                className={
                    isExpanded
                        ? styles.Products__RowExpanded
                        : undefined
                }
            >
                <TableCell>
                    <div
                        className={
                            styles.Products__Product
                        }
                    >
                        <div
                            className={
                                styles.Products__Image
                            }
                        >
                            <img
                                src={getImageUrl(
                                    product.images?.[0]
                                )}
                                alt=""
                            />
                        </div>

                        <div>
                            <strong>
                                {product.name}
                            </strong>

                            <span>
                                SKU-
                                {String(product.id).padStart(
                                    4,
                                    "0"
                                )}
                                {" · "}
                                {product.brand_name ||
                                    "No brand"}
                            </span>
                        </div>
                    </div>
                </TableCell>

                <TableCell>
                    {product.category_name ||
                        "Uncategorized"}
                </TableCell>

                <TableCell>
                    <div
                        className={
                            styles.Products__Price
                        }
                    >
                        <strong>
                            {formatPrice(
                                product.discount_price ||
                                    product.price
                            )}
                        </strong>

                        {product.discount_price != null && (
                            <del>
                                {formatPrice(
                                    product.price
                                )}
                            </del>
                        )}

                        {product.is_on_sale && (
                            <span
                                className={
                                    styles.Products__SaleTag
                                }
                            >
                                Sale
                            </span>
                        )}
                    </div>
                </TableCell>

                <TableCell>
                    <span
                        className={
                            product.stock <= 5
                                ? styles.StockLow
                                : styles.Stock
                        }
                    >
                        {product.stock}{" "}
                        {product.stock === 1
                            ? "unit"
                            : "units"}
                    </span>
                </TableCell>

                <TableCell>
                    <Switch
                        checked={
                            product.is_active
                        }
                        onCheckedChange={(checked) =>
                            onToggleActive(
                                product.id,
                                checked
                            )
                        }
                        aria-label={
                            `${
                                product.is_active
                                    ? "Deactivate"
                                    : "Activate"
                            } ${product.name}`
                        }
                    />
                </TableCell>

                <TableCell>
                    <div
                        className={
                            styles.Products__Actions
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.Products__Edit
                            }
                            onClick={
                                handleToggleExpand
                            }
                            aria-label={
                                `${
                                    isExpanded
                                        ? "Close"
                                        : "Edit"
                                } ${product.name}`
                            }
                            aria-expanded={
                                isExpanded
                            }
                        >
                            <ChevronDown
                                size={16}
                                className={
                                    isExpanded
                                        ? styles.Products__ChevronOpen
                                        : undefined
                                }
                            />

                            <span>Edit</span>
                        </button>

                        <AlertDialog>
                            <AlertDialogTrigger
                                className={
                                    styles.Products__Delete
                                }
                                aria-label={
                                    `Remove ${product.name}`
                                }
                            >
                                <Trash2 size={16} />
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Remove this product?
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>
                                        "{product.name}" will
                                        be removed from the
                                        catalog. This can't
                                        be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                        onClick={() =>
                                            onRemove(
                                                product.id
                                            )
                                        }
                                    >
                                        Remove
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
            </TableRow>

            {isExpanded && (
                <TableRow
                    className={
                        styles.Products__EditRow
                    }
                >
                    <TableCell colSpan={6}>
                        <div
                            className={
                                styles.Products__EditPanel
                            }
                        >
                            <ProductForm
                                values={draft}
                                onChange={setDraft}
                                categoryOptions={
                                    categoryOptions
                                }
                                brandOptions={
                                    brandOptions
                                }
                                idPrefix={`edit-${product.id}`}
                                readOnlyInfo={
                                    `SKU-${String(
                                        product.id
                                    ).padStart(
                                        4,
                                        "0"
                                    )} · ${new Date(
                                        product.created_at
                                    ).toLocaleDateString(
                                        "fr-DZ"
                                    )}`
                                }
                            />

                            <div
                                className={
                                    styles.Products__EditActions
                                }
                            >
                                <button
                                    type="button"
                                    onClick={
                                        onToggleExpand
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className={
                                        styles.Products__Save
                                    }
                                    onClick={handleSave}
                                >
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}