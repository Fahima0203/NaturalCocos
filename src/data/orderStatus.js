// Enum-like constants for order/payment status — use these instead of raw
// string literals so values stay consistent across Checkout, OrderHistory,
// and any future admin dashboard.

export const ORDER_STATUS = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED:   "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID:    "Paid",
  FAILED:  "Failed",
  REFUNDED: "Refunded",
};
