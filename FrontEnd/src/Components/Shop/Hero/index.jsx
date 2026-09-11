import styles from "./styles.module.scss";

export default function Hero() {
  return (
    <section id="shop" className={styles.Hero}>
      <div className={styles.Hero__Container}>
        <span  className={styles.Hero__Eyebrow}>
          DOMINOS Shop
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