import {
  ShoppingBag,
  Package,
  Users,
  Banknote,
} from "lucide-react";

import styles from "./styles.module.scss";

const stats = [
  {
    title: "Total Orders",
    value: "124",
    icon: ShoppingBag,
  },
  {
    title: "Products",
    value: "86",
    icon: Package,
  },
  {
    title: "Customers",
    value: "342",
    icon: Users,
  },
  {
    title: "Revenue",
    value: "684,500 DA",
    icon: Banknote,
  },
];

export default function Stats() {
  return (
    <div className={styles.Stats}>
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            className={styles.Stats__Card}
            key={stat.title}
          >
            <div className={styles.Stats__Top}>
              <span>{stat.title}</span>

              <div className={styles.Stats__Icon}>
                <Icon size={18} />
              </div>
            </div>

            <strong>{stat.value}</strong>
          </div>
        );
      })}
    </div>
  );
}