import { Check, Package } from "lucide-react";

import brandsData from "@/../Data/BrandsData.json";

import styles from "./styles.module.scss";

export default function Info({ product }) {
  const brand = brandsData.brands.find(
    (item) => item.id === product.brand_id
  );

  const hasDiscount =
    product.is_on_sale && product.discount_price != null;

  const currentPrice = hasDiscount
    ? product.discount_price
    : product.price;



  return (
    <section className={styles.Info}>
      {brand && (
        <span className={styles.Info__Brand}>
          {brand.name}
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
                ((product.price - product.discount_price) /
                  product.price) *
                  100
              )}
              %
            </span>
          </>
        )}
      </div>


      {product.description && (
        <p className={styles.Info__Description}>
          {product.description}
        </p>
      )}

      {product.variants?.length > 0 && (
        <div className={styles.Info__Variants}>
          <div className={styles.Info__VariantsHeader}>
            <Package size={17} />
            <span>Available options</span>
          </div>

          <div className={styles.Info__VariantList}>
            {product.variants.map((variant) => (
              <div
                className={styles.Info__Variant}
                key={variant.id}
              >
                <span>{variant.type}</span>
                <strong>{variant.value}</strong>
                <Check size={15} />
              </div>
            ))}
          </div>
        </div>
      )}

     
    </section>
  );
}
