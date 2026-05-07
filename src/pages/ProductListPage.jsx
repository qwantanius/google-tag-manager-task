import React, { useEffect } from "react";
import { pushEcommerceEvent, getEventName, mapProductToItem } from "../utils/analytics.js";
import ProductCard from "../components/ProductCard.jsx";

const ProductListPage = ({ products, onNavigateToCheckout }) => {
  useEffect(() => {
    const eventName = getEventName("viewItemList");

    pushEcommerceEvent(eventName, {
      item_list_id: "featured_products",
      item_list_name: "Featured Products",
      items: products.map((product, index) => mapProductToItem(product, index)),
    });
  }, []);

  return (
    <div className="product-list-page">
      <h1>Featured Products</h1>
      <div className="product-grid">
        {products.map((product, index) => (
          <ProductCard
            key={product.sku}
            product={product}
            index={index}
            listId="featured_products"
            listName="Featured Products"
          />
        ))}
      </div>
      <button className="checkout-btn" onClick={onNavigateToCheckout}>
        Go to Checkout
      </button>
    </div>
  );
};

export default ProductListPage;
