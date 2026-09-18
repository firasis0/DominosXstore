import Sidebar from "@/Components/Dashboard/Sidebar";
import Brands from "@/Components/Dashboard/Brands";
import styles from "@/Components/Dashboard/styles.module.scss";

const DashboardBrands = () => {
  return (
    <div className={styles.Dashboard}>
      <Sidebar activeItem="Brands" />
      <div className={styles.Dashboard__Main}>
        <main className={styles.Dashboard__Content}>
          <Brands />
        </main>
      </div>
    </div>
  );
};

export default DashboardBrands;
