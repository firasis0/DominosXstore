import { ShoppingBag, Clock, Truck, Banknote } from "lucide-react";

import styles from "./styles.module.scss";

const formatPrice = (price) => `${Number(price || 0).toLocaleString("fr-DZ")} DA`;

export default function OrderStats({ stats }) {
  const cards = [
    { id: "total_orders", label: "Total Orders", value: stats.total_orders ?? 0, icon: ShoppingBag },
    { id: "pending", label: "Pending", value: stats.pending ?? 0, icon: Clock },
    { id: "to_ship", label: "To Ship", value: stats.to_ship ?? 0, icon: Truck },
    { id: "revenue", label: "Revenue", value: formatPrice(stats.revenue), icon: Banknote },
  ];

  return (
    <div className={styles.OrderStats}>
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div className={styles.OrderStats__Card} key={card.id}>
            <div className={styles.OrderStats__Icon}>
              <Icon size={20} />
            </div>

            <div className={styles.OrderStats__Content}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}
