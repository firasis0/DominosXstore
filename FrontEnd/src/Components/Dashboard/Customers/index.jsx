import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Users,
    UserRoundPlus,
    ShoppingBag,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import CustomerToolbar from "./CustomerToolbar";
import CustomerRow from "./CustomerRow";
import CustomerDetailsSheet from "./CustomerDetailsSheet";

import { authFetch, API_BASE_URL } from "../../../lib/authFetch.js";

import styles from "./styles.module.scss";

const PAGE_LIMIT = 20;

const EMPTY_STATS = {
    total_customers: 0,
    customers_with_orders: 0,
    total_orders: 0,
    total_revenue: 0,
};

function getCustomerId(customer) {
    return customer?.id ?? customer?.customer_id;
}

function formatMoney(value) {
    const amount = Number(value || 0);

    return `${amount.toLocaleString("fr-DZ")} DA`;
}

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(EMPTY_STATS);

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [province, setProvince] = useState("");
    const [hasOrders, setHasOrders] = useState("");

    const [provinces, setProvinces] = useState([]);

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: PAGE_LIMIT,
        total: 0,
        totalPages: 1,
    });

    const [selectedCustomerId, setSelectedCustomerId] =
        useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadStatsAndProvinces = async () => {
            try {
                setStatsLoading(true);

                const [statsResponse, provincesResponse] =
                    await Promise.all([
                        authFetch(
                            "/dashboard/customers/stats"
                        ),
                        authFetch(
                            "/dashboard/customers/provinces"
                        ),
                    ]);

                const [statsResult, provincesResult] =
                    await Promise.all([
                        statsResponse.json(),
                        provincesResponse.json(),
                    ]);

                if (!statsResponse.ok) {
                    throw new Error(
                        statsResult?.message ||
                            "Failed to load customer statistics."
                    );
                }

                if (!provincesResponse.ok) {
                    throw new Error(
                        provincesResult?.message ||
                            "Failed to load provinces."
                    );
                }

                if (cancelled) {
                    return;
                }

                setStats(
                    statsResult?.data || EMPTY_STATS
                );

                setProvinces(
                    Array.isArray(provincesResult?.data)
                        ? provincesResult.data
                        : []
                );
            } catch (fetchError) {
                console.error(
                    "Customer stats/provinces error:",
                    fetchError
                );
            } finally {
                if (!cancelled) {
                    setStatsLoading(false);
                }
            }
        };

        loadStatsAndProvinces();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadCustomers = async () => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                params.set("page", String(page));
                params.set("limit", String(PAGE_LIMIT));

                if (search.trim()) {
                    params.set(
                        "search",
                        search.trim()
                    );
                }

                if (province) {
                    params.set("province", province);
                }

                if (hasOrders) {
                    params.set(
                        "has_orders",
                        hasOrders
                    );
                }

                const response = await authFetch(
                    `/dashboard/customers?${params.toString()}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                            "Failed to load customers."
                    );
                }

                if (cancelled) {
                    return;
                }

                const data = Array.isArray(result?.data)
                    ? result.data
                    : [];

                setCustomers(data);

                setPagination(
                    result?.pagination || {
                        page,
                        limit: PAGE_LIMIT,
                        total: data.length,
                        totalPages: 1,
                    }
                );
            } catch (fetchError) {
                console.error(
                    "Customers error:",
                    fetchError
                );

                if (!cancelled) {
                    setError(
                        fetchError.message ||
                            "Failed to load customers."
                    );

                    setCustomers([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCustomers();

        return () => {
            cancelled = true;
        };
    }, [page, search, province, hasOrders]);

    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        setPage(1);
    }, []);

    const handleProvinceChange = useCallback((value) => {
        setProvince(value);
        setPage(1);
    }, []);

    const handleHasOrdersChange = useCallback((value) => {
        setHasOrders(value);
        setPage(1);
    }, []);

    const handleResetFilters = useCallback(() => {
        setSearch("");
        setProvince("");
        setHasOrders("");
        setPage(1);
    }, []);

    const handleCustomerClick = useCallback((customer) => {
        const id = getCustomerId(customer);

        if (!id) {
            return;
        }

        setSelectedCustomerId(id);
    }, []);

    const handleCloseDetails = useCallback(() => {
        setSelectedCustomerId(null);
    }, []);

    const totalPages = Math.max(
        1,
        Number(pagination?.totalPages || 1)
    );

    const currentPage = Number(
        pagination?.page || page || 1
    );

    const customerCountText = useMemo(() => {
        const total = Number(
            pagination?.total || 0
        );

        if (total === 0) {
            return "No customers found";
        }

        const start =
            (currentPage - 1) * PAGE_LIMIT + 1;

        const end = Math.min(
            currentPage * PAGE_LIMIT,
            total
        );

        return `Showing ${start}-${end} of ${total} customers`;
    }, [pagination, currentPage]);

    return (
        <main className={styles.Customers}>
            <div className={styles.Customers__Container}>
                <header className={styles.Customers__Header}>
                    <div>
                        <span
                            className={
                                styles.Customers__Eyebrow
                            }
                        >
                            CUSTOMER MANAGEMENT
                        </span>

                        <h1
                            className={
                                styles.Customers__Title
                            }
                        >
                            Customers
                        </h1>

                        <p
                            className={
                                styles.Customers__Description
                            }
                        >
                            Manage customers and inspect
                            their complete order history.
                        </p>
                    </div>
                </header>

                <section className={styles.Customers__Stats}>
                    <article
                        className={
                            styles.Customers__StatCard
                        }
                    >
                        <div
                            className={
                                styles.Customers__StatIcon
                            }
                        >
                            <Users size={20} />
                        </div>

                        <div>
                            <span
                                className={
                                    styles.Customers__StatLabel
                                }
                            >
                                Total Customers
                            </span>

                            <strong
                                className={
                                    styles.Customers__StatValue
                                }
                            >
                                {statsLoading
                                    ? "—"
                                    : Number(
                                          stats.total_customers ||
                                              0
                                      ).toLocaleString()}
                            </strong>
                        </div>
                    </article>

                    <article
                        className={
                            styles.Customers__StatCard
                        }
                    >
                        <div
                            className={
                                styles.Customers__StatIcon
                            }
                        >
                            <UserRoundPlus size={20} />
                        </div>

                        <div>
                            <span
                                className={
                                    styles.Customers__StatLabel
                                }
                            >
                                Customers With Orders
                            </span>

                            <strong
                                className={
                                    styles.Customers__StatValue
                                }
                            >
                                {statsLoading
                                    ? "—"
                                    : Number(
                                          stats.customers_with_orders ||
                                              0
                                      ).toLocaleString()}
                            </strong>
                        </div>
                    </article>

                    <article
                        className={
                            styles.Customers__StatCard
                        }
                    >
                        <div
                            className={
                                styles.Customers__StatIcon
                            }
                        >
                            <ShoppingBag size={20} />
                        </div>

                        <div>
                            <span
                                className={
                                    styles.Customers__StatLabel
                                }
                            >
                                Total Orders
                            </span>

                            <strong
                                className={
                                    styles.Customers__StatValue
                                }
                            >
                                {statsLoading
                                    ? "—"
                                    : Number(
                                          stats.total_orders ||
                                              0
                                      ).toLocaleString()}
                            </strong>
                        </div>
                    </article>

                    <article
                        className={
                            styles.Customers__StatCard
                        }
                    >
                        <div
                            className={
                                styles.Customers__StatIcon
                            }
                        >
                            <MapPin size={20} />
                        </div>

                        <div>
                            <span
                                className={
                                    styles.Customers__StatLabel
                                }
                            >
                                Total Revenue
                            </span>

                            <strong
                                className={
                                    styles.Customers__StatValue
                                }
                            >
                                {statsLoading
                                    ? "—"
                                    : formatMoney(
                                          stats.total_revenue
                                      )}
                            </strong>
                        </div>
                    </article>
                </section>

                <CustomerToolbar
                    search={search}
                    province={province}
                    hasOrders={hasOrders}
                    provinces={provinces}
                    onSearchChange={
                        handleSearchChange
                    }
                    onProvinceChange={
                        handleProvinceChange
                    }
                    onHasOrdersChange={
                        handleHasOrdersChange
                    }
                    onReset={handleResetFilters}
                />

                <section
                    className={
                        styles.Customers__TableCard
                    }
                >
                    <div
                        className={
                            styles.Customers__TableHeader
                        }
                    >
                        <div>
                            <h2>Customer List</h2>

                            <span>
                                {customerCountText}
                            </span>
                        </div>
                    </div>

                    {error ? (
                        <div
                            className={
                                styles.Customers__Error
                            }
                        >
                            {error}
                        </div>
                    ) : null}

                    <div
                        className={
                            styles.Customers__TableWrapper
                        }
                    >
                        <table
                            className={
                                styles.Customers__Table
                            }
                        >
                            <colgroup>
                                <col
                                    className={
                                        styles.Customers__ColCustomer
                                    }
                                />
                                <col
                                    className={
                                        styles.Customers__ColPhone
                                    }
                                />
                                <col
                                    className={
                                        styles.Customers__ColLocation
                                    }
                                />
                                <col
                                    className={
                                        styles.Customers__ColOrders
                                    }
                                />
                                <col
                                    className={
                                        styles.Customers__ColSpent
                                    }
                                />
                                <col
                                    className={
                                        styles.Customers__ColDate
                                    }
                                />
                                <col
                                    className={
                                        styles.Customers__ColAction
                                    }
                                />
                            </colgroup>

                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Location</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th>Last Order</th>
                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className={
                                                styles.Customers__StateCell
                                            }
                                        >
                                            Loading customers...
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className={
                                                styles.Customers__StateCell
                                            }
                                        >
                                            No customers
                                            found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map(
                                        (customer) => (
                                            <CustomerRow
                                                key={getCustomerId(
                                                    customer
                                                )}
                                                customer={
                                                    customer
                                                }
                                                onClick={
                                                    handleCustomerClick
                                                }
                                            />
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        className={
                            styles.Customers__Pagination
                        }
                    >
                        <span>
                            {customerCountText}
                        </span>

                        <div
                            className={
                                styles.Customers__PaginationControls
                            }
                        >
                            <button
                                type="button"
                                disabled={
                                    currentPage <= 1
                                }
                                onClick={() =>
                                    setPage(
                                        Math.max(
                                            1,
                                            currentPage - 1
                                        )
                                    )
                                }
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={17} />
                            </button>

                            <span>
                                Page {currentPage} of{" "}
                                {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    currentPage >=
                                    totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        Math.min(
                                            totalPages,
                                            currentPage + 1
                                        )
                                    )
                                }
                                aria-label="Next page"
                            >
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <CustomerDetailsSheet
                isOpen={Boolean(selectedCustomerId)}
                customerId={selectedCustomerId}
                apiBaseUrl={API_BASE_URL}
                onClose={handleCloseDetails}
            />
        </main>
    );
}