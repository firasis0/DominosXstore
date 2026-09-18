import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Pagination } from "@/Components/ui/pagination";
import Toast from "@/Components/ui/toast";

import OrderStats from "./OrderStats";
import OrderToolbar from "./OrderToolbar";
import OrderRow from "./OrderRow";
import styles from "./styles.module.scss";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emptyFilters = {
  search: "",
  status: "",
  paymentStatus: "",
  deliveryType: "",
  dateFrom: "",
  dateTo: "",
};

const emptyStats = { total_orders: 0, pending: 0, to_ship: 0, revenue: 0 };

const buildQuery = (filters, extra = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentStatus) params.set("payment_status", filters.paymentStatus);
  if (filters.deliveryType) params.set("delivery_type", filters.deliveryType);
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);

  Object.entries(extra).forEach(([key, value]) => params.set(key, value));

  return params.toString();
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pageCount: 1 });

  const [stats, setStats] = useState(emptyStats);

  const [filters, setFilters] = useState(emptyFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Debounce the search box so we're not refetching on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search }));
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (field, value) => {
    if (field === "search") {
      setSearch(value);
      return;
    }

    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const query = buildQuery(filters, { page, limit: pagination.limit });
      const response = await fetch(`${API_BASE_URL}/dashboard/orders?${query}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch orders");
      }

      setOrders(result.data);
      setPagination(result.pagination);
      setError("");
    } catch (fetchError) {
      console.error("Error fetching dashboard orders:", fetchError);
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/orders/stats`);
      const result = await response.json();

      if (response.ok && result.success) {
        setStats(result.data);
      }
    } catch (statsError) {
      console.error("Error fetching order stats:", statsError);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilters(emptyFilters);
    setPage(1);
  };

  const handleFetchDetails = useCallback(async (id) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/orders/${id}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to load order");
    }

    return result.data;
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update order status");
      }

      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
      fetchStats();

      setToast({ type: "success", message: `Order #${id} moved to ${status}.` });
    } catch (updateError) {
      console.error("Error updating order status:", updateError);
      setToast({ type: "warning", message: updateError.message || "Unable to update order status." });
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/orders/${id}/cancel`, {
        method: "PATCH",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel order");
      }

      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, status: "cancelled" } : order))
      );
      fetchStats();

      setToast({ type: "info", message: `Order #${id} was cancelled.` });
    } catch (cancelError) {
      console.error("Error cancelling order:", cancelError);
      setToast({ type: "warning", message: cancelError.message || "Unable to cancel order." });
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const query = buildQuery(filters);
      const response = await fetch(`${API_BASE_URL}/dashboard/orders/export?${query}`);

      if (!response.ok) {
        throw new Error("Failed to export orders");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "orders.csv";
      link.click();

      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("Error exporting orders:", exportError);
      setToast({ type: "warning", message: "Unable to export orders." });
    } finally {
      setExporting(false);
    }
  };

  const toolbarFilters = useMemo(() => ({ ...filters, search }), [filters, search]);

  return (
    <section className={styles.Orders}>
      <div className={styles.Orders__Header}>
        <div>
          <p className={styles.Orders__Eyebrow}>Order management</p>
          <h1>Orders</h1>
          <p>Manage customer orders, payments and fulfillment.</p>
        </div>

        <div className={styles.Orders__HeaderActions}>
          <button className={styles.Orders__GhostButton} onClick={handleRefresh}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <button className={styles.Orders__GhostButton} onClick={handleExport} disabled={exporting}>
            <Download size={16} />
            <span>{exporting ? "Exporting..." : "Export Orders"}</span>
          </button>
        </div>
      </div>

      <div className={styles.Orders__StatsWrap}>
        <OrderStats stats={stats} />
      </div>

      <div className={styles.Orders__TableCard}>
        <OrderToolbar
          filters={toolbarFilters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <div className={styles.Orders__TableWrap}>
          <Table className={styles.Orders__Table}>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead aria-label="Actions" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className={styles.Orders__Loading}>
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className={styles.Orders__Empty}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className={styles.Orders__Empty}>
                    No orders match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onFetchDetails={handleFetchDetails}
                    onUpdateStatus={handleUpdateStatus}
                    onCancel={handleCancel}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className={styles.Orders__Footer}>
          <span>Showing {orders.length} of {pagination.total} orders</span>

          <Pagination page={pagination.page} pageCount={pagination.pageCount} onPageChange={setPage} />

          <span>Page {pagination.page} of {pagination.pageCount}</span>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </section>
  );
}
