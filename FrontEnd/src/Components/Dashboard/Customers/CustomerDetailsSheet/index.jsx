import {
    CalendarDays,
    ChevronDown,
    ChevronUp,
    MapPin,
    Package,
    Phone,
    Search,
    Truck,
    User,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./styles.module.scss";

const ORDER_STATUSES = [
    {
        value: "",
        label: "All statuses",
    },
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

const DELIVERY_TYPES = [
    {
        value: "",
        label: "All delivery types",
    },
    {
        value: "home",
        label: "Home",
    },
    {
        value: "office",
        label: "Office",
    },
];

const EMPTY_FILTERS = {
    order_search: "",
    order_status: "",
    order_delivery_type: "",
    order_date_from: "",
    order_date_to: "",
};

const formatMoney = (value) => {
    return `${new Intl.NumberFormat("fr-DZ").format(
        Number(value || 0)
    )} DA`;
};

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("fr-DZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

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
    const found = ORDER_STATUSES.find(
        (item) => item.value === status
    );

    return found?.label || status || "Unknown";
};

const getStatusClass = (status) => {
    switch (status) {
        case "confirmed":
            return styles.CustomerDetails__StatusConfirmed;

        case "processing":
            return styles.CustomerDetails__StatusProcessing;

        case "shipped":
            return styles.CustomerDetails__StatusShipped;

        case "delivered":
            return styles.CustomerDetails__StatusDelivered;

        case "cancelled":
            return styles.CustomerDetails__StatusCancelled;

        case "pending":
        default:
            return styles.CustomerDetails__StatusPending;
    }
};

function CustomerDetailsSheet({
    isOpen,
    customerId,
    apiBaseUrl,
    onClose,
}) {
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState(
        EMPTY_FILTERS
    );

    const [expandedOrderId, setExpandedOrderId] =
        useState(null);

    const [expandedOrder, setExpandedOrder] =
        useState(null);

    const [orderLoading, setOrderLoading] =
        useState(false);

    const [orderError, setOrderError] =
        useState("");

    /*
     * Load customer details only when:
     *
     * 1. The sheet is actually open.
     * 2. A valid customer ID exists.
     *
     * This prevents:
     *
     * /dashboard/customers/null
     *
     * from ever being requested.
     */
    useEffect(() => {
        if (!isOpen || !customerId) {
            return undefined;
        }

        const controller =
            new AbortController();

        const loadCustomer = async () => {
            try {
                setLoading(true);
                setError("");

                const params =
                    new URLSearchParams();

                if (
                    filters.order_search.trim()
                ) {
                    params.set(
                        "order_search",
                        filters.order_search.trim()
                    );
                }

                if (filters.order_status) {
                    params.set(
                        "order_status",
                        filters.order_status
                    );
                }

                if (
                    filters.order_delivery_type
                ) {
                    params.set(
                        "order_delivery_type",
                        filters.order_delivery_type
                    );
                }

                if (filters.order_date_from) {
                    params.set(
                        "order_date_from",
                        filters.order_date_from
                    );
                }

                if (filters.order_date_to) {
                    params.set(
                        "order_date_to",
                        filters.order_date_to
                    );
                }

                params.set(
                    "order_page",
                    "1"
                );

                params.set(
                    "order_limit",
                    "100"
                );

                const response =
                    await fetch(
                        `${apiBaseUrl}/dashboard/customers/${customerId}?${params.toString()}`,
                        {
                            signal:
                                controller.signal,
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                            "Failed to load customer details."
                    );
                }

                if (controller.signal.aborted) {
                    return;
                }

                setCustomerData(
                    result?.data || null
                );
            } catch (fetchError) {
                if (
                    fetchError.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Customer details error:",
                    fetchError
                );

                setError(
                    fetchError.message ||
                        "Failed to load customer details."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadCustomer();

        return () => {
            controller.abort();
        };
    }, [
        isOpen,
        customerId,
        apiBaseUrl,
        filters,
    ]);

    /*
     * Reset the internal state when the sheet closes.
     *
     * This does not trigger while opening and does not
     * perform any synchronous setState during render.
     */
    
    const customer =
        customerData?.customer || null;

    const orders =
        Array.isArray(customerData?.orders)
            ? customerData.orders
            : [];

    const customerStats =
        customerData?.stats || {
            order_count: 0,
            total_spent: 0,
            last_order_at: null,
        };

    const handleFilterChange = (
        key,
        value
    ) => {
        setExpandedOrderId(null);
        setExpandedOrder(null);
        setOrderError("");

        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleResetOrderFilters = () => {
        setExpandedOrderId(null);
        setExpandedOrder(null);
        setOrderError("");

        setFilters({
            ...EMPTY_FILTERS,
        });
    };

    const handleOrderClick = async (
        orderId
    ) => {
        if (
            expandedOrderId === orderId
        ) {
            setExpandedOrderId(null);
            setExpandedOrder(null);
            setOrderError("");
            return;
        }

        if (!customerId) {
            return;
        }

        try {
            setExpandedOrderId(orderId);
            setExpandedOrder(null);
            setOrderError("");
            setOrderLoading(true);

            const response =
                await fetch(
                    `${apiBaseUrl}/dashboard/customers/${customerId}/orders/${orderId}`
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                        "Failed to load order details."
                );
            }

            setExpandedOrder(
                result?.data || null
            );
        } catch (fetchError) {
            console.error(
                "Customer order details error:",
                fetchError
            );

            setOrderError(
                fetchError.message ||
                    "Failed to load order details."
            );
        } finally {
            setOrderLoading(false);
        }
    };

    /*
     * IMPORTANT:
     *
     * The component remains mounted by Customers/index.jsx,
     * but the actual sheet must not exist in the DOM when
     * isOpen is false.
     *
     * This fixes the sheet appearing immediately on page load.
     */
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={
                styles.CustomerDetails__Overlay
            }
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <aside
                className={
                    styles.CustomerDetails
                }
                aria-label="Customer details"
            >
                <header
                    className={
                        styles.CustomerDetails__Header
                    }
                >
                    <div>
                        <span
                            className={
                                styles.CustomerDetails__Eyebrow
                            }
                        >
                            Customer details
                        </span>

                        <h2>
                            {customer?.full_name ||
                                "Customer"}
                        </h2>

                        {customer && (
                            <span
                                className={
                                    styles.CustomerDetails__CustomerId
                                }
                            >
                                Customer #{customer.id}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className={
                            styles.CustomerDetails__Close
                        }
                        onClick={onClose}
                        aria-label="Close customer details"
                    >
                        <X
                            size={18}
                            strokeWidth={1.8}
                        />
                    </button>
                </header>

                <div
                    className={
                        styles.CustomerDetails__Content
                    }
                >
                    {loading ? (
                        <div
                            className={
                                styles.CustomerDetails__Loading
                            }
                        >
                            Loading customer...
                        </div>
                    ) : error ? (
                        <div
                            className={
                                styles.CustomerDetails__Error
                            }
                        >
                            {error}
                        </div>
                    ) : !customer ? (
                        <div
                            className={
                                styles.CustomerDetails__Loading
                            }
                        >
                            Loading customer...
                        </div>
                    ) : (
                        <>
                            {/* =========================
                                CUSTOMER
                            ========================= */}

                            <section
                                className={
                                    styles.CustomerDetails__CustomerCard
                                }
                            >
                                <div
                                    className={
                                        styles.CustomerDetails__Profile
                                    }
                                >
                                    <div
                                        className={
                                            styles.CustomerDetails__Avatar
                                        }
                                    >
                                        {customer.full_name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "?"}
                                    </div>

                                    <div>
                                        <h3>
                                            {
                                                customer.full_name
                                            }
                                        </h3>

                                        <span>
                                            Customer #
                                            {
                                                customer.id
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className={
                                        styles.CustomerDetails__CustomerGrid
                                    }
                                >
                                    <div>
                                        <span>
                                            <Phone
                                                size={14}
                                            />
                                            Phone
                                        </span>

                                        <strong>
                                            {
                                                customer.phone_number
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            <MapPin
                                                size={14}
                                            />
                                            Wilaya
                                        </span>

                                        <strong>
                                            {
                                                customer.province
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            <MapPin
                                                size={14}
                                            />
                                            Commune
                                        </span>

                                        <strong>
                                            {
                                                customer.municipality
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            <Package
                                                size={14}
                                            />
                                            Orders
                                        </span>

                                        <strong>
                                            {
                                                customerStats.order_count
                                            }
                                        </strong>
                                    </div>
                                </div>
                            </section>

                            {/* =========================
                                CUSTOMER STATS
                            ========================= */}

                            <section
                                className={
                                    styles.CustomerDetails__Stats
                                }
                            >
                                <div>
                                    <span>
                                        Total Spent
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            customerStats.total_spent
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Orders
                                    </span>

                                    <strong>
                                        {
                                            customerStats.order_count
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Last Order
                                    </span>

                                    <strong>
                                        {formatDate(
                                            customerStats.last_order_at
                                        )}
                                    </strong>
                                </div>
                            </section>

                            {/* =========================
                                ORDER HISTORY
                            ========================= */}

                            <section
                                className={
                                    styles.CustomerDetails__OrdersSection
                                }
                            >
                                <div
                                    className={
                                        styles.CustomerDetails__SectionHeader
                                    }
                                >
                                    <div>
                                        <h3>
                                            Order History
                                        </h3>

                                        <span>
                                            {
                                                orders.length
                                            }{" "}
                                            orders
                                        </span>
                                    </div>
                                </div>

                                {/* FILTERS */}

                                <div
                                    className={
                                        styles.CustomerDetails__Filters
                                    }
                                >
                                    <div
                                        className={
                                            styles.CustomerDetails__Search
                                        }
                                    >
                                        <Search
                                            size={15}
                                            strokeWidth={1.8}
                                        />

                                        <input
                                            type="text"
                                            value={
                                                filters.order_search
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleFilterChange(
                                                    "order_search",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Search order ID or product..."
                                        />
                                    </div>

                                    <select
                                        value={
                                            filters.order_status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFilterChange(
                                                "order_status",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        {ORDER_STATUSES.map(
                                            (
                                                status
                                            ) => (
                                                <option
                                                    key={
                                                        status.value
                                                    }
                                                    value={
                                                        status.value
                                                    }
                                                >
                                                    {
                                                        status.label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <select
                                        value={
                                            filters.order_delivery_type
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFilterChange(
                                                "order_delivery_type",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        {DELIVERY_TYPES.map(
                                            (
                                                type
                                            ) => (
                                                <option
                                                    key={
                                                        type.value
                                                    }
                                                    value={
                                                        type.value
                                                    }
                                                >
                                                    {
                                                        type.label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <input
                                        type="date"
                                        value={
                                            filters.order_date_from
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFilterChange(
                                                "order_date_from",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                    <input
                                        type="date"
                                        value={
                                            filters.order_date_to
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFilterChange(
                                                "order_date_to",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            handleResetOrderFilters
                                        }
                                    >
                                        Reset
                                    </button>
                                </div>

                                {/* ORDERS */}

                                {orders.length ===
                                0 ? (
                                    <div
                                        className={
                                            styles.CustomerDetails__EmptyOrders
                                        }
                                    >
                                        No orders match
                                        the current
                                        filters.
                                    </div>
                                ) : (
                                    <div
                                        className={
                                            styles.CustomerDetails__OrderList
                                        }
                                    >
                                        {orders.map(
                                            (
                                                order
                                            ) => {
                                                const isExpanded =
                                                    expandedOrderId ===
                                                    order.id;

                                                return (
                                                    <div
                                                        key={
                                                            order.id
                                                        }
                                                        className={
                                                            styles.CustomerDetails__OrderItem
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.CustomerDetails__OrderSummary
                                                            }
                                                            onClick={() =>
                                                                handleOrderClick(
                                                                    order.id
                                                                )
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.CustomerDetails__OrderMain
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        styles.CustomerDetails__OrderId
                                                                    }
                                                                >
                                                                    #
                                                                    {
                                                                        order.id
                                                                    }
                                                                </span>

                                                                <span
                                                                    className={
                                                                        styles.CustomerDetails__OrderDate
                                                                    }
                                                                >
                                                                    <CalendarDays
                                                                        size={
                                                                            13
                                                                        }
                                                                    />

                                                                    {formatDate(
                                                                        order.created_at
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div
                                                                className={
                                                                    styles.CustomerDetails__OrderMeta
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        styles.CustomerDetails__OrderItems
                                                                    }
                                                                >
                                                                    {
                                                                        order.item_count
                                                                    }{" "}
                                                                    items
                                                                </span>

                                                                <strong>
                                                                    {formatMoney(
                                                                        order.total
                                                                    )}
                                                                </strong>

                                                                <span
                                                                    className={`${styles.CustomerDetails__Status} ${getStatusClass(
                                                                        order.status
                                                                    )}`}
                                                                >
                                                                    {getStatusLabel(
                                                                        order.status
                                                                    )}
                                                                </span>

                                                                {isExpanded ? (
                                                                    <ChevronUp
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ChevronDown
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div
                                                                className={
                                                                    styles.CustomerDetails__OrderExpanded
                                                                }
                                                            >
                                                                {orderLoading ? (
                                                                    <div
                                                                        className={
                                                                            styles.CustomerDetails__OrderLoading
                                                                        }
                                                                    >
                                                                        Loading
                                                                        order
                                                                        details...
                                                                    </div>
                                                                ) : orderError ? (
                                                                    <div
                                                                        className={
                                                                            styles.CustomerDetails__Error
                                                                        }
                                                                    >
                                                                        {
                                                                            orderError
                                                                        }
                                                                    </div>
                                                                ) : expandedOrder ? (
                                                                    <>
                                                                        {/* ORDER INFO */}

                                                                        <div
                                                                            className={
                                                                                styles.CustomerDetails__OrderInfo
                                                                            }
                                                                        >
                                                                            <div>
                                                                                <span>
                                                                                    Order
                                                                                    ID
                                                                                </span>

                                                                                <strong>
                                                                                    #
                                                                                    {
                                                                                        expandedOrder.id
                                                                                    }
                                                                                </strong>
                                                                            </div>

                                                                            <div>
                                                                                <span>
                                                                                    Status
                                                                                </span>

                                                                                <strong
                                                                                    className={`${styles.CustomerDetails__Status} ${getStatusClass(
                                                                                        expandedOrder.status
                                                                                    )}`}
                                                                                >
                                                                                    {getStatusLabel(
                                                                                        expandedOrder.status
                                                                                    )}
                                                                                </strong>
                                                                            </div>

                                                                            <div>
                                                                                <span>
                                                                                    Created
                                                                                </span>

                                                                                <strong>
                                                                                    {formatDateTime(
                                                                                        expandedOrder.created_at
                                                                                    )}
                                                                                </strong>
                                                                            </div>
                                                                        </div>

                                                                        {/* CUSTOMER + DELIVERY */}

                                                                        <div
                                                                            className={
                                                                                styles.CustomerDetails__ExpandedGrid
                                                                            }
                                                                        >
                                                                            <section
                                                                                className={
                                                                                    styles.CustomerDetails__ExpandedCard
                                                                                }
                                                                            >
                                                                                <div
                                                                                    className={
                                                                                        styles.CustomerDetails__ExpandedCardTitle
                                                                                    }
                                                                                >
                                                                                    <User
                                                                                        size={
                                                                                            15
                                                                                        }
                                                                                    />
                                                                                    Customer
                                                                                </div>

                                                                                <p>
                                                                                    {
                                                                                        expandedOrder
                                                                                            .customer
                                                                                            ?.full_name
                                                                                    }
                                                                                </p>

                                                                                <span>
                                                                                    {
                                                                                        expandedOrder
                                                                                            .customer
                                                                                            ?.phone_number
                                                                                    }
                                                                                </span>

                                                                                <span>
                                                                                    {
                                                                                        expandedOrder
                                                                                            .customer
                                                                                            ?.province
                                                                                    }
                                                                                    ,{" "}
                                                                                    {
                                                                                        expandedOrder
                                                                                            .customer
                                                                                            ?.municipality
                                                                                    }
                                                                                </span>
                                                                            </section>

                                                                            <section
                                                                                className={
                                                                                    styles.CustomerDetails__ExpandedCard
                                                                                }
                                                                            >
                                                                                <div
                                                                                    className={
                                                                                        styles.CustomerDetails__ExpandedCardTitle
                                                                                    }
                                                                                >
                                                                                    <Truck
                                                                                        size={
                                                                                            15
                                                                                        }
                                                                                    />
                                                                                    Delivery
                                                                                </div>

                                                                                <p>
                                                                                    {expandedOrder.delivery?.type ===
                                                                                    "office"
                                                                                        ? "Office delivery"
                                                                                        : "Home delivery"}
                                                                                </p>

                                                                                <span>
                                                                                    Provider:{" "}
                                                                                    {expandedOrder.delivery?.provider?.name ||
                                                                                        "—"}
                                                                                </span>

                                                                                {expandedOrder.delivery?.office && (
                                                                                    <span>
                                                                                        {
                                                                                            expandedOrder
                                                                                                .delivery
                                                                                                .office
                                                                                                .name
                                                                                        }
                                                                                    </span>
                                                                                )}
                                                                            </section>
                                                                        </div>

                                                                        {/* PRODUCTS */}

                                                                        <div
                                                                            className={
                                                                                styles.CustomerDetails__Products
                                                                            }
                                                                        >
                                                                            <h4>
                                                                                Products
                                                                            </h4>

                                                                            {Array.isArray(
                                                                                expandedOrder.items
                                                                            ) &&
                                                                            expandedOrder.items.length >
                                                                                0 ? (
                                                                                expandedOrder.items.map(
                                                                                    (
                                                                                        item
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                item.id
                                                                                            }
                                                                                            className={
                                                                                                styles.CustomerDetails__Product
                                                                                            }
                                                                                        >
                                                                                            <div
                                                                                                className={
                                                                                                    styles.CustomerDetails__ProductImage
                                                                                                }
                                                                                            >
                                                                                                {item.image_url ? (
                                                                                                    <img
                                                                                                        src={
                                                                                                            item.image_url
                                                                                                        }
                                                                                                        alt={
                                                                                                            item.product_name ||
                                                                                                            "Product"
                                                                                                        }
                                                                                                    />
                                                                                                ) : (
                                                                                                    <Package
                                                                                                        size={
                                                                                                            18
                                                                                                        }
                                                                                                    />
                                                                                                )}
                                                                                            </div>

                                                                                            <div
                                                                                                className={
                                                                                                    styles.CustomerDetails__ProductInfo
                                                                                                }
                                                                                            >
                                                                                                <strong>
                                                                                                    {
                                                                                                        item.product_name
                                                                                                    }
                                                                                                </strong>

                                                                                                <span>
                                                                                                    Qty:{" "}
                                                                                                    {
                                                                                                        item.quantity
                                                                                                    }
                                                                                                </span>

                                                                                                {Object.keys(
                                                                                                    item.selected_variants ||
                                                                                                        {}
                                                                                                ).length >
                                                                                                    0 && (
                                                                                                    <div
                                                                                                        className={
                                                                                                            styles.CustomerDetails__Variants
                                                                                                        }
                                                                                                    >
                                                                                                        {Object.entries(
                                                                                                            item.selected_variants ||
                                                                                                                {}
                                                                                                        ).map(
                                                                                                            ([
                                                                                                                type,
                                                                                                                variant,
                                                                                                            ]) => (
                                                                                                                <span
                                                                                                                    key={`${item.id}-${type}`}
                                                                                                                >
                                                                                                                    {type}:{" "}
                                                                                                                    {variant?.value ||
                                                                                                                        "—"}
                                                                                                                </span>
                                                                                                            )
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>

                                                                                            <div
                                                                                                className={
                                                                                                    styles.CustomerDetails__ProductPricing
                                                                                                }
                                                                                            >
                                                                                                <span>
                                                                                                    {formatMoney(
                                                                                                        item.unit_price
                                                                                                    )}{" "}
                                                                                                    ×{" "}
                                                                                                    {
                                                                                                        item.quantity
                                                                                                    }
                                                                                                </span>

                                                                                                <strong>
                                                                                                    {formatMoney(
                                                                                                        item.line_total
                                                                                                    )}
                                                                                                </strong>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                )
                                                                            ) : (
                                                                                <div
                                                                                    className={
                                                                                        styles.CustomerDetails__NoItems
                                                                                    }
                                                                                >
                                                                                    No
                                                                                    items
                                                                                    found.
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* PRICING */}

                                                                        <div
                                                                            className={
                                                                                styles.CustomerDetails__Pricing
                                                                            }
                                                                        >
                                                                            <div>
                                                                                <span>
                                                                                    Subtotal
                                                                                </span>

                                                                                <strong>
                                                                                    {formatMoney(
                                                                                        expandedOrder
                                                                                            .pricing
                                                                                            ?.subtotal
                                                                                    )}
                                                                                </strong>
                                                                            </div>

                                                                            <div>
                                                                                <span>
                                                                                    Delivery
                                                                                </span>

                                                                                <strong>
                                                                                    {formatMoney(
                                                                                        expandedOrder
                                                                                            .pricing
                                                                                            ?.delivery
                                                                                    )}
                                                                                </strong>
                                                                            </div>

                                                                            <div
                                                                                className={
                                                                                    styles.CustomerDetails__PricingTotal
                                                                                }
                                                                            >
                                                                                <span>
                                                                                    Total
                                                                                </span>

                                                                                <strong>
                                                                                    {formatMoney(
                                                                                        expandedOrder
                                                                                            .pricing
                                                                                            ?.total
                                                                                    )}
                                                                                </strong>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default CustomerDetailsSheet;