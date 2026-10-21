
import { Link } from "react-router-dom";

import { resolveStoreImageUrl } from "@/lib/storeData";
import ProductCardAddToCart from "@/Components/ProductCardAddToCart";
import styles from "./styles.module.scss";

export default function ProductCard({ product }) {
  const primaryImage = resolveStoreImageUrl(product.images?.[0]);
  const productUrl = `/shop/${product.id}`;

  const currentPrice =
    product.is_on_sale && product.discount_price != null
      ? product.discount_price
      : product.price;

  return (
    <article className={styles.ProductCard}>
      <div className={styles.ProductCard__ImageWrapper}>
        {product.is_on_sale && (
          <span className={styles.ProductCard__Badge}>
            تخفيض
          </span>
        )}

        <Link
          to={productUrl}
          className={styles.ProductCard__ImageLink}
        >
          <img
            src={primaryImage}
            alt={product.name}
            className={styles.ProductCard__Image}
            loading="lazy"
          />
        </Link>

        <ProductCardAddToCart
          product={product}
          className={styles.ProductCard__Cart}
        />
      </div>

      <Link
        to={productUrl}
        className={styles.ProductCard__Content}
      >
        {product.brand_name && (
          <span className={styles.ProductCard__Brand}>
            {product.brand_name}
          </span>
        )}

        <h3 className={styles.ProductCard__Name}>
          {product.name}
        </h3>

        <div className={styles.ProductCard__Prices}>
          <span className={styles.ProductCard__Price}>
            {Number(currentPrice || 0).toLocaleString("ar-DZ")} دج
          </span>

          {product.is_on_sale &&
            product.discount_price != null && (
              <span className={styles.ProductCard__OldPrice}>
                {Number(product.price).toLocaleString("ar-DZ")} دج
              </span>
            )}
        </div>
      </Link>
    </article>
  );
}
