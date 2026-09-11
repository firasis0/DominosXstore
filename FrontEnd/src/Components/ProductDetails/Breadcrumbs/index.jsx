import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

export default function Breadcrumbs({ product }) {
  return (
    <nav className={styles.Breadcrumbs} aria-label="Breadcrumb">
      <Link to="/" className={styles.Breadcrumbs__Link}>
        <Home size={15} />
        <span>Home</span>
      </Link>

      <ChevronRight size={15} className={styles.Breadcrumbs__Separator} />

      <Link to="/shop" className={styles.Breadcrumbs__Link}>
        Shop
      </Link>

      <ChevronRight size={15} className={styles.Breadcrumbs__Separator} />

      <span className={styles.Breadcrumbs__Current}>
        {product.name}
      </span>
    </nav>
  );
}