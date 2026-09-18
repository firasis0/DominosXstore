import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { fetchStoreCategories, resolveStoreImageUrl } from "@/lib/storeData";


export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchStoreCategories()
      .then((data) => setCategories(data.filter((category) => category.is_active)))
      .catch((error) => console.error("Error fetching store categories:", error));
  }, []);

  return (
    <section className={styles.Categories}>
      <div className={styles.Categories__Container}>

        <div className={styles.Categories__Header}>
          <span className={styles.Categories__Subtitle}>
            Explore
          </span>

          <h2 className={styles.Categories__Title}>
            Shop by Category
          </h2>
        </div>

        <div className={styles.Categories__Grid}>
          {categories.map((category) => (
            <Link
              to={`/categories/${category.name}#category-detail-header`}
              key={category.id}
              className={styles.Category}
            >
              <div className={styles.Category__ImageWrapper}>
                <img
                  src={resolveStoreImageUrl(category.image_url)}
                  alt={category.name}
                  className={styles.Category__Image}
                />
              </div>

              <span className={styles.Category__Name}>
                {category.name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}