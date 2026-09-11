import styles from "./styles.module.scss";

import Hero from "./Hero";
import Filters from "./Filters";
import ProductGrid from "./ProductGrid";

export default function Shop() {
  return (
    <main className={styles.Shop}>
      <Hero />
      <Filters />
      <ProductGrid />
    </main>
  );
}