import styles from "./styles.module.scss";

import ProductCard from "./ProductCard";


export default function ProductGrid({ products }) {


    
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