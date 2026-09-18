import { STATUS_LABELS, PAYMENT_LABELS } from "./statusMeta";

const formatPrice = (price) => `${Number(price || 0).toLocaleString("fr-DZ")} DA`;

const formatDate = (value) =>
  new Date(value).toLocaleString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

// Opens a standalone, print-ready receipt window for one order — no dashboard chrome.
export const printOrder = (order) => {
  if (!order) {
    return;
  }

  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.product_name || "Deleted product")}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatPrice(item.unit_price)}</td>
          <td class="num">${formatPrice(item.line_total)}</td>
        </tr>
      `
    )
    .join("");

  const deliveryLines = [
    `<div class="row"><span>Delivery type</span><span>${
      order.delivery_type === "office" ? "Office pickup" : "Home delivery"
    }</span></div>`,
    order.shipping_provider_name
      ? `<div class="row"><span>Provider</span><span>${escapeHtml(order.shipping_provider_name)}</span></div>`
      : "",
    order.delivery_office_name
      ? `<div class="row"><span>Office</span><span>${escapeHtml(order.delivery_office_name)}</span></div>`
      : "",
    order.delivery_office_address
      ? `<div class="row"><span>Office address</span><span>${escapeHtml(order.delivery_office_address)}</span></div>`
      : "",
  ].join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order #${order.id} — DOMINOS</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, Segoe UI, Arial, sans-serif;
            color: #111;
            margin: 0;
            padding: 32px;
          }
          .brand { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
          .meta { color: #888; font-size: 12px; margin-top: 4px; }
          h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin: 24px 0 8px; }
          .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; }
          .row span:first-child { color: #888; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th, td { padding: 6px 4px; font-size: 12.5px; border-bottom: 1px solid #eee; text-align: left; }
          th { color: #888; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.4px; }
          td.num, th.num { text-align: right; }
          .totals { margin-top: 10px; width: 260px; margin-left: auto; }
          .totals .row.grand { font-weight: 700; font-size: 15px; border-top: 1px solid #ddd; padding-top: 6px; margin-top: 4px; }
          .status { display: inline-block; margin-top: 4px; padding: 3px 8px; border-radius: 10px; background: #f0f0f0; font-size: 11px; font-weight: 600; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="brand">DOMINOS</div>
        <div class="meta">Order #${order.id} · ${formatDate(order.created_at)}</div>
        <div class="status">${STATUS_LABELS[order.status] || order.status}</div>

        <h2>Customer</h2>
        <div class="row"><span>Name</span><span>${escapeHtml(order.customer_name)}</span></div>
        <div class="row"><span>Phone</span><span>${escapeHtml(order.customer_phone)}</span></div>
        <div class="row"><span>Province</span><span>${escapeHtml(order.customer_province)}</span></div>
        <div class="row"><span>Municipality</span><span>${escapeHtml(order.customer_municipality)}</span></div>

        <h2>Delivery</h2>
        ${deliveryLines}

        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th class="num">Qty</th>
              <th class="num">Unit price</th>
              <th class="num">Line total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
          <div class="row"><span>Delivery</span><span>${formatPrice(order.delivery_price)}</span></div>
          <div class="row"><span>Payment</span><span>${PAYMENT_LABELS[order.payment_status] || order.payment_status}</span></div>
          <div class="row grand"><span>Total</span><span>${formatPrice(order.total)}</span></div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=680,height=800");

  if (!printWindow) {
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};
