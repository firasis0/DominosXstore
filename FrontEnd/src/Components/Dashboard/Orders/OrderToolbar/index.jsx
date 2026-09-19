import {
    Search,
    ChevronDown,
    RotateCcw,
    CalendarDays,
} from "lucide-react";

import styles from "./styles.module.scss";

const OrderToolbar = ({
    filters,
    onFiltersChange,
}) => {
    const handleChange = (
        key,
        value
    ) => {
        onFiltersChange({
            [key]: value,
        });
    };

    const handleReset = () => {
        onFiltersChange({
            search: "",
            status: "",
            deliveryType: "",
            dateFrom: "",
            dateTo: "",
        });
    };

    const hasActiveFilters =
        Boolean(
            filters?.search
        ) ||
        Boolean(
            filters?.status
        ) ||
        Boolean(
            filters?.deliveryType
        ) ||
        Boolean(
            filters?.dateFrom
        ) ||
        Boolean(
            filters?.dateTo
        );

    return (
        <div
            className={
                styles.OrderToolbar
            }
        >
            {/* SEARCH */}
            <div
                className={
                    styles.OrderToolbar__Search
                }
            >
                <Search size={15} />

                <input
                    type="search"
                    value={
                        filters?.search ||
                        ""
                    }
                    onChange={(
                        event
                    ) =>
                        handleChange(
                            "search",
                            event.target
                                .value
                        )
                    }
                    placeholder="Search orders, customers, phone..."
                    aria-label="Search orders"
                />
            </div>

            {/* FILTERS */}
            <div
                className={
                    styles.OrderToolbar__Filters
                }
            >
                {/* STATUS */}
                <div
                    className={
                        styles.OrderToolbar__Select
                    }
                >
                    <select
                        value={
                            filters?.status ||
                            ""
                        }
                        onChange={(
                            event
                        ) =>
                            handleChange(
                                "status",
                                event.target
                                    .value
                            )
                        }
                        aria-label="Filter by order status"
                    >
                        <option value="">
                            All statuses
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="confirmed">
                            Confirmed
                        </option>

                        <option value="processing">
                            Processing
                        </option>

                        <option value="shipped">
                            Shipped
                        </option>

                        <option value="delivered">
                            Delivered
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>
                    </select>

                    <ChevronDown
                        size={14}
                    />
                </div>

                {/* DELIVERY TYPE */}
                <div
                    className={
                        styles.OrderToolbar__Select
                    }
                >
                    <select
                        value={
                            filters?.deliveryType ||
                            ""
                        }
                        onChange={(
                            event
                        ) =>
                            handleChange(
                                "deliveryType",
                                event.target
                                    .value
                            )
                        }
                        aria-label="Filter by delivery type"
                    >
                        <option value="">
                            All delivery
                        </option>

                        <option value="home">
                            Home
                        </option>

                        <option value="office">
                            Office
                        </option>
                    </select>

                    <ChevronDown
                        size={14}
                    />
                </div>

                {/* DATE RANGE */}
                <div
                    className={
                        styles.OrderToolbar__DateRange
                    }
                >
                    <CalendarDays
                        size={14}
                    />

                    <input
                        type="date"
                        value={
                            filters?.dateFrom ||
                            ""
                        }
                        onChange={(
                            event
                        ) =>
                            handleChange(
                                "dateFrom",
                                event.target
                                    .value
                            )
                        }
                        aria-label="Orders from date"
                    />

                    <span>—</span>

                    <input
                        type="date"
                        value={
                            filters?.dateTo ||
                            ""
                        }
                        onChange={(
                            event
                        ) =>
                            handleChange(
                                "dateTo",
                                event.target
                                    .value
                            )
                        }
                        aria-label="Orders to date"
                    />
                </div>

                {/* RESET */}
                <button
                    type="button"
                    className={
                        styles.OrderToolbar__Reset
                    }
                    onClick={
                        handleReset
                    }
                    disabled={
                        !hasActiveFilters
                    }
                >
                    <RotateCcw
                        size={14}
                    />

                    Reset
                </button>
            </div>
        </div>
    );
};

export default OrderToolbar;