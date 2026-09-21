const escapeHtml = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString(
        "fr-DZ"
    )} DA`;
};

const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("fr-DZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getVariantText = (selectedVariants) => {
    if (!selectedVariants) {
        return "";
    }

    return Object.entries(selectedVariants)
        .map(([type, variant]) => {
            const label =
                type === "color"
                    ? "Color"
                    : type === "model"
                    ? "Model"
                    : type;

            const value =
                typeof variant === "object"
                    ? variant.value
                    : variant;

            return `${label}: ${value}`;
        })
        .join(" • ");
};

const getDeliveryLabel = (value) => {
    return value === "office" ||
        value === "المكتب"
        ? "Office"
        : "Home";
};

export const printOrder = async (
    order,
    apiBaseUrl
) => {
    const orderId =
        order.id ??
        order.order_id ??
        order.orderId;

    if (!orderId) {
        return;
    }

    try {
        const token =
            localStorage.getItem("token");

        const response = await fetch(
            `${apiBaseUrl}/dashboard/orders/${orderId}`,
            {
                headers: token
                    ? {
                          Authorization: `Bearer ${token}`,
                      }
                    : {},
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                    "Failed to load order details"
            );
        }

        const data = result.data;

        const customer =
            data.customer || data;

        const items = data.items || [];

        const subtotal = items.reduce(
            (sum, item) =>
                sum +
                Number(item.quantity || 0) *
                    Number(
                        item.unit_price || 0
                    ),
            0
        );

        const deliveryPrice = Number(
            data.delivery_price || 0
        );

        const total = Number(
            data.total ||
                subtotal +
                    deliveryPrice
        );

        const deliveryType =
            getDeliveryLabel(
                data.delivery_type
            );

        const officeName =
            data.delivery_office_name ||
            data.office_name ||
            data.delivery_office?.name ||
            "";

        const providerName =
            data.shipping_provider_name ||
            data.provider_name ||
            data.shipping_provider?.name ||
            "";

        const customerName =
            data.customer_name ||
            data.full_name ||
            customer.full_name ||
            "—";

        const phone =
            data.customer_phone ||
            data.phone_number ||
            customer.phone_number ||
            "—";

        const province =
            data.province ||
            customer.province ||
            "—";

        const municipality =
            data.municipality ||
            customer.municipality ||
            "—";

        const itemsHtml = items
            .map((item, index) => {
                const lineTotal =
                    Number(
                        item.quantity || 0
                    ) *
                    Number(
                        item.unit_price || 0
                    );

                const variantText =
                    getVariantText(
                        item.selected_variants
                    );

                return `
                    <tr>
                        <td class="number">
                            ${index + 1}
                        </td>

                        <td>
                            <div class="product-name">
                                ${escapeHtml(
                                    item.product_name ||
                                        item.name ||
                                        "Product"
                                )}
                            </div>

                            ${
                                variantText
                                    ? `
                                        <div class="variants">
                                            ${escapeHtml(
                                                variantText
                                            )}
                                        </div>
                                    `
                                    : ""
                            }
                        </td>

                        <td class="center">
                            ${Number(
                                item.quantity || 0
                            )}
                        </td>

                        <td class="money">
                            ${formatMoney(
                                item.unit_price
                            )}
                        </td>

                        <td class="money">
                            ${formatMoney(
                                lineTotal
                            )}
                        </td>
                    </tr>
                `;
            })
            .join("");

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1000,height=800"
            );

        if (!printWindow) {
            alert(
                "Please allow pop-ups to print the order."
            );

            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />

                    <title>
                        Order #${escapeHtml(
                            orderId
                        )}
                    </title>

                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 0;
                            background: #f4f5f7;
                            color: #17181a;
                            font-family:
                                Arial,
                                Helvetica,
                                sans-serif;
                        }

                        .page {
                            width: 210mm;
                            min-height: 297mm;
                            margin: 20px auto;
                            padding: 18mm;
                            background: #ffffff;
                        }

                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            padding-bottom: 24px;
                            border-bottom: 2px solid #17181a;
                        }

                        .brand {
                            font-size: 26px;
                            font-weight: 800;
                            letter-spacing: -0.5px;
                        }

                        .document-title {
                            margin-top: 5px;
                            font-size: 12px;
                            color: #73777d;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }

                        .order-meta {
                            text-align: right;
                        }

                        .order-number {
                            font-size: 22px;
                            font-weight: 800;
                        }

                        .order-date {
                            margin-top: 6px;
                            font-size: 12px;
                            color: #73777d;
                        }

                        .section-grid {
                            display: grid;
                            grid-template-columns:
                                1fr 1fr;
                            gap: 24px;
                            margin: 28px 0;
                        }

                        .section {
                            border: 1px solid #e2e4e7;
                            border-radius: 10px;
                            padding: 16px;
                        }

                        .section-title {
                            margin-bottom: 12px;
                            font-size: 11px;
                            font-weight: 800;
                            color: #73777d;
                            text-transform: uppercase;
                            letter-spacing: 0.8px;
                        }

                        .value {
                            font-size: 14px;
                            line-height: 1.7;
                        }

                        .value strong {
                            font-weight: 700;
                        }

                        .items {
                            margin-top: 20px;
                        }

                        table {
                            width: 100%;
                            border-collapse:
                                collapse;
                        }

                        thead th {
                            padding: 11px 10px;
                            border-bottom:
                                1px solid #17181a;
                            font-size: 10px;
                            color: #73777d;
                            text-align: left;
                            text-transform:
                                uppercase;
                            letter-spacing: 0.5px;
                        }

                        tbody td {
                            padding: 13px 10px;
                            border-bottom:
                                1px solid #eceef0;
                            font-size: 13px;
                        }

                        .number {
                            width: 35px;
                            color: #73777d;
                        }

                        .center {
                            text-align: center;
                        }

                        .money {
                            text-align: right;
                            white-space: nowrap;
                        }

                        .product-name {
                            font-weight: 700;
                        }

                        .variants {
                            margin-top: 4px;
                            font-size: 11px;
                            color: #73777d;
                        }

                        .summary {
                            width: 320px;
                            margin: 28px 0 0 auto;
                        }

                        .summary-row {
                            display: flex;
                            justify-content:
                                space-between;
                            padding: 8px 0;
                            font-size: 13px;
                        }

                        .summary-row.total {
                            margin-top: 8px;
                            padding-top: 14px;
                            border-top:
                                2px solid #17181a;
                            font-size: 18px;
                            font-weight: 800;
                        }

                        .footer {
                            margin-top: 55px;
                            padding-top: 18px;
                            border-top:
                                1px solid #e2e4e7;
                            text-align: center;
                            color: #73777d;
                            font-size: 10px;
                        }

                        @media print {
                            body {
                                background: #ffffff;
                            }

                            .page {
                                width: 100%;
                                min-height: auto;
                                margin: 0;
                                padding: 0;
                            }

                            @page {
                                size: A4;
                                margin: 14mm;
                            }
                        }
                    </style>
                </head>

                <body>
                    <main class="page">

                        <header class="header">
                            <div>
                                <div class="brand">
                                    DOMINOS
                                </div>

                                <div class="document-title">
                                    Customer Order
                                </div>
                            </div>

                            <div class="order-meta">
                                <div class="order-number">
                                    #${escapeHtml(
                                        orderId
                                    )}
                                </div>

                                <div class="order-date">
                                    ${escapeHtml(
                                        formatDateTime(
                                            data.created_at
                                        )
                                    )}
                                </div>
                            </div>
                        </header>

                        <div class="section-grid">

                            <section class="section">
                                <div class="section-title">
                                    Customer
                                </div>

                                <div class="value">
                                    <strong>
                                        ${escapeHtml(
                                            customerName
                                        )}
                                    </strong>
                                    <br />

                                    ${escapeHtml(
                                        phone
                                    )}
                                </div>
                            </section>

                            <section class="section">
                                <div class="section-title">
                                    Delivery
                                </div>

                                <div class="value">
                                    <strong>
                                        ${escapeHtml(
                                            deliveryType
                                        )}
                                    </strong>
                                    <br />

                                    ${escapeHtml(
                                        province
                                    )}
                                    — ${escapeHtml(
                                        municipality
                                    )}

                                    ${
                                        officeName
                                            ? `
                                                <br />
                                                Office:
                                                ${escapeHtml(
                                                    officeName
                                                )}
                                            `
                                            : ""
                                    }

                                    ${
                                        providerName
                                            ? `
                                                <br />
                                                Provider:
                                                ${escapeHtml(
                                                    providerName
                                                )}
                                            `
                                            : ""
                                    }
                                </div>
                            </section>

                        </div>

                        <section class="items">

                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product</th>
                                        <th class="center">
                                            Qty
                                        </th>
                                        <th class="money">
                                            Unit Price
                                        </th>
                                        <th class="money">
                                            Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${
                                        itemsHtml ||
                                        `
                                            <tr>
                                                <td
                                                    colspan="5"
                                                    style="text-align:center"
                                                >
                                                    No items
                                                </td>
                                            </tr>
                                        `
                                    }
                                </tbody>
                            </table>

                        </section>

                        <div class="summary">

                            <div class="summary-row">
                                <span>
                                    Subtotal
                                </span>

                                <span>
                                    ${formatMoney(
                                        subtotal
                                    )}
                                </span>
                            </div>

                            <div class="summary-row">
                                <span>
                                    Delivery
                                </span>

                                <span>
                                    ${formatMoney(
                                        deliveryPrice
                                    )}
                                </span>
                            </div>

                            <div
                                class="summary-row total"
                            >
                                <span>
                                    Total
                                </span>

                                <span>
                                    ${formatMoney(
                                        total
                                    )}
                                </span>
                            </div>

                        </div>

                        <footer class="footer">
                            Order #${escapeHtml(
                                orderId
                            )}
                            • DOMINOS
                        </footer>

                    </main>

                    <script>
                        window.onload = function () {
                            setTimeout(function () {
                                window.print();
                            }, 300);
                        };

                        window.onafterprint = function () {
                            setTimeout(function () {
                                window.close();
                            }, 200);
                        };
                    </script>
                </body>
            </html>
        `);

        printWindow.document.close();
    } catch (error) {
        console.error(
            "Print order error:",
            error
        );

        alert(
            error.message ||
                "Failed to prepare the order for printing."
        );
    }
};