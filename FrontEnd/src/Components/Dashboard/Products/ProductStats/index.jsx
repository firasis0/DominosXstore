import {
  Package,
  CircleCheck,
  Tag,
  AlertTriangle,
} from "lucide-react";
import styles from "./styles.module.scss";

const stats = [
  {
    id: 1,
    label: "Total Products",
    value: "128",
    icon: Package,
  },
  {
    id: 2,
    label: "Active Products",
    value: "116",
    icon: CircleCheck,
  },
  {
    id: 3,
    label: "On Sale",
    value: "24",
    icon: Tag,
  },
  {
    id: 4,
    label: "Low Stock",
    value: "8",
    icon: AlertTriangle,
  },
];

export default function ProductStats({ products }) {
  const values = [products.length, products.filter((product) => product.is_active).length, products.filter((product) => product.is_on_sale).length, products.filter((product) => product.stock <= 5).length];
  return (
    <div className={styles.ProductStats}>
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div className={styles.ProductStats__Card} key={stat.id}>
            <div className={styles.ProductStats__Icon}>
              <Icon size={20} />
            </div>

            <div className={styles.ProductStats__Content}>
              <span>{stat.label}</span>
              <strong>{values[stat.id - 1]}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}