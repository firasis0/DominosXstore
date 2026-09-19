import {
  ShoppingBag,
  Clock,
  Truck,
  Banknote,
} from "lucide-react";

import styles from "./styles.module.scss";

const formatPrice = (
  price
) =>
  `${Number(
    price || 0
  ).toLocaleString(
    "fr-DZ"
  )} DA`;

export default function OrderStats({
  stats,
}) {
  const cards = [
    {
      id: "total_orders",
      label: "Total Orders",
      value:
        Number(
          stats?.total_orders
        ) || 0,
      icon: ShoppingBag,
    },

    {
      id: "pending_orders",
      label: "Pending",
      value:
        Number(
          stats?.pending_orders
        ) || 0,
      icon: Clock,
    },

    {
      id: "shipped_orders",
      label: "Shipped",
      value:
        Number(
          stats?.shipped_orders
        ) || 0,
      icon: Truck,
    },

    {
      id: "total_revenue",
      label: "Revenue",
      value: formatPrice(
        stats?.total_revenue
      ),
      icon: Banknote,
    },
  ];

  return (
    <div
      className={
        styles.OrderStats
      }
    >
      {cards.map(
        (card) => {
          const Icon =
            card.icon;

          return (
            <div
              className={
                styles.OrderStats__Card
              }
              key={
                card.id
              }
            >
              <div
                className={
                  styles.OrderStats__Icon
                }
              >
                <Icon
                  size={20}
                />
              </div>

              <div
                className={
                  styles.OrderStats__Content
                }
              >
                <span>
                  {
                    card.label
                  }
                </span>

                <strong>
                  {
                    card.value
                  }
                </strong>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}