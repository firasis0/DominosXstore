import { Link } from "react-router-dom";
import styles from "./styles.module.scss";


export default function Brands(props) {
  const brands = props.data;

  return (
    <section className={styles.Categories}>
      <div className={styles.Categories__Container}>

        <div className={styles.Categories__Header}>
          <span className={styles.Categories__Subtitle}>
            Explore
          </span>

          <h2 className={styles.Categories__Title}>
            {props.title}
          </h2>
        </div>

        <div className={styles.Categories__Grid}>
          {brands.map((brand) => (
            <Link
              to={`/brands/${brand.name}#brand-detail-header`}
              key={brand.id}
              className={styles.Category}
            >
              <div className={styles.Category__ImageWrapper}>
                <img
                  src={brand.img}
                  alt={brand.name}
                  className={styles.Category__Image}
                />
              </div>

              <span className={styles.Category__Name}>
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}