import { useEffect, useState } from "react";
import {
    ShoppingBag,
    Package,
    Users,
    Banknote,
} from "lucide-react";
import styles from "./styles.module.scss";
import { authFetch } from "../../../../lib/authFetch.js";

const EMPTY_STATS = {
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    revenue: 0,
};

const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("fr-DZ");
};

const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString("fr-DZ")} DA`;
};

export default function Stats() {
    const [stats, setStats] = useState(EMPTY_STATS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const loadStats = async () => {
            try {
                const [
                    ordersResponse,
                    productsResponse,
                    customersResponse,
                ] = await Promise.all([
                    authFetch(
                        "/dashboard/orders/stats",
                        {
                            signal: controller.signal,
                        }
                    ),
                    authFetch(
                        "/dashboard/products",
                        {
                            signal: controller.signal,
                        }
                    ),
                    authFetch(
                        "/dashboard/customers/stats",
                        {
                            signal: controller.signal,
                        }
                    ),
                ]);

                const [
                    ordersResult,
                    productsResult,
                    customersResult,
                ] = await Promise.all([
                    ordersResponse.json(),
                    productsResponse.json(),
                    customersResponse.json(),
                ]);

                if (
                    !ordersResponse.ok ||
                    !ordersResult.success
                ) {
                    throw new Error(
                        ordersResult.message ||
                            "Failed to load order statistics."
                    );
                }

                if (
                    !productsResponse.ok ||
                    !productsResult.success
                ) {
                    throw new Error(
                        productsResult.message ||
                            "Failed to load product statistics."
                    );
                }

                if (
                    !customersResponse.ok ||
                    !customersResult.success
                ) {
                    throw new Error(
                        customersResult.message ||
                            "Failed to load customer statistics."
                    );
                }

                const products = Array.isArray(
                    productsResult.data
                )
                    ? productsResult.data
                    : [];

                setStats({
                    total_orders:
                        Number(
                            ordersResult.data?.total_orders
                        ) || 0,

                    total_products:
                        products.length,

                    total_customers:
                        Number(
                            customersResult.data
                                ?.total_customers
                        ) || 0,

                    revenue:
                        Number(
                            ordersResult.data
                                ?.total_revenue
                        ) || 0,
                });
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(
                        "Dashboard stats error:",
                        error
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadStats();

        return () => {
            controller.abort();
        };
    }, []);

    const statCards = [
        {
            title: "Total Orders",
            value: loading
                ? "—"
                : formatNumber(stats.total_orders),
            icon: ShoppingBag,
        },
        {
            title: "Products",
            value: loading
                ? "—"
                : formatNumber(stats.total_products),
            icon: Package,
        },
        {
            title: "Customers",
            value: loading
                ? "—"
                : formatNumber(stats.total_customers),
            icon: Users,
        },
        {
            title: "Revenue",
            value: loading
                ? "—"
                : formatMoney(stats.revenue),
            icon: Banknote,
        },
    ];

    return (
        <div className={styles.Stats}>
            {statCards.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        className={styles.Stats__Card}
                        key={stat.title}
                    >
                        <div
                            className={styles.Stats__Top}
                        >
                            <span>{stat.title}</span>

                            <div
                                className={
                                    styles.Stats__Icon
                                }
                            >
                                <Icon size={18} />
                            </div>
                        </div>

                        <strong>{stat.value}</strong>
                    </div>
                );
            })}
        </div>
    );
}