import { Bell, Search } from "lucide-react";

import styles from "./styles.module.scss";

export default function Header() {
  return (
    <header className={styles.Header}>
      <div className={styles.Header__Search}>
        <Search size={18} />

        <input
          type="text"
          placeholder="Search..."
        />
      </div>

      <div className={styles.Header__Right}>
        <button className={styles.Header__Notification}>
          <Bell size={19} />
          <span />
        </button>

        <div className={styles.Header__User}>
          <div className={styles.Header__Avatar}>
            A
          </div>

          <div>
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </header>
  );
}