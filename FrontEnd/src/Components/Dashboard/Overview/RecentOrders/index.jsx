import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";
import { authFetch } from "../../../../lib/authFetch.js";

const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString("fr-DZ")} DA`;
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("fr-DZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const getStatusLabel = (status) => {
    switch (status) {
        case "pending":
            return "Pending";

        case "confirmed":
            return "Confirmed";

        case "processing":
            return "Processing";

        case "shipped":
            return "Shipped";

        case "delivered":
            return "Delivered";

        case "cancelled":
            return "Cancelled";

        default:
            return status || "Unknown";
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case "confirmed":
            return styles["Status--confirmed"];

        case "processing":
            return styles["Status--processing"];

        case "shipped":
            return styles["Status--shipped"];

        case "delivered":
            return styles["Status--delivered"];

        case "cancelled":
            return styles["Status--cancelled"];

        case "pending":
        default:
            return styles["Status--pending"];
    }
};

export default function RecentOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const loadRecentOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await authFetch(
                    "/dashboard/orders",
                    {
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                            "Failed to load recent orders."
                    );
                }

                const orderData = Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];

                setOrders(orderData.slice(0, 5));
            } catch (fetchError) {
                if (fetchError.name === "AbortError") {
                    return;
                }

                console.error(
                    "Recent orders error:",
                    fetchError
                );

                setError(
                    fetchError.message ||
                        "Unable to load recent orders."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadRecentOrders();

        return () => controller.abort();
    }, []);

    return (
        <section className={styles.RecentOrders}>
            <div className={styles.RecentOrders__Header}>
                <div>
                    <h2>Recent Orders</h2>
                    <p>Latest orders from your store</p>
                </div>

                <Link to="/dashboard/orders">
                    View all
                </Link>
            </div>

            <div
                className={
                    styles.RecentOrders__TableWrapper
                }
            >
                <table>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="6">
                                    Loading recent orders...
                                </td>
                            </tr>
                        )}

                        {!loading && error && (
                            <tr>
                                <td colSpan="6">
                                    {error}
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            !error &&
                            orders.length === 0 && (
                                <tr>
                                    <td colSpan="6">
                                        No orders yet.
                                    </td>
                                </tr>
                            )}

                        {!loading &&
                            !error &&
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        #
                                        {String(order.id).padStart(
                                            4,
                                            "0"
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            {order.customer_name ||
                                                "Unknown customer"}
                                        </strong>

                                        <br />

                                        <span>
                                            {order.customer_phone ||
                                                "—"}
                                        </span>
                                    </td>

                                    <td>
                                        {Number(
                                            order.item_count || 0
                                        )}
                                    </td>

                                    <td>
                                        {formatMoney(
                                            order.total
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={`${styles.Status} ${getStatusClass(
                                                order.status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                order.status
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        {formatDate(
                                            order.created_at
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}