import styles from "./styles.module.scss";
import { useStoreBranding } from "../../Context/StoreBrandingContext";

export default function Loader() {
  const { name, logoUrl } = useStoreBranding();

  return (
    <div className={styles.Loader}>
      <div className={styles.Loader__Content}>

        <div className={styles.Loader__LogoWrapper}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={name}
              className={styles.Loader__Logo}
            />
          )}
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