import Sidebar from "@/Components/Dashboard/Sidebar";
import Products from "@/Components/Dashboard/Products";
import styles from "@/Components/Dashboard/styles.module.scss";

export default function DashboardProductsPage() {
  return (
    <div className={styles.Dashboard}>
      <Sidebar activeItem="Products" />
      <div className={styles.Dashboard__Main}>
        <main className={styles.Dashboard__Content}><Products /></main>
      </div>
    </div>
  );
}
