import styles from "./styles.module.scss";

import BrandsData from "../../../../Data/BrandsData.json";
import { Link } from "react-router-dom";

export default function PopularBrands() {
  const brands = BrandsData.brands;

  return (
    <section className={styles.PopularBrands}>
      <div className={styles.PopularBrands__Container}>
        <div className={styles.PopularBrands__Header}>
          <span className={styles.PopularBrands__Eyebrow}>
            Popular Brands
          </span>

          <h2 className={styles.PopularBrands__Title}>
            Shop by brand
          </h2>

          <p className={styles.PopularBrands__Description}>
            Discover gaming gear from brands trusted by gamers
            around the world.
          </p>
        </div>

        <div className={styles.PopularBrands__Grid}>
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brands/${brand.name}#brand-detail-header`}
              className={styles.BrandCard}
            >
              <div className={styles.BrandCard__LogoWrapper}>
                <img
                  src={brand.image_url}
                  alt={brand.name}
                  className={styles.BrandCard__Logo}
                />
              </div>

              <div className={styles.BrandCard__Info}>
                <span className={styles.BrandCard__Name}>
                  {brand.name}
                </span>

                <span className={styles.BrandCard__Arrow}>
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
