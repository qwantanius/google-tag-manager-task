import React, { useState } from "react";
import ProductListPage from "./pages/ProductListPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import mockProducts from "./data/mockProducts.js";
import mockOrder from "./data/mockOrder.js";

const App = () => {
  const [currentPage, setCurrentPage] = useState("products");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Nike Store</h1>
        <span className="env-badge">DEV</span>
      </header>

      <main>
        {currentPage === "products" && (
          <ProductListPage
            products={mockProducts}
            onNavigateToCheckout={() => setCurrentPage("checkout")}
          />
        )}
        {currentPage === "checkout" && (
          <CheckoutPage
            order={mockOrder}
            onNavigateBack={() => setCurrentPage("products")}
          />
        )}
      </main>
    </div>
  );
};

export default App;
