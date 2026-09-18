import { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/Components/ui/sheet";

import { STATUS_LABELS, PAYMENT_LABELS } from "../statusMeta";
import styles from "../styles.module.scss";

const formatPrice = (price) => `${Number(price || 0).toLocaleString("fr-DZ")} DA`;

const formatDateTime = (value) =>
  new Date(value).toLocaleString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function OrderDetailsSheet({ orderId, open, onOpenChange, onFetchDetails }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    onFetchDetails(orderId)
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError.message || "Unable to load this order.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, orderId, onFetchDetails]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Order #{orderId}</SheetTitle>
          <SheetDescription>Customer, items and delivery details.</SheetDescription>
        </SheetHeader>

        <div className={styles.OrderDetails}>
          {loading ? (
            <div className={styles.OrderDetails__Loading}>Loading order...</div>
          ) : error ? (
            <div className={styles.OrderDetails__Empty}>{error}</div>
          ) : order ? (
            <>
              <div className={styles.OrderDetails__Section}>
                <h3>Customer</h3>
                <div className={styles.OrderDetails__Row}>
                  <span>Full name</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className={styles.OrderDetails__Row}>
                  <span>Phone</span>
                  <span>{order.customer_phone}</span>
                </div>
                <div className={styles.OrderDetails__Row}>
                  <span>Province</span>
                  <span>{order.customer_province}</span>
                </div>
                <div className={styles.OrderDetails__Row}>
                  <span>Municipality</span>
                  <span>{order.customer_municipality}</span>
                </div>
              </div>

              <div className={styles.OrderDetails__Section}>
                <h3>Items</h3>
                {order.items.map((item) => (
                  <div className={styles.OrderDetails__Item} key={item.id}>
                    <div className={styles.OrderDetails__ItemImage}>
                      {item.product_image && <img src={item.product_image} alt="" />}
                    </div>

                    <div className={styles.OrderDetails__ItemInfo}>
                      <strong>{item.product_name || "Deleted product"}</strong>
                      <span>
                        {item.quantity} × {formatPrice(item.unit_price)}
                      </span>
                    </div>

                    <span className={styles.OrderDetails__ItemTotal}>{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.OrderDetails__Section}>
                <h3>Financials</h3>
                <div className={styles.OrderDetails__Row}>
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className={styles.OrderDetails__Row}>
                  <span>Delivery price</span>
                  <span>{formatPrice(order.delivery_price)}</span>
                </div>
                <div className={styles.OrderDetails__Row}>
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className={styles.OrderDetails__Row}>
                  <span>Payment</span>
                  <span>{PAYMENT_LABELS[order.payment_status] || order.payment_status}</span>
                </div>
              </div>

              <div className={styles.OrderDetails__Section}>
                <h3>Delivery</h3>
                <div className={styles.OrderDetails__Row}>
                  <span>Type</span>
                  <span>{order.delivery_type === "office" ? "Office pickup" : "Home delivery"}</span>
                </div>
                {order.shipping_provider_name && (
                  <div className={styles.OrderDetails__Row}>
                    <span>Provider</span>
                    <span>{order.shipping_provider_name}</span>
                  </div>
                )}
                {order.delivery_office_name && (
                  <div className={styles.OrderDetails__Row}>
                    <span>Office</span>
                    <span>{order.delivery_office_name}</span>
                  </div>
                )}
                {order.delivery_office_address && (
                  <div className={styles.OrderDetails__Row}>
                    <span>Office address</span>
                    <span>{order.delivery_office_address}</span>
                  </div>
                )}
              </div>

              <div className={styles.OrderDetails__Section}>
                <h3>Status timeline</h3>
                <div className={styles.OrderDetails__Timeline}>
                  <div className={styles.OrderDetails__TimelineStep}>
                    <span className={styles.OrderDetails__TimelineDot} />
                    <div>
                      <strong>Order created</strong>
                      <span>{formatDateTime(order.created_at)}</span>
                    </div>
                  </div>

                  {order.status_history.map((step) => (
                    <div className={styles.OrderDetails__TimelineStep} key={step.id}>
                      <span className={styles.OrderDetails__TimelineDot} />
                      <div>
                        <strong>{STATUS_LABELS[step.status] || step.status}</strong>
                        <span>{formatDateTime(step.changed_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
