const mockOrder = {
  id: "ORD-20260507-1842",
  total: "$149.97",
  tax: "$12.50",
  shipping: "$5.99",
  appliedCoupon: "SUMMER20",
  items: [
    {
      sku: "NKE-AF1-WHT-10",
      name: "Nike Air Force 1 '07",
      price: "$99.99",
      qty: 1,
      discountAmount: "$20.00",
      category: "Shoes > Sneakers > Lifestyle",
    },
    {
      sku: "NKE-SOCK-BLK-L",
      name: "Nike Everyday Cushion Crew Socks (3-Pack)",
      price: "$16.66",
      qty: 3,
      discountAmount: "$0.00",
      category: "Accessories > Socks",
    },
  ],
};

export default mockOrder;
