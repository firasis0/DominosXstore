import styles from "./styles.module.scss";

import Sidebar from "./Sidebar";

import Overview from "./Overview";

export default function Dashboard() {
  return (
    <div className={styles.Dashboard}>
      <Sidebar />

      <div className={styles.Dashboard__Main}>


        <main className={styles.Dashboard__Content}>
          <Overview />
        </main>
      </div>
    </div>
  );
}