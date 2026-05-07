import analyticsConfig from "../config/analyticsConfig.js";

export function initDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

export function formatCurrency(value) {
  if (typeof value === "number") {
    return value;
  }
  return parseInt(value, 10);
}

export function mapProductToItem(product, index) {
  return {
    item_id: product.sku,
    item_name: product.name,
    price: product.price,
    quantity: product.qty || 1,
    discount: product.discountAmount || 0,
    item_category: product.category,
    index: index,
  };
}

export function buildPurchasePayload(order) {
  const config = analyticsConfig;

  return {
    transaction_id: order.id,
    value: formatCurrency(order.total),
    currency: config.currency,
    coupon: order.appliedCoupon,
    items: order.items.map((item, i) => mapProductToItem(item, i)),
  };
}

export function pushEcommerceEvent(eventName, ecommerceData) {
  initDataLayer();

  window.dataLayer.push({
    event: eventName,
    ecommerce: ecommerceData,
  });
}

export function getEventName(key) {
  return analyticsConfig.eventNames[key] || key;
}
