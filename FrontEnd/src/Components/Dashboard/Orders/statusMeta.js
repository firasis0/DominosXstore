// Forward-only order workflow. Cancelled is a separate terminal branch.
export const STATUS_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"];

export const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS = {
  unpaid: "Unpaid",
  paid: "Paid",
};

export const nextStatus = (status) => {
  const index = STATUS_FLOW.indexOf(status);
  return index === -1 || index === STATUS_FLOW.length - 1 ? null : STATUS_FLOW[index + 1];
};

export const isTerminalStatus = (status) => status === "delivered" || status === "cancelled";
