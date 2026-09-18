import styles from "./styles.module.scss";

export default function Hero() {
  return (
    <section className={styles.Hero}>
      <div className={styles.Hero__Container}>
        <span className={styles.Hero__Eyebrow}>
          Gaming Categories
        </span>

        <h1 className={styles.Hero__Title}>
          Find your gear.
        </h1>

        <p className={styles.Hero__Description}>
          Explore gaming equipment built for performance,
          comfort, and the way you play.
        </p>
      </div>
    </section>
  );
}