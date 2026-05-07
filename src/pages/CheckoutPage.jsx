import React from "react";
import OrderConfirmation from "../components/OrderConfirmation.jsx";

const CheckoutPage = ({ order, onNavigateBack }) => {
  return (
    <div className="checkout-page">
      <button className="back-btn" onClick={onNavigateBack}>
        Back to Shopping
      </button>
      <OrderConfirmation order={order} />
    </div>
  );
};

export default CheckoutPage;
