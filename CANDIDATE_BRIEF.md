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
- **Old coupon codes** from previous orders keep appearing on new orders
- The conversion count in GA4 is **2-3x higher** than actual orders in Salesforce

Your job today is to investigate, fix, and extend this tracking implementation.

> You are welcome to use any development tools you normally rely on, including AI assistants, documentation, or browser extensions. There are no restrictions on tooling. We care about the result and your ability to navigate a messy codebase efficiently.

---

## Setup

```bash
npm install
npm test        # run the test suite -- you will see failures
npm run dev     # run the app locally
```

---

## Phase 1: Fix the Failing Test Suite (20-25 min)

Run `npm test`. You will see multiple test failures across the data layer utilities and configuration.

**Your task:**

1. Read the test file at `src/__tests__/dataLayer.test.js` to understand what the tests expect
2. Trace each failure back to its source file and fix the root cause
3. Run the tests again after each fix to verify progress
4. Repeat until all tests pass

The bugs are spread across multiple files. The test output tells you **what** is wrong but not **where** or **how** to fix it. You will need to read the source code, understand how the modules connect, and fix each issue at the correct layer.

**Talk through your thought process as you work.** Explain what each bug would cause in a production analytics pipeline.

---

## Phase 2: Fix the Component & Reproduce a Runtime Bug (10-15 min)

The test suite validates the utility layer, but `src/components/OrderConfirmation.jsx` has its own problems. It was written by the previous developer and **does not use the shared utilities at all**.

**Your tasks:**

1. Run the app with `npm run dev`
2. Open the browser DevTools console
3. Navigate to Checkout and click "Complete Order"
4. Inspect `window.dataLayer` in the console -- identify the problems
5. Then test the **data bleeding** scenario:
   - Complete an order with coupon `SUMMER20`
   - Navigate back to products, then back to checkout
   - Complete a second order -- inspect whether the old coupon persists
6. Refactor `OrderConfirmation.jsx` to:
   - Use the shared analytics utilities you just fixed
   - Fire the `purchase` event exactly **once** on button click (not on render)
   - Prevent duplicate events from double-clicks or React re-renders
   - Ensure no data bleeds between separate orders

---

## Phase 3: Subscription Tracking Architecture (10 min)

The product team announces:

> "We are launching a monthly subscription for a premium shoe care kit. The first purchase happens on the website, but all subsequent monthly renewals are processed server-side by Salesforce Commerce Cloud. We need every renewal tracked as a separate GA4 purchase event for LTV reporting."

**Answer the following (verbal, no coding required):**

1. How would you track the initial website purchase vs. the server-side renewals?
2. What GA4 mechanism / API would you use for server-side events?
3. How do you identify the user across browser and server contexts?
4. GA4 deduplicates transactions with the same `transaction_id` within a 31-day window. How would you generate IDs for monthly renewals?
5. Sketch the data flow from SFCC renewal trigger to GA4.

---

## Phase 4: Cross-Functional Documentation (5-10 min)

The Product Manager asks you to document this tracking so that:
- **SFCC developers** know when and how to make data available to the front-end
- **QA** knows exactly what to validate before release

**Produce:**

1. A brief **Solution Design Reference (SDR)** table mapping:
   - User action / trigger
   - `dataLayer` event name
   - Required fields with types and sample values
   - Data source (front-end state, SFCC API, URL param, etc.)

2. **2-3 QA acceptance criteria** as clear pass/fail statements that a non-technical QA analyst could execute using GTM Preview Mode and GA4 DebugView.

---

## What We Are Evaluating

| Area | Weight |
|------|--------|
| JavaScript & React fundamentals (hooks, lifecycle, immutability) | 20% |
| GA4 e-commerce spec knowledge and correct implementation | 20% |
| Debugging methodology and tooling fluency | 20% |
| Communication, documentation, cross-team collaboration | 20% |
| Development workflow efficiency (tooling, iteration speed, problem decomposition) | 20% |
