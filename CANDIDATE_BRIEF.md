# GTM Data Layer — Live Coding Task

## Setup

```bash
npm install
npm run dev
```

Open the app. Open DevTools Console. Keep `window.dataLayer` visible as you work.

---

## The Situation

You've inherited this codebase. The analytics team reports:

- Revenue showing **$0.00** in GA4
- Purchase event fires **multiple times** per order
- Old coupon codes **bleed into new orders**
- `add_to_cart` events are **not appearing** in GA4

---

## Your Task

Work through the codebase and answer as you go:

1. **`src/config/analyticsConfig.js`** — Anything wrong with the values in this file?

2. **`src/utils/analytics.js`** — What does `formatCurrency` return for `"$99.99"`? How would you fix it? Notice `splitCategory` — is it being used anywhere it should be?

3. **`src/components/ProductCard.jsx`** — The `add_to_cart` event isn't showing in GA4. What's wrong with the event name? What data is this component receiving but not sending?

4. **`src/components/OrderConfirmation.jsx`** — How many times does the purchase event fire when the page loads? Why? What fires it each time? How would you fix it so it fires exactly once on button click?

5. **`src/data/mockOrder.js`** vs **`src/data/mockProducts.js`** — Compare how prices are stored. What problem does this cause downstream?

6. **`src/utils/analytics.js` `pushEcommerceEvent`** — A QA engineer reports that the coupon from Order A appears on Order B. What is missing from this function? What is the one-line fix?

7. **Refactor** — Rewrite `OrderConfirmation.jsx` to use the shared utilities from `analytics.js`. Make the purchase event fire exactly once, with correct types, and no data bleeding.

8. **Architecture question** — This product is launching a monthly subscription. Renewals happen server-side in Salesforce. How would you track each renewal as a separate GA4 purchase event?
