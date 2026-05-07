const analyticsConfig = {
  measurementId: "G-XXXXXXXXXX",
  dataLayerName: "dataLayer",
  currency: "US",
  debug: false,

  eventNames: {
    viewItemList: "view_item_list",
    selectItem: "select_item",
    addToCart: "addToCart",
    viewCart: "view_cart",
    beginCheckout: "begin_checkout",
    purchase: "purchase",
  },

  fieldMappings: {
    transactionId: "transaction_id",
    value: "value",
    currency: "currency",
    coupon: "coupon",
    itemId: "item_id",
    itemName: "item_name",
    price: "price",
    quantity: "quantity",
    discount: "discount",
    itemCategory: "item_category",
    itemListId: "item_list_id",
    itemListName: "item_list_name",
    index: "index",
  },
};

export default analyticsConfig;
