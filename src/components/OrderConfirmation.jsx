import React, { useState, useEffect } from "react";

const OrderConfirmation = ({ order }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: order.id,
        value: order.total,
        currency: "USD",
        coupon: order.appliedCoupon,
        items: order.items.map((item) => ({
          item_id: item.sku,
          item_name: item.name,
          price: item.price,
          quantity: item.qty,
          discount: item.discountAmount,
          item_category: item.category,
        })),
      },
    });
  });

  const handleCompleteOrder = () => {
    setIsSubmitting(true);

    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: order.id,
        value: order.total,
        currency: "USD",
        coupon: order.appliedCoupon,
        items: order.items.map((item) => ({
          item_id: item.sku,
          item_name: item.name,
          price: item.price,
          quantity: item.qty,
          discount: item.discountAmount,
          item_category: item.category,
        })),
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="order-confirmation">
      <h2>Order Summary</h2>
      <p>Order ID: {order.id}</p>
      <p>Total: {order.total}</p>
      {order.appliedCoupon && <p>Coupon Applied: {order.appliedCoupon}</p>}
      <ul>
        {order.items.map((item) => (
          <li key={item.sku}>
            {item.name} - {item.price} x {item.qty}
          </li>
        ))}
      </ul>
      <button onClick={handleCompleteOrder} disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Complete Order"}
      </button>
    </div>
  );
};

export default OrderConfirmation;
