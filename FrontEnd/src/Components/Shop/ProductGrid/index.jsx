import styles from "./styles.module.scss";

import ProductsData from "../../../../Data/ProductsData.json";

import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const products = Array.isArray(ProductsData)
    ? ProductsData
    : ProductsData.products ?? [ProductsData];

  return (
    <section id="deals" className={styles.ProductGrid}>
      <div className={styles.ProductGrid__Container}>
        <div className={styles.ProductGrid__Grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}