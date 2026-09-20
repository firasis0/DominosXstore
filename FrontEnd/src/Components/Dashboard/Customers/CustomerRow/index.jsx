import { Eye } from "lucide-react";

import styles from "./styles.module.scss";

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("fr-DZ")} DA`;
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("fr-DZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getOrdersCount(customer) {
    return (
        customer?.orders_count ??
        customer?.order_count ??
        customer?.total_orders ??
        0
    );
}

function getTotalSpent(customer) {
    return (
        customer?.total_spent ??
        customer?.total_revenue ??
        customer?.spent ??
        0
    );
}

function getLastOrder(customer) {
    return (
        customer?.last_order_at ??
        customer?.last_order_date ??
        customer?.latest_order_date ??
        null
    );
}

export default function CustomerRow({
    customer,
    onClick,
}) {
    const ordersCount = Number(getOrdersCount(customer));
    const totalSpent = Number(getTotalSpent(customer));

    return (
        <tr
            className={styles.CustomerRow}
            onClick={() => onClick(customer)}
        >
            <td>
                <div className={styles.CustomerRow__Customer}>
                    <div className={styles.CustomerRow__Avatar}>
                        {(customer?.full_name || "C")
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className={styles.CustomerRow__CustomerInfo}>
                        <strong>
                            {customer?.full_name || "Unknown customer"}
                        </strong>

                        <span>
                            ID #{customer?.id ?? "—"}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                <span className={styles.CustomerRow__Phone}>
                    {customer?.phone_number || "—"}
                </span>
            </td>

            <td>
                <div className={styles.CustomerRow__Location}>
                    <span>
                        {customer?.province || "—"}
                    </span>

                    <small>
                        {customer?.municipality || "—"}
                    </small>
                </div>
            </td>

            <td>
                <span className={styles.CustomerRow__Orders}>
                    {ordersCount}
                </span>
            </td>

            <td>
                <span className={styles.CustomerRow__Spent}>
                    {formatMoney(totalSpent)}
                </span>
            </td>

            <td>
                <span className={styles.CustomerRow__Date}>
                    {formatDate(getLastOrder(customer))}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    className={styles.CustomerRow__View}
                    onClick={(event) => {
                        event.stopPropagation();
                        onClick(customer);
                    }}
                    aria-label={`View ${
                        customer?.full_name || "customer"
                    }`}
                >
                    <Eye size={16} />
                </button>
            </td>
        </tr>
    );
}