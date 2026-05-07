# JavaScript Data Layer Developer -- Live-Coding Interview

## Position

JavaScript Data Layer Developer (Headless E-Commerce)

## Stack

Next.js, React, Salesforce Commerce Cloud, GA4, GTM

## Duration

45-60 minutes

---

## Scenario

You have just joined a headless e-commerce team. The storefront is built with **Next.js + React** and the backend is powered by **Salesforce Commerce Cloud (SFCC)**. Google Tag Manager (GTM) is deployed on the site, and the analytics team relies on GA4 for revenue reporting.

During the last sprint, the previous developer pushed the checkout tracking code and left the company. QA and the analytics team have flagged several problems:

- Revenue in GA4 is showing as **$0.00** for all transactions
- The `purchase` event fires **multiple times** per order
- **Old coupon codes** from previous orders keep appearing on new orders ("data bleeding")
- The conversion count in GA4 is **2-3x higher** than actual orders in Salesforce

Your job today is to investigate, fix, and extend this tracking implementation.

---

## Part 1: Bug Fixing & Refactoring (20-25 min)

Open `src/components/OrderConfirmation.jsx` and `src/data/mockOrder.js`.

This is the production code currently deployed. Your tasks:

1. **Identify every bug and anti-pattern** in `OrderConfirmation.jsx` that would cause the symptoms described above
2. **Refactor the component** so that:
   - A clean, valid GA4 `purchase` event fires **exactly once** when the user clicks "Complete Order"
   - The `dataLayer.push()` payload follows the [GA4 e-commerce specification](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
   - All field values have the correct data types
   - There is no cross-contamination between events (no "data bleeding")
   - Double-clicks and React re-renders do not cause duplicate events
3. **Talk through** your thought process as you refactor. Explain what each bug would cause in production and why your fix resolves it.

Use `src/data/mockOrder.js` as your sample data. You may modify both files.

---

## Part 2: Subscription Tracking Architecture (10-15 min)

The product team announces:

> "We are launching a monthly subscription for our premium shoe care kit. The first purchase happens on the website, but all subsequent monthly renewals are processed server-side by Salesforce Commerce Cloud. We need to track every renewal as a separate GA4 `purchase` event for LTV reporting."

**Answer the following:**

1. How would you track the initial website purchase vs. the server-side renewals?
2. What GA4 mechanism / API would you use for server-side events?
3. How do you identify the user across both contexts (browser and server)?
4. GA4 deduplicates transactions with the same `transaction_id` within a 31-day window. How would you generate IDs for monthly renewals to avoid this?
5. Sketch out (pseudocode or a diagram) the data flow from SFCC renewal trigger to GA4.

---

## Part 3: Debugging & Data Validation (10 min)

QA comes to you with the following ticket:

> **BUG-4471**: After applying coupon `SUMMER20` on Order #1001, the next Order #1002 (no coupon) still shows `coupon: "SUMMER20"` in the GA4 event. Additionally, revenue for both orders is `$0.00` in the GA4 Realtime report despite the `purchase` event clearly firing in the Network tab.

**Walk the interviewer through your exact debugging steps:**

1. What Chrome DevTools tabs / panels do you open first?
2. What do you type into the Console to inspect the dataLayer state?
3. How do you use GTM Preview / Debug mode to trace the event?
4. What is the root cause of the coupon bleeding?
5. What is the root cause of the $0.00 revenue?
6. What is the one-line fix that prevents data bleeding for all ecommerce events?

---

## Part 4: Cross-Functional Collaboration (5-10 min)

The Product Manager asks you to document the tracking for this checkout flow so that:
- The **Salesforce Commerce Cloud** developers know exactly **when** and **how** to make data available to the front-end data layer
- The **QA team** knows exactly what to validate before release

**Produce:**

1. A brief **Solution Design Reference (SDR)** table that maps:
   - The user action / trigger
   - The `dataLayer` event name
   - Required fields with expected types and sample values
   - The data source (front-end state, SFCC API, URL param, etc.)

2. **2-3 QA acceptance criteria** written as clear pass/fail statements that a non-technical QA analyst could execute using GTM Preview Mode and GA4 DebugView.

---

## What We Are Evaluating

| Area | Weight |
|------|--------|
| JavaScript & React fundamentals (hooks, lifecycle, immutability) | 25% |
| GA4 e-commerce spec knowledge and correct implementation | 25% |
| Debugging methodology and tooling fluency | 25% |
| Communication, documentation, cross-team collaboration | 25% |

Good luck.
