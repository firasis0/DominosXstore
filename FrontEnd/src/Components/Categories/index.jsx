import styles from "./styles.module.scss";

import Hero from "./Hero";
import CategoryGrid from "./CategoryGrid";
import PopularBrands from "./PopularBrands";

export default function Categories() {
  return (
    <main className={styles.Categories}>
      <Hero />
      <CategoryGrid />
      <PopularBrands/>
    </main>
  );
}