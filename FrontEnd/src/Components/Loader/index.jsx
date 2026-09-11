import styles from "./styles.module.scss";

export default function Loader() {
  return (
    <div className={styles.Loader}>
      <div className={styles.Loader__Content}>

        <div className={styles.Loader__LogoWrapper}>
          <img
            src="/images/logo/dominos_logo.jpg"
            alt="DOMINOS"
            className={styles.Loader__Logo}
          />
        </div>

        <div className={styles.Loader__Loading}>
          <div className={styles.Loader__Bar} />
        </div>

        <p className={styles.Loader__Text}>
          Loading...
        </p>

      </div>
    </div>
  );
}