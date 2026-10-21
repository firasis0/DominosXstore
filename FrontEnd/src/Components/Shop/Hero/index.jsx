import styles from "./styles.module.scss";
import { useStoreBranding } from "@/Context/StoreBrandingContext";

export default function Hero() {
  const { name: storeName } = useStoreBranding();

  return (
    <section id="shop" className={styles.Hero}>
      <div className={styles.Hero__Container}>
        <span  className={styles.Hero__Eyebrow}>
          {storeName} Shop
        </span>

        <h1 className={styles.Hero__Title}>
          Everything you need
          <br />
          to play.
        </h1>

        <p className={styles.Hero__Description}>
          Discover gaming gear selected for performance,
          comfort, and everyday gaming.
        </p>
      </div>
    </section>
  );
}