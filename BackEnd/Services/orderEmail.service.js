import { sendEmail } from "./email.service.js";

const formatPrice = (value) =>
    `${Number(value || 0).toLocaleString("fr-FR")} DA`;

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString(
        "fr-FR",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );
};

const formatVariants = (variants) => {
    if (
        !variants ||
        typeof variants !== "object" ||
        Array.isArray(variants)
    ) {
        return "—";
    }

    const entries = Object.entries(variants);

    if (!entries.length) {
        return "—";
    }

    return entries
        .map(
            ([type, variant]) => `
                <div style="
                    margin: 4px 0;
                    font-size: 13px;
                    color: #555;
                ">
                    <strong>${escapeHtml(type)}:</strong>
                    ${escapeHtml(
                        variant?.value ?? variant
                    )}
                </div>
            `
        )
        .join("");
};

export const sendNewOrderEmail = async ({
    order,
    customer,
    product,
    item,
    shipping,
    deliveryOffice,
}) => {
    const subtotal = Number(
        product.subtotal || 0
    );

    const deliveryPrice = Number(
        shipping.delivery_price || 0
    );

    const total = Number(
        order.total || 0
    );

    const deliveryType =
        shipping.delivery_type === "office"
            ? "مكتب التوصيل"
            : "التوصيل إلى المنزل";

    const officeSection =
        shipping.delivery_type === "office" &&
        deliveryOffice
            ? `
                <div style="
                    margin-top: 12px;
                    padding: 14px;
                    background: #f8f8f8;
                    border-radius: 8px;
                ">
                    <div style="
                        font-size: 13px;
                        color: #777;
                        margin-bottom: 5px;
                    ">
                        مكتب التوصيل
                    </div>

                    <div style="
                        font-size: 15px;
                        font-weight: 600;
                        color: #222;
                    ">
                        ${escapeHtml(
                            deliveryOffice.name
                        )}
                    </div>

                    ${
                        deliveryOffice.address
                            ? `
                                <div style="
                                    margin-top: 4px;
                                    font-size: 13px;
                                    color: #666;
                                ">
                                    ${escapeHtml(
                                        deliveryOffice.address
                                    )}
                                </div>
                            `
                            : ""
                    }

                    ${
                        deliveryOffice
                            .municipality_name
                            ? `
                                <div style="
                                    margin-top: 4px;
                                    font-size: 13px;
                                    color: #666;
                                ">
                                    ${escapeHtml(
                                        deliveryOffice.municipality_name
                                    )}
                                </div>
                            `
                            : ""
                    }
                </div>
            `
            : "";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />
    <title>New DOMINOS Order</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
    color: #222;
">

    <div style="
        width: 100%;
        padding: 32px 12px;
        box-sizing: border-box;
    ">

        <div style="
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 18px rgba(0,0,0,0.08);
        ">

            <!-- Header -->

            <div style="
                background: #111111;
                padding: 26px 30px;
                text-align: center;
            ">
                <div style="
                    color: #ffffff;
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: 2px;
                ">
                    DOMINOS
                </div>

                <div style="
                    margin-top: 7px;
                    color: #bdbdbd;
                    font-size: 13px;
                ">
                    New Order Notification
                </div>
            </div>

            <!-- Order summary -->

            <div style="
                padding: 28px 30px 10px;
            ">

                <div style="
                    display: inline-block;
                    padding: 7px 12px;
                    background: #fff3cd;
                    color: #856404;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 700;
                ">
                    NEW ORDER
                </div>

                <h1 style="
                    margin: 14px 0 6px;
                    font-size: 24px;
                    color: #111;
                ">
                    Order #${escapeHtml(order.id)}
                </h1>

                <p style="
                    margin: 0;
                    color: #777;
                    font-size: 13px;
                ">
                    ${escapeHtml(
                        formatDate(
                            order.created_at
                        )
                    )}
                </p>
            </div>

            <!-- Customer -->

            <div style="
                margin: 20px 30px 0;
                padding: 20px;
                border: 1px solid #e8e8e8;
                border-radius: 10px;
            ">

                <h2 style="
                    margin: 0 0 16px;
                    font-size: 17px;
                    color: #111;
                ">
                    Customer Information
                </h2>

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                        border-collapse: collapse;
                        font-size: 14px;
                    "
                >
                    <tr>
                        <td style="
                            padding: 6px 0;
                            color: #777;
                            width: 150px;
                        ">
                            Full name
                        </td>

                        <td style="
                            padding: 6px 0;
                            font-weight: 600;
                        ">
                            ${escapeHtml(
                                customer.full_name
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 6px 0;
                            color: #777;
                        ">
                            Phone
                        </td>

                        <td style="
                            padding: 6px 0;
                            font-weight: 600;
                        ">
                            ${escapeHtml(
                                customer.phone_number
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 6px 0;
                            color: #777;
                        ">
                            Province
                        </td>

                        <td style="
                            padding: 6px 0;
                            font-weight: 600;
                        ">
                            ${escapeHtml(
                                customer.province
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 6px 0;
                            color: #777;
                        ">
                            Municipality
                        </td>

                        <td style="
                            padding: 6px 0;
                            font-weight: 600;
                        ">
                            ${escapeHtml(
                                customer.municipality
                            )}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Product -->

            <div style="
                margin: 20px 30px 0;
                padding: 20px;
                border: 1px solid #e8e8e8;
                border-radius: 10px;
            ">

                <h2 style="
                    margin: 0 0 16px;
                    font-size: 17px;
                    color: #111;
                ">
                    Order Details
                </h2>

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                        border-collapse: collapse;
                    "
                >
                    <tr>
                        <td style="
                            width: 76px;
                            padding: 10px 12px 10px 0;
                            border-bottom: 1px solid #eeeeee;
                            vertical-align: middle;
                        ">
                            ${
                                product.image_url
                                    ? `
                                        <img
                                            src="${escapeHtml(
    `${process.env.PUBLIC_BASE_URL}${product.image_url}`
)}"
                                            alt="${escapeHtml(
                                                product.name
                                            )}"
                                            width="64"
                                            height="64"
                                            style="
                                                display: block;
                                                width: 64px;
                                                height: 64px;
                                                object-fit: cover;
                                                border-radius: 8px;
                                                border: 1px solid #eeeeee;
                                            "
                                        />
                                    `
                                    : `
                                        <div style="
                                            width: 64px;
                                            height: 64px;
                                            background: #f1f1f1;
                                            border-radius: 8px;
                                            text-align: center;
                                            line-height: 64px;
                                            color: #999999;
                                            font-size: 10px;
                                        ">
                                            No image
                                        </div>
                                    `
                            }
                        </td>

                        <td style="
                            padding: 10px 0;
                            border-bottom: 1px solid #eeeeee;
                            vertical-align: middle;
                            font-weight: 700;
                            font-size: 15px;
                        ">
                            ${escapeHtml(
                                product.name
                            )}
                        </td>

                        <td style="
                            padding: 10px 0;
                            border-bottom: 1px solid #eeeeee;
                            text-align: right;
                            vertical-align: middle;
                            font-weight: 700;
                            font-size: 15px;
                            white-space: nowrap;
                        ">
                            ${formatPrice(
                                product.unit_price
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 10px 0;
                            color: #666;
                            font-size: 13px;
                        ">
                            Quantity
                        </td>

                        <td style="
                            padding: 10px 0;
                            text-align: right;
                            color: #666;
                            font-size: 13px;
                        ">
                            × ${escapeHtml(
                                item.quantity
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td
                            colspan="2"
                            style="
                                padding-top: 6px;
                            "
                        >
                            ${formatVariants(
                                item.selected_variants
                            )}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Delivery -->

            <div style="
                margin: 20px 30px 0;
                padding: 20px;
                border: 1px solid #e8e8e8;
                border-radius: 10px;
            ">

                <h2 style="
                    margin: 0 0 16px;
                    font-size: 17px;
                    color: #111;
                ">
                    Delivery Details
                </h2>

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                        border-collapse: collapse;
                        font-size: 14px;
                    "
                >
                    <tr>
                        <td style="
                            padding: 6px 0;
                            color: #777;
                        ">
                            Delivery type
                        </td>

                        <td style="
                            padding: 6px 0;
                            text-align: right;
                            font-weight: 600;
                        ">
                            ${escapeHtml(
                                deliveryType
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 6px 0;
                            color: #777;
                        ">
                            Shipping provider
                        </td>

                        <td style="
                            padding: 6px 0;
                            text-align: right;
                            font-weight: 600;
                        ">
                            ${escapeHtml(
                                shipping.provider_name
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 6px 0;
                            color: #777;
                        ">
                            Delivery price
                        </td>

                        <td style="
                            padding: 6px 0;
                            text-align: right;
                            font-weight: 600;
                        ">
                            ${formatPrice(
                                deliveryPrice
                            )}
                        </td>
                    </tr>
                </table>

                ${officeSection}
            </div>

            <!-- Total -->

            <div style="
                margin: 20px 30px 30px;
                padding: 20px;
                background: #111111;
                border-radius: 10px;
            ">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                        border-collapse: collapse;
                    "
                >
                    <tr>
                        <td style="
                            padding: 5px 0;
                            color: #bbbbbb;
                            font-size: 14px;
                        ">
                            Subtotal
                        </td>

                        <td style="
                            padding: 5px 0;
                            color: #ffffff;
                            text-align: right;
                            font-size: 14px;
                        ">
                            ${formatPrice(
                                subtotal
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 5px 0;
                            color: #bbbbbb;
                            font-size: 14px;
                        ">
                            Delivery
                        </td>

                        <td style="
                            padding: 5px 0;
                            color: #ffffff;
                            text-align: right;
                            font-size: 14px;
                        ">
                            ${formatPrice(
                                deliveryPrice
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding-top: 14px;
                            color: #ffffff;
                            font-size: 19px;
                            font-weight: 700;
                            border-top: 1px solid #333333;
                        ">
                            Total
                        </td>

                        <td style="
                            padding-top: 14px;
                            color: #ffffff;
                            text-align: right;
                            font-size: 21px;
                            font-weight: 800;
                            border-top: 1px solid #333333;
                        ">
                            ${formatPrice(total)}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Footer -->

            <div style="
                padding: 0 30px 28px;
                text-align: center;
                color: #999;
                font-size: 11px;
            ">
                This is an automated notification from
                DOMINOS STORE.
            </div>

        </div>

    </div>

</body>
</html>
`;

    const text = `
DOMINOS STORE - NEW ORDER

Order #${order.id}
Date: ${formatDate(order.created_at)}

CUSTOMER
Name: ${customer.full_name}
Phone: ${customer.phone_number}
Province: ${customer.province}
Municipality: ${customer.municipality}

PRODUCT
Product: ${product.name}
Quantity: ${item.quantity}
Unit price: ${formatPrice(product.unit_price)}
Subtotal: ${formatPrice(subtotal)}

VARIANTS
${Object.entries(
    item.selected_variants || {}
)
    .map(
        ([type, variant]) =>
            `${type}: ${variant?.value ?? variant}`
    )
    .join("\n") || "—"}

DELIVERY
Type: ${deliveryType}
Provider: ${shipping.provider_name}
Delivery price: ${formatPrice(deliveryPrice)}
${
    deliveryOffice
        ? `Office: ${deliveryOffice.name}
Address: ${deliveryOffice.address || "—"}
Municipality: ${
              deliveryOffice.municipality_name ||
              "—"
          }`
        : ""
}

TOTAL
${formatPrice(total)}
`;

    return sendEmail({
        to: process.env.EMAIL_ADMIN,
        subject: `New DOMINOS Order #${order.id} — ${formatPrice(total)}`,
        text,
        html,
    });
};
