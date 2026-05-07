import { describe, test, expect, beforeEach } from "vitest";
import {
  formatCurrency,
  mapProductToItem,
  buildPurchasePayload,
  pushEcommerceEvent,
} from "../utils/analytics.js";
import analyticsConfig from "../config/analyticsConfig.js";
import mockOrder from "../data/mockOrder.js";
import mockProducts from "../data/mockProducts.js";

describe("formatCurrency", () => {
  test("should preserve decimal precision for float values", () => {
    expect(formatCurrency(99.99)).toBe(99.99);
    expect(formatCurrency(16.66)).toBe(16.66);
    expect(formatCurrency(0.01)).toBe(0.01);
  });

  test("should strip currency symbols and return a float", () => {
    expect(formatCurrency("$99.99")).toBe(99.99);
    expect(formatCurrency("$0.00")).toBe(0);
    expect(formatCurrency("$149.97")).toBe(149.97);
  });
});

describe("analyticsConfig", () => {
  test("currency should be a valid ISO 4217 code (3 characters)", () => {
    expect(analyticsConfig.currency).toHaveLength(3);
    expect(analyticsConfig.currency).toBe("USD");
  });

  test("all event names should use snake_case format", () => {
    const eventNames = Object.values(analyticsConfig.eventNames);

    for (const name of eventNames) {
      expect(name).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });
});

describe("mapProductToItem", () => {
  test("should split category hierarchy into separate fields", () => {
    const product = mockProducts[0];
    const item = mapProductToItem(product, 0);

    expect(item.item_category).toBe("Shoes");
    expect(item.item_category2).toBe("Sneakers");
    expect(item.item_category3).toBe("Lifestyle");
  });

  test("should handle single-level categories", () => {
    const product = { ...mockProducts[0], category: "Shoes" };
    const item = mapProductToItem(product, 0);

    expect(item.item_category).toBe("Shoes");
    expect(item.item_category2).toBeUndefined();
  });

  test("should format price as a number", () => {
    const stringPriceProduct = { ...mockProducts[0], price: "$99.99" };
    const item = mapProductToItem(stringPriceProduct, 0);

    expect(typeof item.price).toBe("number");
    expect(item.price).toBe(99.99);
  });
});

describe("buildPurchasePayload", () => {
  test("value should be a number, not a string", () => {
    const payload = buildPurchasePayload(mockOrder);

    expect(typeof payload.value).toBe("number");
    expect(payload.value).toBe(149.97);
  });

  test("all item prices should be numbers", () => {
    const payload = buildPurchasePayload(mockOrder);

    for (const item of payload.items) {
      expect(typeof item.price).toBe("number");
      expect(typeof item.discount).toBe("number");
    }
  });

  test("currency should be a valid 3-letter ISO code", () => {
    const payload = buildPurchasePayload(mockOrder);

    expect(payload.currency).toBe("USD");
  });

  test("coupon should be undefined when not applied", () => {
    const orderWithoutCoupon = { ...mockOrder, appliedCoupon: null };
    const payload = buildPurchasePayload(orderWithoutCoupon);

    expect(payload.coupon).toBeUndefined();
  });
});

describe("pushEcommerceEvent", () => {
  test("should push ecommerce:null before the event to prevent data bleeding", () => {
    pushEcommerceEvent("purchase", { transaction_id: "TEST-001", value: 10 });

    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer[0]).toEqual({ ecommerce: null });
    expect(window.dataLayer[1].event).toBe("purchase");
  });

  test("should not carry over ecommerce data between separate pushes", () => {
    pushEcommerceEvent("purchase", {
      transaction_id: "ORD-001",
      value: 100,
      coupon: "SAVE10",
    });

    pushEcommerceEvent("purchase", {
      transaction_id: "ORD-002",
      value: 50,
    });

    const lastPush = window.dataLayer[window.dataLayer.length - 1];
    expect(lastPush.ecommerce.coupon).toBeUndefined();
  });
});
