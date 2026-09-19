import {
    useEffect,
    useState,
} from "react";

import {
    X,
    MapPin,
    Phone,
    User,
    Truck,
    Package,
    Building2,
    CalendarDays,
    Hash,
    RefreshCw,
    XCircle,
} from "lucide-react";

import styles from "./styles.module.scss";

const STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const formatPrice = (value) => {
    const number = Number(value || 0);

    return `${number.toLocaleString(
        "fr-DZ"
    )} DA`;
};

const formatDateTime = (value) => {
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

    return date.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

const normalizeStatus = (status) =>
    String(status || "")
        .trim()
        .toLowerCase();

const normalizeDeliveryType = (
    value
) => {
    const normalized = String(
        value || ""
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

const formatDeliveryType = (
    value
) => {
    return normalizeDeliveryType(
        value
    ) === "office"
        ? "Office"
        : "Home";
};

const InfoItem = ({
    icon,
    label,
    value,
}) => {
    return (
        <div
            className={
                styles.OrderDetailsSheet__InfoItem
            }
        >
            <div
                className={
                    styles.OrderDetailsSheet__InfoIcon
                }
            >
                {icon}
            </div>

            <div
                className={
                    styles.OrderDetailsSheet__InfoText
                }
            >
                <span>{label}</span>

                <strong>
                    {value || "—"}
                </strong>
            </div>
        </div>
    );
};

const OrderDetailsSheet = ({
    isOpen,
    orderId,
    apiBaseUrl,
    reloadKey,
    onClose,
    onStatusChange,
    onCancel,
}) => {
    const [loading, setLoading] =
        useState(false);

    const [orderData, setOrderData] =
        useState(null);

    const [error, setError] =
        useState("");

    useEffect(() => {
    if (!isOpen || !orderId) {
        return undefined;
    }

    let cancelled = false;

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${apiBaseUrl}/dashboard/orders/${orderId}`
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                        "Failed to load order details."
                );
            }

            if (!cancelled) {
                setOrderData(
                    result?.data || null
                );
            }
        } catch (fetchError) {
            console.error(
                "Order details error:",
                fetchError
            );

            if (!cancelled) {
                setError(
                    fetchError.message ||
                        "Failed to load order details."
                );
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    loadOrderDetails();

    return () => {
        cancelled = true;
    };
}, [
    isOpen,
    orderId,
    apiBaseUrl,
    reloadKey,
]);

    if (!isOpen) {
        return null;
    }

    const data =
        orderData || {};

    const backendOrder =
        data.order || data;

    const customer =
        data.customer || {};

    const delivery =
        data.delivery || {};

    const pricing =
        data.pricing || {};

    const items =
        Array.isArray(
            data.items
        )
            ? data.items
            : [];

    const status =
        normalizeStatus(
            backendOrder.status
        );

    const isFinal =
        status === "delivered" ||
        status === "cancelled";

    const customerName =
        customer.full_name ||
        backendOrder.customer_name ||
        "—";

    const customerPhone =
        customer.phone_number ||
        backendOrder.customer_phone ||
        "—";

    const customerProvince =
        customer.province ||
        backendOrder.customer_province ||
        backendOrder.province ||
        "—";

    const customerMunicipality =
        customer.municipality ||
        backendOrder.customer_municipality ||
        backendOrder.municipality ||
        "—";

    const provider =
        delivery.provider || {};

    const office =
        delivery.office || null;

    const deliveryType =
        delivery.type ||
        backendOrder.delivery_type;

    const subtotal =
        pricing.subtotal !==
        undefined
            ? pricing.subtotal
            : items.reduce(
                  (
                      total,
                      item
                  ) => {
                      const lineTotal =
                          Number(
                              item.quantity ||
                                  0
                          ) *
                          Number(
                              item.unit_price ||
                                  0
                          );

                      return (
                          total +
                          lineTotal
                      );
                  },
                  0
              );

    const deliveryPrice =
        pricing.delivery !==
        undefined
            ? pricing.delivery
            : backendOrder.delivery_price ||
              0;

    const total =
        pricing.total !==
        undefined
            ? pricing.total
            : backendOrder.total ||
              0;

    const handleStatusChange =
        (event) => {
            const nextStatus =
                event.target.value;

            if (
                !nextStatus ||
                isFinal
            ) {
                return;
            }

            onStatusChange?.(
                backendOrder,
                nextStatus
            );

            event.target.value = "";
        };

    return (
        <div
            className={
                styles.OrderDetailsSheet
            }
        >
            {/* OVERLAY */}
            <div
                className={
                    styles.OrderDetailsSheet__Overlay
                }
                onClick={onClose}
                aria-hidden="true"
            />

            {/* PANEL */}
            <aside
                className={
                    styles.OrderDetailsSheet__Panel
                }
            >
                {/* HEADER */}
                <div
                    className={
                        styles.OrderDetailsSheet__Header
                    }
                >
                    <div>
                        <span
                            className={
                                styles.OrderDetailsSheet__Eyebrow
                            }
                        >
                            Order details
                        </span>

                        <h2
                            className={
                                styles.OrderDetailsSheet__Title
                            }
                        >
                            #
                            {backendOrder.id ||
                                orderId}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.OrderDetailsSheet__Close
                        }
                        onClick={onClose}
                        aria-label="Close order details"
                    >
                        <X
                            size={18}
                        />
                    </button>
                </div>

                {/* CONTENT */}
                <div
                    className={
                        styles.OrderDetailsSheet__Content
                    }
                >
                    {loading && (
                        <div
                            className={
                                styles.OrderDetailsSheet__Loading
                            }
                        >
                            Loading order
                            details...
                        </div>
                    )}

                    {!loading &&
                        error && (
                            <div
                                className={
                                    styles.OrderDetailsSheet__Error
                                }
                            >
                                {error}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        orderData && (
                            <>
                                {/* STATUS */}
                                <section
                                    className={
                                        styles.OrderDetailsSheet__Section
                                    }
                                >
                                    <div
                                        className={
                                            styles.OrderDetailsSheet__SectionHeader
                                        }
                                    >
                                        <span>
                                            Order
                                            status
                                        </span>

                                        <span
                                            className={`${styles.OrderDetailsSheet__Status} ${
                                                styles[
                                                    `OrderDetailsSheet__Status--${status}`
                                                ] ||
                                                ""
                                            }`}
                                        >
                                            {STATUS_LABELS[
                                                status
                                            ] ||
                                                status ||
                                                "Unknown"}
                                        </span>
                                    </div>

                                    <div
                                        className={
                                            styles.OrderDetailsSheet__StatusActions
                                        }
                                    >
                                        {!isFinal && (
                                            <div
                                                className={
                                                    styles.OrderDetailsSheet__StatusChanger
                                                }
                                            >
                                                <RefreshCw
                                                    size={
                                                        14
                                                    }
                                                />

                                                <select
                                                    defaultValue=""
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

                                                    {Object.entries(
                                                        STATUS_LABELS
                                                    ).map(
                                                        ([
                                                            value,
                                                            label,
                                                        ]) => (
                                                            <option
                                                                key={
                                                                    value
                                                                }
                                                                value={
                                                                    value
                                                                }
                                                            >
                                                                {
                                                                    label
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                        {isFinal ? (
                                            <span
                                                className={
                                                    styles.OrderDetailsSheet__FinalNotice
                                                }
                                            >
                                                This
                                                order
                                                is
                                                finalized
                                                and
                                                cannot
                                                be
                                                changed.
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className={
                                                    styles.OrderDetailsSheet__CancelButton
                                                }
                                                onClick={() =>
                                                    onCancel?.(
                                                        backendOrder
                                                    )
                                                }
                                            >
                                                <XCircle
                                                    size={
                                                        14
                                                    }
                                                />

                                                Cancel
                                                order
                                            </button>
                                        )}
                                    </div>
                                </section>

                                {/* CUSTOMER */}
                                <section
                                    className={
                                        styles.OrderDetailsSheet__Section
                                    }
                                >
                                    <h3
                                        className={
                                            styles.OrderDetailsSheet__SectionTitle
                                        }
                                    >
                                        Customer
                                    </h3>

                                    <div
                                        className={
                                            styles.OrderDetailsSheet__InfoGrid
                                        }
                                    >
                                        <InfoItem
                                            icon={
                                                <User
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Name"
                                            value={
                                                customerName
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Phone
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Phone"
                                            value={
                                                customerPhone
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <MapPin
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Province"
                                            value={
                                                customerProvince
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <MapPin
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Municipality"
                                            value={
                                                customerMunicipality
                                            }
                                        />
                                    </div>
                                </section>

                                {/* DELIVERY */}
                                <section
                                    className={
                                        styles.OrderDetailsSheet__Section
                                    }
                                >
                                    <h3
                                        className={
                                            styles.OrderDetailsSheet__SectionTitle
                                        }
                                    >
                                        Delivery
                                    </h3>

                                    <div
                                        className={
                                            styles.OrderDetailsSheet__InfoGrid
                                        }
                                    >
                                        <InfoItem
                                            icon={
                                                <Truck
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Delivery type"
                                            value={formatDeliveryType(
                                                deliveryType
                                            )}
                                        />

                                        <InfoItem
                                            icon={
                                                <Building2
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Provider"
                                            value={
                                                provider.name ||
                                                backendOrder.shipping_provider_name ||
                                                "—"
                                            }
                                        />

                                        {office && (
                                            <>
                                                <InfoItem
                                                    icon={
                                                        <Building2
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    }
                                                    label="Office"
                                                    value={
                                                        office.name
                                                    }
                                                />

                                                <InfoItem
                                                    icon={
                                                        <MapPin
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    }
                                                    label="Office address"
                                                    value={
                                                        office.address ||
                                                        "—"
                                                    }
                                                />
                                            </>
                                        )}
                                    </div>
                                </section>

                                {/* ORDER INFORMATION */}
                                <section
                                    className={
                                        styles.OrderDetailsSheet__Section
                                    }
                                >
                                    <h3
                                        className={
                                            styles.OrderDetailsSheet__SectionTitle
                                        }
                                    >
                                        Order
                                        information
                                    </h3>

                                    <div
                                        className={
                                            styles.OrderDetailsSheet__MetaGrid
                                        }
                                    >
                                        <div>
                                            <Hash
                                                size={
                                                    14
                                                }
                                            />

                                            <span>
                                                #
                                                {
                                                    backendOrder.id
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <CalendarDays
                                                size={
                                                    14
                                                }
                                            />

                                            <span>
                                                {formatDateTime(
                                                    backendOrder.created_at
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* PRODUCTS */}
                                <section
                                    className={
                                        styles.OrderDetailsSheet__Section
                                    }
                                >
                                    <h3
                                        className={
                                            styles.OrderDetailsSheet__SectionTitle
                                        }
                                    >
                                        Products
                                    </h3>

                                    <div
                                        className={
                                            styles.OrderDetailsSheet__Items
                                        }
                                    >
                                        {items.length ===
                                        0 ? (
                                            <div
                                                className={
                                                    styles.OrderDetailsSheet__Empty
                                                }
                                            >
                                                No
                                                products
                                                found.
                                            </div>
                                        ) : (
                                            items.map(
                                                (
                                                    item
                                                ) => {
                                                    const lineTotal =
                                                        item.line_total ??
                                                        Number(
                                                            item.quantity ||
                                                                0
                                                        ) *
                                                            Number(
                                                                item.unit_price ||
                                                                    0
                                                            );

                                                    const selectedVariants =
                                                        item.selected_variants &&
                                                        typeof item.selected_variants ===
                                                            "object"
                                                            ? Object.entries(
                                                                  item.selected_variants
                                                              )
                                                            : [];

                                                    return (
                                                        <div
                                                            key={
                                                                item.id
                                                            }
                                                            className={
                                                                styles.OrderDetailsSheet__Item
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.OrderDetailsSheet__ItemImage
                                                                }
                                                            >
                                                                {item.image_url ? (
                                                                    <img
                                                                        src={`
                                                                            ${import.meta.env.VITE_HOST_BASE_URL}${item.image_url}
                                                                        `}
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
                                                                    styles.OrderDetailsSheet__ItemMain
                                                                }
                                                            >
                                                                <strong>
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </strong>

                                                                {selectedVariants.length >
                                                                    0 && (
                                                                    <div
                                                                        className={
                                                                            styles.OrderDetailsSheet__Variants
                                                                        }
                                                                    >
                                                                        {selectedVariants.map(
                                                                            ([
                                                                                type,
                                                                                variant,
                                                                            ]) => (
                                                                                <span
                                                                                    key={
                                                                                        type
                                                                                    }
                                                                                >
                                                                                    {type}:{" "}
                                                                                    {typeof variant ===
                                                                                    "object"
                                                                                        ? variant.value
                                                                                        : variant}
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <span
                                                                    className={
                                                                        styles.OrderDetailsSheet__Quantity
                                                                    }
                                                                >
                                                                    Qty:{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div
                                                                className={
                                                                    styles.OrderDetailsSheet__ItemPrice
                                                                }
                                                            >
                                                                <strong>
                                                                    {formatPrice(
                                                                        lineTotal
                                                                    )}
                                                                </strong>

                                                                <span>
                                                                    {formatPrice(
                                                                        item.unit_price
                                                                    )}{" "}
                                                                    /
                                                                    unit
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )
                                        )}
                                    </div>
                                </section>

                                {/* TOTALS */}
                                <section
                                    className={
                                        styles.OrderDetailsSheet__Totals
                                    }
                                >
                                    <div>
                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {formatPrice(
                                                subtotal
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Delivery
                                        </span>

                                        <strong>
                                            {formatPrice(
                                                deliveryPrice
                                            )}
                                        </strong>
                                    </div>

                                    <div
                                        className={
                                            styles.OrderDetailsSheet__GrandTotal
                                        }
                                    >
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatPrice(
                                                total
                                            )}
                                        </strong>
                                    </div>
                                </section>
                            </>
                        )}
                </div>
            </aside>
        </div>
    );
};

export default OrderDetailsSheet;