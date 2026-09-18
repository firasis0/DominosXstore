import Sidebar from "@/Components/Dashboard/Sidebar";
import Orders from "@/Components/Dashboard/Orders";
import styles from "@/Components/Dashboard/styles.module.scss";

export default function DashboardOrdersPage() {
  return (
    <div className={styles.Dashboard}>
      <Sidebar activeItem="Orders" />
      <div className={styles.Dashboard__Main}>
        <main className={styles.Dashboard__Content}><Orders /></main>
      </div>
    </div>
  );
}
