import styles from "./styles.module.scss";
import ProductsData from '../../../../Data/ProductsData.json'
import ProductCard from "./ProductCard";
export default function ProductGrid(props) {
  const products = ProductsData.products.filter(item => item.category_id === props.categoryId)

  return (
    <section id="category-products" className={styles.ProductGrid}>
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