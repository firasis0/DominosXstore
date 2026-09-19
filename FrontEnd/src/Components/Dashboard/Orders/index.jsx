import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";

import {
    PackageCheck,
    Clock3,
    Truck,
    Banknote,
    RefreshCw,
} from "lucide-react";

import OrderToolbar from "./OrderToolbar";
import OrderRow from "./OrderRow";
import OrderDetailsSheet from "./OrderDetailsSheet";

import styles from "./styles.module.scss";

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api"
).replace(/\/$/, "");

/*
|--------------------------------------------------------------------------
| Dashboard store
|--------------------------------------------------------------------------
|
| Using useSyncExternalStore keeps the Orders page compatible with
| strict React lint rules and avoids unnecessary setState-in-effect
| warnings.
|
*/

const dashboardStore = {
    state: {
        orders: [],
        stats: {
            total_orders: 0,
            pending_orders: 0,
            confirmed_orders: 0,
            processing_orders: 0,
            shipped_orders: 0,
            delivered_orders: 0,
            cancelled_orders: 0,
            total_revenue: 0,
        },
        loading: true,
        error: "",
    },

    listeners: new Set(),

    getSnapshot: () => {
        return dashboardStore.state;
    },

    subscribe: (listener) => {
        dashboardStore.listeners.add(
            listener
        );

        return () => {
            dashboardStore.listeners.delete(
                listener
            );
        };
    },

    setState: (partial) => {
        dashboardStore.state = {
            ...dashboardStore.state,
            ...partial,
        };

        dashboardStore.listeners.forEach(
            (listener) => listener()
        );
    },
};

let dashboardRequest = null;

