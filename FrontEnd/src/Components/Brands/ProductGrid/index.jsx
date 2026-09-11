import styles from "./styles.module.scss";
import ProductsData from '../../../../Data/ProductsData.json'
import ProductCard from "./ProductCard";
export default function ProductGrid(props) {
  const brand_id = props.id
  const products = ProductsData.products.filter(item => String(item.brand_id) == brand_id)

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