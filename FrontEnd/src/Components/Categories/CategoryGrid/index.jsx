import styles from "./styles.module.scss";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStoreCategories, resolveStoreImageUrl } from "@/lib/storeData";

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchStoreCategories()
      .then((data) => setCategories(data.filter((category) => category.is_active)))
      .catch((error) => console.error("Error fetching store categories:", error));
  }, []);

  return (
    <section className={styles.CategoryGrid}>
      <div className={styles.CategoryGrid__Container}>
        <div className={styles.CategoryGrid__Header}>
          <span className={styles.CategoryGrid__Eyebrow}>
            Explore
          </span>

          <h2 className={styles.CategoryGrid__Title}>
            Shop by category
          </h2>
        </div>

        <div className={styles.CategoryGrid__Grid}>
          {categories.map((category) => (
              <Link
              key={category.id}
              to={`/categories/${category.name}#category-detail-header`}
              className={styles.CategoryCard}
              >

              
              <div className={styles.CategoryCard__ImageWrapper}>
                <img
                  src={resolveStoreImageUrl(category.image_url)}
                  alt={category.name}
                  className={styles.CategoryCard__Image}
                />
              </div>

              <div className={styles.CategoryCard__Info}>
                <h3 className={styles.CategoryCard__Name}>
                  {category.name}
                </h3>

                <span className={styles.CategoryCard__Arrow}>
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}