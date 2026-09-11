import { ArrowUpRight } from "lucide-react";

import styles from "./styles.module.scss";

const orders = [
  {
    id: "#1024",
    customer: "Ahmed Benali",
    product: "GameSir G7 SE",
    total: "13,998 DA",
    status: "Pending",
  },
  {
    id: "#1023",
    customer: "Mohamed Salah",
    product: "Razer DeathAdder V3",
    total: "12,999 DA",
    status: "Shipped",
  },
  {
    id: "#1022",
    customer: "Yacine Karim",
    product: "HyperX Cloud III",
    total: "16,999 DA",
    status: "Delivered",
  },
  {
    id: "#1021",
    customer: "Amine Touil",
    product: "Logitech G502 X",
    total: "17,999 DA",
    status: "Confirmed",
  },
];

export default function RecentOrders() {
  return (
    <section className={styles.RecentOrders}>
      <div className={styles.RecentOrders__Header}>
        <div>
          <h2>Recent Orders</h2>
          <p>Latest orders placed in your store.</p>
        </div>

        <button>
          View all
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className={styles.RecentOrders__TableWrapper}>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.product}</td>
                <td>{order.total}</td>
                <td>
                  <span
                    className={`${styles.Status} ${
                      styles[`Status--${order.status.toLowerCase()}`]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}