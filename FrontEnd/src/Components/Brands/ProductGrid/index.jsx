import styles from "./styles.module.scss";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { fetchStoreProducts } from "@/lib/storeData";
export default function ProductGrid(props) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchStoreProducts()
      .then((data) => setProducts(data.filter((product) => String(product.brand_id) === String(props.id))))
      .catch(() => undefined);
  }, [props.id]);

  return (
    <section id="brand-products" className={styles.ProductGrid}>
      <div className={styles.ProductGrid__Container}>
        <div className={styles.ProductGrid__Grid}>
          {products.map((product) => (
            <ProductCard
          key={product.id}
          product={product}/>
          ))}
        </div>
      </div>
    </section>
  );
}