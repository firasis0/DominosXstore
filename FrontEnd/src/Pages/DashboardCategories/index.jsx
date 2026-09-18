import Sidebar from "@/Components/Dashboard/Sidebar";
import Categories from "@/Components/Dashboard/Categories";
import styles from "@/Components/Dashboard/styles.module.scss";

const DashboardCategories = () => {
  return (
    <div className={styles.Dashboard}>
      <Sidebar activeItem="Categories" />
      <div className={styles.Dashboard__Main}>
        <main className={styles.Dashboard__Content}><Categories /></main>
      </div>
    </div>
  );
};

export default DashboardCategories;