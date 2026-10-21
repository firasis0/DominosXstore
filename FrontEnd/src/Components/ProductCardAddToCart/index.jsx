import { useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { useCart } from "@/Context/CartContext";
import styles from "./styles.module.scss";

const getVariantGroups = (variants) =>
  variants.reduce((groups, variant) => {
    if (!groups[variant.type]) {
      groups[variant.type] = [];
    }

    groups[variant.type].push(variant);
    return groups;
  }, {});

const getVariantLabel = (type) => {
  if (type.toLowerCase() === "color") {
    return "اللون";
  }

  if (type.toLowerCase() === "size") {
    return "المقاس";
  }

  return type;
};

export default function ProductCardAddToCart({
  product,
  className,
}) {
  const { addToCart } = useCart();
  const variantGroups = useMemo(
    () => getVariantGroups(product.variants ?? []),
    [product.variants]
  );
  const variantTypes = Object.keys(variantGroups);
  const hasVariants = variantTypes.length > 0;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [cartMessage, setCartMessage] = useState("");
  const isOutOfStock = Number(product.stock) <= 0;
  const hasSelectedAllVariants = variantTypes.every(
    (type) => selectedVariants[type]
  );

  const handleAddToCart = () => {
    setCartMessage("");

    if (isOutOfStock) {
      return;
    }

    if (hasVariants) {
      setSelectedVariants({});
      setIsDialogOpen(true);
      return;
    }

    const added = addToCart(product, {}, 1);
    setCartMessage(
      added
        ? "تمت إضافة المنتج إلى السلة"
        : "تعذرت إضافة المنتج إلى السلة، تحقق من توفره"
    );
  };

  const handleConfirmVariants = () => {
    if (!hasSelectedAllVariants) {
      return;
    }

    const added = addToCart(product, selectedVariants, 1);
    setCartMessage(
      added
        ? "تمت إضافة المنتج إلى السلة"
        : "تعذرت إضافة المنتج إلى السلة، تحقق من توفره"
    );

    if (added) {
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        aria-label={
          hasVariants
            ? `اختر خيارات ${product.name} لإضافته إلى السلة`
            : `أضف ${product.name} إلى السلة`
        }
      >
        <ShoppingCart aria-hidden="true" />
        {isOutOfStock ? "غير متوفر" : "أضف إلى السلة"}
      </button>

      {cartMessage && (
        <p
          className={styles.CartMessage}
          role="status"
          aria-live="polite"
          dir="rtl"
        >
          {cartMessage}
        </p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={styles.VariantDialog} dir="rtl">
          <DialogHeader className={styles.VariantDialog__Header}>
            <DialogTitle className={styles.VariantDialog__Title}>
              اختر خيارات المنتج
            </DialogTitle>
            <DialogDescription className={styles.VariantDialog__Description}>
              {product.name}
            </DialogDescription>
          </DialogHeader>

          <div className={styles.VariantDialog__Groups}>
            {Object.entries(variantGroups).map(([type, options]) => (
              <fieldset className={styles.VariantGroup} key={type}>
                <legend className={styles.VariantGroup__Label}>
                  {getVariantLabel(type)}
                </legend>
                <div className={styles.VariantGroup__Options}>
                  {options.map((variant) => {
                    const isSelected =
                      selectedVariants[type] === variant.value;

                    return (
                      <button
                        key={variant.id ?? `${type}-${variant.value}`}
                        type="button"
                        className={[
                          styles.VariantOption,
                          variant.type.toLowerCase() === "color"
                            ? styles["VariantOption--color"]
                            : "",
                          isSelected ? styles["VariantOption--selected"] : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() =>
                          setSelectedVariants((current) => ({
                            ...current,
                            [type]: variant.value,
                          }))
                        }
                        aria-pressed={isSelected}
                      >
                        {variant.type.toLowerCase() === "color" && (
                          <span
                            className={styles.VariantOption__Swatch}
                            style={{
                              backgroundColor: variant.color_hex || "#ffffff",
                            }}
                            aria-hidden="true"
                          />
                        )}
                        <span>{variant.value}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <DialogFooter className={styles.VariantDialog__Footer}>
            <button
              type="button"
              className={styles.VariantDialog__Submit}
              onClick={handleConfirmVariants}
              disabled={!hasSelectedAllVariants || isOutOfStock}
            >
              <ShoppingCart size={17} aria-hidden="true" />
              أضف إلى السلة
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
