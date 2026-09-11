import styles from "./styles.module.scss";

import { Link } from "react-router-dom";
import { Handbag } from "lucide-react";

import brandsData from "@/../Data/BrandsData.json";



export default function ProductCard({ product }) {
  const primaryImage = product.images?.[0];
  const productUrl = `/product/${product.id}`;

  const brand = brandsData.brands.find(
    (item) => item.id === product.brand_id
  );  

  const currentPrice =
    product.is_on_sale && product.discount_price != null
      ? product.discount_price
      : product.price;

  return (
    <article className={styles.ProductCard}>
      <div className={styles.ProductCard__ImageWrapper}>
        {product.is_on_sale && (
          <span className={styles.ProductCard__Badge}>
            Sale
          </span>
        )}

        

        <Link to={productUrl} className={styles.ProductCard__ImageLink}>
          <img
            src={primaryImage}
            alt={product.name}
            className={styles.ProductCard__Image}
          />
        </Link>

        <Link to={productUrl} className={styles.ProductCard__Cart}>
          <Handbag />
          أطلب الآن
        </Link>
      </div>

      <Link to={productUrl} className={styles.ProductCard__Content}>
        {brand && (
          <span className={styles.ProductCard__Brand}>
            {brand.name}
          </span>
        )}

        <h3 className={styles.ProductCard__Name}>
          {product.name}
        </h3>

        <div className={styles.ProductCard__Prices}>
          <span className={styles.ProductCard__Price}>
            {currentPrice.toLocaleString()} DA
          </span>

          {product.is_on_sale && product.discount_price != null && (
            <span className={styles.ProductCard__OldPrice}>
              {product.price.toLocaleString()} DA
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
