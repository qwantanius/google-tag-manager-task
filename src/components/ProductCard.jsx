import React from "react";
import { pushEcommerceEvent, getEventName, mapProductToItem } from "../utils/analytics.js";

const ProductCard = ({ product, index, listId, listName }) => {
  const handleAddToCart = () => {
    const eventName = getEventName("addToCart");

    pushEcommerceEvent(eventName, {
      currency: "USD",
      value: product.price,
      items: [mapProductToItem(product, index)],
    });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
      {product.discountAmount > 0 && (
        <p className="discount">Save ${product.discountAmount.toFixed(2)}</p>
      )}
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductCard;