const loadDashboard = async () => {
    if (dashboardRequest) {
        return dashboardRequest;
    }

    dashboardRequest =
        (async () => {
            dashboardStore.setState({
                loading: true,
                error: "",
            });

            try {
                const [
                    ordersResponse,
                    statsResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/dashboard/orders`
                    ),
                    fetch(
                        `${API_BASE_URL}/dashboard/orders/stats`
                    ),
                ]);

                const ordersResult =
                    await ordersResponse.json();

                const statsResult =
                    await statsResponse.json();

                if (
                    !ordersResponse.ok
                ) {
                    throw new Error(
                        ordersResult?.message ||
                            "Failed to load orders."
                    );
                }

                if (
                    !statsResponse.ok
                ) {
                    throw new Error(
                        statsResult?.message ||
                            "Failed to load order statistics."
                    );
                }

                dashboardStore.setState(
                    {
                        orders:
                            Array.isArray(
                                ordersResult?.data
                            )
                                ? ordersResult.data
                                : [],

                        stats:
                            statsResult?.data ||
                            dashboardStore.state
                                .stats,

                        loading: false,
                        error: "",
                    }
                );
            } catch (error) {
                console.error(
                    "Orders dashboard error:",
                    error
                );

                dashboardStore.setState({
                    loading: false,
                    error:
                        error.message ||
                        "Failed to load orders.",
                });
            } finally {
                dashboardRequest =
                    null;
            }
        })();

    return dashboardRequest;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getOrderId = (order) =>
    order?.id ??
    order?.order_id;

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

const calculateStats = (orders) => {
    const stats = {
        total_orders: orders.length,
        pending_orders: 0,
        confirmed_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        total_revenue: 0,
    };

    orders.forEach((order) => {
        const status =
            normalizeStatus(
                order?.status
            );

        if (
            status === "pending"
        ) {
            stats.pending_orders += 1;
        }

        if (
            status === "confirmed"
        ) {
            stats.confirmed_orders += 1;
        }

        if (
            status === "processing"
        ) {
            stats.processing_orders += 1;
        }

        if (
            status === "shipped"
        ) {
            stats.shipped_orders += 1;
        }

        if (
            status === "delivered"
        ) {
            stats.delivered_orders += 1;
        }

        if (
            status === "cancelled"
        ) {
            stats.cancelled_orders += 1;
        }

        if (
            status !== "cancelled"
        ) {
            stats.total_revenue +=
                Number(
                    order?.total || 0
                );
        }
    });

    return stats;
};

const formatPrice = (value) => {
    const number = Number(value || 0);

    return `${number.toLocaleString(
        "fr-DZ"
    )} DA`;
};

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date
        .toISOString()
        .slice(0, 10);
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

const Orders = () => {
    const dashboard =
        useSyncExternalStore(
            dashboardStore.subscribe,
            dashboardStore.getSnapshot,
            dashboardStore.getSnapshot
        );

    const {
        orders,
        stats,
        loading,
        error,
    } = dashboard;

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [filters, setFilters] =
        useState({
            search: "",
            status: "",
            deliveryType: "",
            dateFrom: "",
            dateTo: "",
        });

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const [currentPage, setCurrentPage] =
        useState(1);

    const ITEMS_PER_PAGE = 20;

    /*
    |--------------------------------------------------------------------------
    | Details
    |--------------------------------------------------------------------------
    */

    const [
        selectedOrderId,
        setSelectedOrderId,
    ] = useState(null);

    const [
        detailsReloadKey,
        setDetailsReloadKey,
    ] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | Initial load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadDashboard();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Filter change
    |--------------------------------------------------------------------------
    */

    const handleFiltersChange =
        useCallback(
            (nextFilters) => {
                setFilters(
                    (previous) => ({
                        ...previous,
                        ...nextFilters,
                    })
                );

                setCurrentPage(1);
            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | Filtered orders
    |--------------------------------------------------------------------------
    */

    const filteredOrders =
        useMemo(() => {
            const search =
                filters.search
                    .trim()
                    .toLowerCase();

            const dateFrom =
                filters.dateFrom;

            const dateTo =
                filters.dateTo;

            return orders.filter(
                (order) => {
                    const status =
                        normalizeStatus(
                            order?.status
                        );

                    const deliveryType =
                        normalizeDeliveryType(
                            order?.delivery_type
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Search
                    |--------------------------------------------------------------------------
                    */

                    if (search) {
                        const searchable =
                            [
                                order?.id,
                                order?.order_id,
                                order?.customer_name,
                                order?.customer_phone,
                                order?.province,
                                order?.municipality,
                                order?.shipping_provider_name,
                            ]
                                .filter(
                                    (
                                        value
                                    ) =>
                                        value !==
                                            null &&
                                        value !==
                                            undefined
                                )
                                .join(" ")
                                .toLowerCase();

                        if (
                            !searchable.includes(
                                search
                            )
                        ) {
                            return false;
                        }
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Status
                    |--------------------------------------------------------------------------
                    */

                    if (
                        filters.status &&
                        status !==
                            filters.status
                    ) {
                        return false;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Delivery
                    |--------------------------------------------------------------------------
                    */

                    if (
                        filters.deliveryType &&
                        deliveryType !==
                            filters.deliveryType
                    ) {
                        return false;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Date
                    |--------------------------------------------------------------------------
                    */

                    const orderDate =
                        formatDate(
                            order?.created_at
                        );

                    if (
                        dateFrom &&
                        orderDate &&
                        orderDate <
                            dateFrom
                    ) {
                        return false;
                    }

                    if (
                        dateTo &&
                        orderDate &&
                        orderDate >
                            dateTo
                    ) {
                        return false;
                    }

                    return true;
                }
            );
        }, [
            orders,
            filters,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Pagination calculations
    |--------------------------------------------------------------------------
    */

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredOrders.length /
                ITEMS_PER_PAGE
        )
    );

    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );

    const paginatedOrders =
        useMemo(() => {
            const start =
                (safeCurrentPage - 1) *
                ITEMS_PER_PAGE;

            return filteredOrders.slice(
                start,
                start +
                    ITEMS_PER_PAGE
            );
        }, [
            filteredOrders,
            safeCurrentPage,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Open order details
    |--------------------------------------------------------------------------
    */

    const handleViewOrder =
        useCallback(
            (orderId) => {
                if (!orderId) {
                    return;
                }

                setSelectedOrderId(
                    orderId
                );
            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | Close details
    |--------------------------------------------------------------------------
    */

    const handleCloseDetails =
        useCallback(() => {
            setSelectedOrderId(null);
        }, []);

    /*
    |--------------------------------------------------------------------------
    | Update status
    |--------------------------------------------------------------------------
    */

    const handleStatusChange =
        useCallback(
            async (
                orderId,
                status
            ) => {
                if (!orderId) {
                    return;
                }

                const normalizedStatus =
                    normalizeStatus(
                        status
                    );

                if (
                    ![
                        "pending",
                        "confirmed",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                    ].includes(
                        normalizedStatus
                    )
                ) {
                    return;
                }

                const currentOrder =
                    dashboardStore.state.orders.find(
                        (order) =>
                            Number(
                                getOrderId(
                                    order
                                )
                            ) ===
                            Number(
                                orderId
                            )
                    );

                if (!currentOrder) {
                    return;
                }

                const currentStatus =
                    normalizeStatus(
                        currentOrder.status
                    );

                /*
                |--------------------------------------------------------------------------
                | Final statuses cannot be changed
                |--------------------------------------------------------------------------
                */

                if (
                    currentStatus ===
                        "delivered" ||
                    currentStatus ===
                        "cancelled"
                ) {
                    return;
                }

                if (
                    currentStatus ===
                    normalizedStatus
                ) {
                    return;
                }

                try {
                    const response =
                        await fetch(
                            `${API_BASE_URL}/dashboard/orders/${orderId}/status`,
                            {
                                method: "PATCH",
                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },
                                body: JSON.stringify(
                                    {
                                        status: normalizedStatus,
                                    }
                                ),
                            }
                        );

                    const result =
                        await response.json();

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            result?.message ||
                                "Failed to update order status."
                        );
                    }

                    const updatedOrders =
                        dashboardStore.state.orders.map(
                            (order) => {
                                if (
                                    Number(
                                        getOrderId(
                                            order
                                        )
                                    ) !==
                                    Number(
                                        orderId
                                    )
                                ) {
                                    return order;
                                }

                                return {
                                    ...order,
                                    status: normalizedStatus,
                                };
                            }
                        );

                    dashboardStore.setState(
                        {
                            orders:
                                updatedOrders,

                            stats:
                                calculateStats(
                                    updatedOrders
                                ),
                        }
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Refresh details sheet if it is open
                    |--------------------------------------------------------------------------
                    */

                    setDetailsReloadKey(
                        (value) =>
                            value + 1
                    );
                } catch (updateError) {
                    console.error(
                        "Status update error:",
                        updateError
                    );

                    window.alert(
                        updateError.message ||
                            "Failed to update order status."
                    );
                }
            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | Cancel order
    |--------------------------------------------------------------------------
    */

    const handleCancelOrder =
        useCallback(
            async (order) => {
                const orderId =
                    getOrderId(order);

                if (!orderId) {
                    return;
                }

                const currentStatus =
                    normalizeStatus(
                        order?.status
                    );

                if (
                    currentStatus ===
                        "delivered" ||
                    currentStatus ===
                        "cancelled"
                ) {
                    return;
                }

                const confirmed =
                    window.confirm(
                        `Cancel order #${orderId}?`
                    );

                if (!confirmed) {
                    return;
                }

                try {
                    const response =
                        await fetch(
                            `${API_BASE_URL}/dashboard/orders/${orderId}/cancel`,
                            {
                                method: "PATCH",
                            }
                        );

                    const result =
                        await response.json();

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            result?.message ||
                                "Failed to cancel order."
                        );
                    }

                    const updatedOrders =
                        dashboardStore.state.orders.map(
                            (currentOrder) => {
                                if (
                                    Number(
                                        getOrderId(
                                            currentOrder
                                        )
                                    ) !==
                                    Number(
                                        orderId
                                    )
                                ) {
                                    return currentOrder;
                                }

                                return {
                                    ...currentOrder,
                                    status: "cancelled",
                                };
                            }
                        );

                    dashboardStore.setState(
                        {
                            orders:
                                updatedOrders,

                            stats:
                                calculateStats(
                                    updatedOrders
                                ),
                        }
                    );

                    setDetailsReloadKey(
                        (value) =>
                            value + 1
                    );
                } catch (cancelError) {
                    console.error(
                        "Cancel order error:",
                        cancelError
                    );

                    window.alert(
                        cancelError.message ||
                            "Failed to cancel order."
                    );
                }
            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | Print order
    |--------------------------------------------------------------------------
    */

    const handlePrintOrder =
        useCallback(
            async (order) => {
                const orderId =
                    getOrderId(order);

                if (!orderId) {
                    return;
                }

                try {
                    /*
                    |--------------------------------------------------------------------------
                    | Dynamic import prevents the utility from
                    | being loaded if it is not needed.
                    |--------------------------------------------------------------------------
                    */

                    const module =
                        await import(
                            "./utils/printOrder"
                        );

                    if (
                        typeof module.printOrder !==
                        "function"
                    ) {
                        throw new Error(
                            "Print utility is unavailable."
                        );
                    }

                    await module.printOrder(
                        order,
                        API_BASE_URL
                    );
                } catch (printError) {
                    console.error(
                        "Print order error:",
                        printError
                    );

                    window.alert(
                        printError.message ||
                            "Failed to print order."
                    );
                }
            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | Refresh
    |--------------------------------------------------------------------------
    */

    const handleRefresh =
        useCallback(() => {
            dashboardRequest =
                null;

            loadDashboard();
        }, []);

    /*
    |--------------------------------------------------------------------------
    | Pagination controls
    |--------------------------------------------------------------------------
    */

    const goToPreviousPage =
        useCallback(() => {
            setCurrentPage(
                (page) =>
                    Math.max(
                        1,
                        page - 1
                    )
            );
        }, []);

    const goToNextPage =
        useCallback(() => {
            setCurrentPage(
                (page) =>
                    Math.min(
                        totalPages,
                        page + 1
                    )
            );
        }, [totalPages]);

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className={
                styles.Orders
            }
        >
            {/* HEADER */}
            <div
                className={
                    styles.Orders__Header
                }
            >
                <div>
                    <h1
                        className={
                            styles.Orders__Title
                        }
                    >
                        Orders
                    </h1>

                    <p
                        className={
                            styles.Orders__Subtitle
                        }
                    >
                        Manage customer orders
                        and delivery status
                    </p>
                </div>

                <button
                    type="button"
                    className={
                        styles.Orders__Refresh
                    }
                    onClick={
                        handleRefresh
                    }
                    title="Refresh orders"
                >
                    <RefreshCw
                        size={15}
                    />

                    Refresh
                </button>
            </div>

            {/* STATS */}
            <div
                className={
                    styles.Orders__Stats
                }
            >
                <div
                    className={
                        styles.Orders__StatCard
                    }
                >
                    <div
                        className={
                            styles.Orders__StatIcon
                        }
                    >
                        <PackageCheck
                            size={19}
                            strokeWidth={
                                1.8
                            }
                        />
                    </div>

                    <div
                        className={
                            styles.Orders__StatContent
                        }
                    >
                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {Number(
                                stats?.total_orders ||
                                    0
                            )}
                        </strong>
                    </div>
                </div>

                <div
                    className={
                        styles.Orders__StatCard
                    }
                >
                    <div
                        className={
                            styles.Orders__StatIcon
                        }
                    >
                        <Clock3
                            size={19}
                            strokeWidth={
                                1.8
                            }
                        />
                    </div>

                    <div
                        className={
                            styles.Orders__StatContent
                        }
                    >
                        <span>
                            Pending
                        </span>

                        <strong>
                            {Number(
                                stats?.pending_orders ||
                                    0
                            )}
                        </strong>
                    </div>
                </div>

                <div
                    className={
                        styles.Orders__StatCard
                    }
                >
                    <div
                        className={
                            styles.Orders__StatIcon
                        }
                    >
                        <Truck
                            size={19}
                            strokeWidth={
                                1.8
                            }
                        />
                    </div>

                    <div
                        className={
                            styles.Orders__StatContent
                        }
                    >
                        <span>
                            Shipped
                        </span>

                        <strong>
                            {Number(
                                stats?.shipped_orders ||
                                    0
                            )}
                        </strong>
                    </div>
                </div>

                <div
                    className={
                        styles.Orders__StatCard
                    }
                >
                    <div
                        className={
                            styles.Orders__StatIcon
                        }
                    >
                        <Banknote
                            size={19}
                            strokeWidth={
                                1.8
                            }
                        />
                    </div>

                    <div
                        className={
                            styles.Orders__StatContent
                        }
                    >
                        <span>
                            Revenue
                        </span>

                        <strong>
                            {formatPrice(
                                stats?.total_revenue ||
                                    0
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            {/* TOOLBAR */}
            <div
                className={
                    styles.Orders__Toolbar
                }
            >
                <OrderToolbar
                    filters={filters}
                    onFiltersChange={
                        handleFiltersChange
                    }
                />
            </div>

            {/* ERROR */}
            {error && (
                <div
                    className={
                        styles.Orders__Error
                    }
                >
                    {error}
                </div>
            )}

            {/* TABLE */}
            <div
                className={
                    styles.Orders__TableCard
                }
            >
                <div
                    className={
                        styles.Orders__TableWrapper
                    }
                >
                    <table
                        className={
                            styles.Orders__Table
                        }
                    >
                        <colgroup>
                            <col
                                className={
                                    styles.Orders__ColOrder
                                }
                            />

                            <col
                                className={
                                    styles.Orders__ColCustomer
                                }
                            />

                            <col
                                className={
                                    styles.Orders__ColItems
                                }
                            />

                            <col
                                className={
                                    styles.Orders__ColTotal
                                }
                            />

                            <col
                                className={
                                    styles.Orders__ColDelivery
                                }
                            />

                            <col
                                className={
                                    styles.Orders__ColStatus
                                }
                            />

                            <col
                                className={
                                    styles.Orders__ColCreated
                                }
                            />

                            <col
                                className={
                                    styles.Orders__ColActions
                                }
                            />
                        </colgroup>

                        <thead>
                            <tr>
                                <th>
                                    Order
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Delivery
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Created
                                </th>

                                <th>
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={
                                            8
                                        }
                                        className={
                                            styles.Orders__Loading
                                        }
                                    >
                                        Loading
                                        orders...
                                    </td>
                                </tr>
                            ) : paginatedOrders.length ===
                              0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            8
                                        }
                                        className={
                                            styles.Orders__Empty
                                        }
                                    >
                                        No orders
                                        found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map(
                                    (
                                        order
                                    ) => (
                                        <OrderRow
                                            key={getOrderId(
                                                order
                                            )}
                                            order={
                                                order
                                            }
                                            onOpen={() =>
                                                handleViewOrder(
                                                    getOrderId(
                                                        order
                                                    )
                                                )
                                            }
                                            onStatusChange={(
                                                selectedOrder,
                                                nextStatus
                                            ) =>
                                                handleStatusChange(
                                                    getOrderId(
                                                        selectedOrder
                                                    ),
                                                    nextStatus
                                                )
                                            }
                                            onPrint={
                                                handlePrintOrder
                                            }
                                        />
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {!loading &&
                    filteredOrders.length >
                        0 && (
                        <div
                            className={
                                styles.Orders__Pagination
                            }
                        >
                            <span>
                                Showing{" "}
                                <strong>
                                    {(safeCurrentPage -
                                        1) *
                                        ITEMS_PER_PAGE +
                                        1}
                                </strong>{" "}
                                to{" "}
                                <strong>
                                    {Math.min(
                                        safeCurrentPage *
                                            ITEMS_PER_PAGE,
                                        filteredOrders.length
                                    )}
                                </strong>{" "}
                                of{" "}
                                <strong>
                                    {
                                        filteredOrders.length
                                    }
                                </strong>{" "}
                                orders
                            </span>

                            <div
                                className={
                                    styles.Orders__PaginationActions
                                }
                            >
                                <button
                                    type="button"
                                    disabled={
                                        safeCurrentPage <=
                                        1
                                    }
                                    onClick={
                                        goToPreviousPage
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page{" "}
                                    <strong>
                                        {
                                            safeCurrentPage
                                        }
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {
                                            totalPages
                                        }
                                    </strong>
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        safeCurrentPage >=
                                        totalPages
                                    }
                                    onClick={
                                        goToNextPage
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* DETAILS SHEET */}
            <OrderDetailsSheet
                isOpen={
                    Boolean(
                        selectedOrderId
                    )
                }
                orderId={
                    selectedOrderId
                }
                apiBaseUrl={
                    API_BASE_URL
                }
                reloadKey={
                    detailsReloadKey
                }
                onClose={
                    handleCloseDetails
                }
                onStatusChange={(
                    order,
                    status
                ) =>
                    handleStatusChange(
                        getOrderId(
                            order
                        ),
                        status
                    )
                }
                onCancel={
                    handleCancelOrder
                }
            />
        </div>
    );
};

export default Orders;