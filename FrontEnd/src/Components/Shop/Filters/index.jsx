import styles from "./styles.module.scss";

import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function Filters() {
  return (
    <section className={styles.Filters}>
      <div className={styles.Filters__Container}>
        <div className={styles.Filters__Left}>
          <button className={styles.Filters__Button}>
            <SlidersHorizontal />
            Filters
          </button>

          <span className={styles.Filters__Count}>
            All Products
          </span>
        </div>

        <button className={styles.Filters__Sort}>
          <span>Sort by: Featured</span>
          <ChevronDown />
        </button>
      </div>
    </section>
  );
}