import {
    Eye,
    Printer,
    RefreshCw,
} from "lucide-react";

import styles from "./styles.module.scss";

const STATUS_OPTIONS = [
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "confirmed",
        label: "Confirmed",
    },
    {
        value: "processing",
        label: "Processing",
    },
    {
        value: "shipped",
        label: "Shipped",
    },
    {
        value: "delivered",
        label: "Delivered",
    },
    {
        value: "cancelled",
        label: "Cancelled",
    },
];

const STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const DELIVERY_LABELS = {
    home: "Home",
    office: "Office",
};

const normalizeStatus = (status) =>
    String(status || "")
        .trim()
        .toLowerCase();

const normalizeDeliveryType = (
    type
) => {
    const normalized = String(
        type || ""
    )
        .trim()
        .toLowerCase();

    if (
        normalized === "office" ||
        normalized === "المكتب"
    ) {
        return "office";
    }

    return "home";
};

const formatPrice = (value) => {
    const number = Number(value || 0);

    return `${number.toLocaleString(
        "fr-DZ"
    )} DA`;
};

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
    );
};

const getOrderId = (order) =>
    order?.id ??
    order?.order_id;

const getItemCount = (order) =>
    order?.item_count ??
    order?.items_count ??
    order?.total_items ??
    0;

const OrderRow = ({
    order,
    onOpen,
    onStatusChange,
    onPrint,
}) => {
    const orderId =
        getOrderId(order);

    const status =
        normalizeStatus(
            order?.status
        );

    const deliveryType =
        normalizeDeliveryType(
            order?.delivery_type
        );

    const isFinal =
        status === "delivered" ||
        status === "cancelled";

    const handleStatusChange = (
        event
    ) => {
        event.stopPropagation();

        const nextStatus =
            event.target.value;

        if (
            !nextStatus ||
            isFinal
        ) {
            return;
        }

        onStatusChange?.(
            order,
            nextStatus
        );

        event.target.value = "";
    };

    const handleOpen = (event) => {
        event.stopPropagation();

        onOpen?.();
    };

    const handlePrint = (event) => {
        event.stopPropagation();

        onPrint?.(order);
    };

    return (
        <tr
            className={
                styles.OrderRow
            }
            onClick={onOpen}
        >
            {/* ORDER */}
            <td>
                <div
                    className={
                        styles.OrderRow__Order
                    }
                >
                    <strong
                        className={
                            styles.OrderRow__OrderId
                        }
                    >
                        #{orderId}
                    </strong>

                    
                </div>
            </td>

            {/* CUSTOMER */}
            <td>
                <div
                    className={
                        styles.OrderRow__Customer
                    }
                >
                    <strong>
                        {order?.customer_name ||
                            "Unknown customer"}
                    </strong>

                    <span>
                        {order?.customer_phone ||
                            "—"}
                    </span>
                </div>
            </td>

            {/* ITEMS */}
            <td>
                <span
                    className={
                        styles.OrderRow__Items
                    }
                >
                    {getItemCount(
                        order
                    )}{" "}
                    {getItemCount(
                        order
                    ) === 1
                        ? "item"
                        : "items"}
                </span>
            </td>

            {/* TOTAL */}
            <td>
                <strong
                    className={
                        styles.OrderRow__Total
                    }
                >
                    {formatPrice(
                        order?.total
                    )}
                </strong>
            </td>

            {/* DELIVERY */}
            <td>
                <span
                    className={`${styles.OrderRow__Delivery} ${
                        styles[
                            `OrderRow__Delivery--${deliveryType}`
                        ]
                    }`}
                >
                    {
                        DELIVERY_LABELS[
                            deliveryType
                        ]
                    }
                </span>
            </td>

            {/* STATUS */}
            <td>
                <span
                    className={`${styles.OrderRow__Status} ${
                        styles[
                            `OrderRow__Status--${status}`
                        ] || ""
                    }`}
                >
                    {STATUS_LABELS[
                        status
                    ] || "Unknown"}
                </span>
            </td>

            {/* CREATED */}
            <td>
                <span
                    className={
                        styles.OrderRow__Created
                    }
                >
                    {formatDate(
                        order?.created_at
                    )}
                </span>
            </td>

            {/* ACTIONS */}
            <td
                className={
                    styles.OrderRow__ActionsCell
                }
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div
                    className={
                        styles.OrderRow__Actions
                    }
                >
                    {/* VIEW */}
                    <button
                        type="button"
                        className={
                            styles.OrderRow__Action
                        }
                        title="View order"
                        aria-label="View order"
                        onClick={
                            handleOpen
                        }
                    >
                        <Eye
                            size={15}
                            strokeWidth={
                                1.8
                            }
                        />
                    </button>

                    {/* PRINT */}
                    <button
                        type="button"
                        className={
                            styles.OrderRow__Action
                        }
                        title="Print order"
                        aria-label="Print order"
                        onClick={
                            handlePrint
                        }
                    >
                        <Printer
                            size={15}
                            strokeWidth={
                                1.8
                            }
                        />
                    </button>

                    {/* CHANGE STATUS */}
                    <div
                        className={`${styles.OrderRow__StatusChanger} ${
                            isFinal
                                ? styles.OrderRow__StatusChangerDisabled
                                : ""
                        }`}
                        title={
                            isFinal
                                ? `Order is ${STATUS_LABELS[
                                      status
                                  ].toLowerCase()}`
                                : "Change order status"
                        }
                    >
                        <RefreshCw
                            size={15}
                            strokeWidth={
                                1.8
                            }
                        />

                        {!isFinal && (
                            <select
                                defaultValue=""
                                aria-label="Change order status"
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                                onChange={
                                    handleStatusChange
                                }
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Change
                                    status
                                </option>

                                {STATUS_OPTIONS.map(
                                    (
                                        option
                                    ) => (
                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
};

export default OrderRow;