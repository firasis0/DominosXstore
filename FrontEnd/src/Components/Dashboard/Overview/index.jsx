import styles from "./styles.module.scss";

import Stats from "./Stats";
import RecentOrders from "./RecentOrders";

export default function Overview() {
  return (
    <section className={styles.Overview}>
      <div className={styles.Overview__Heading}>
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your store performance.</p>
        </div>
      </div>

      <Stats />

      <RecentOrders />
    </section>
  );
}