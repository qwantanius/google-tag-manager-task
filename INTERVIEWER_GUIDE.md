# Interviewer Guide & Evaluation Rubric

## How To Run This Interview

1. Share only `CANDIDATE_BRIEF.md`, `src/components/OrderConfirmation.jsx`, and `src/data/mockOrder.js` with the candidate
2. Give them 2-3 minutes to read the scenario before they start
3. Ask them to share their screen and think aloud
4. Use the checklists below to score each pillar in real-time

---

## Part 1: Bug Fixing & Refactoring -- Answer Key

### Bugs the Candidate Must Identify

| # | Bug | Symptom It Causes | Severity |
|---|-----|--------------------|----------|
| 1 | `useEffect` has **no dependency array** -- fires on every render | `purchase` event fires multiple times (inflated conversions) | Critical |
| 2 | `purchase` event pushed in **both** `useEffect` AND `handleCompleteOrder` -- double-firing by design | Duplicate transactions in GA4 | Critical |
| 3 | All prices are **strings** (`"$99.99"`) instead of **numbers** (`99.99`) | GA4 records `value: 0` because it cannot parse the string -- revenue shows $0.00 | Critical |
| 4 | No `ecommerce: null` push before the purchase event | Previous ecommerce object merges into the new push -- coupon bleeding, stale items | Critical |
| 5 | No **double-click protection** beyond the `disabled` attribute (race condition: state update is async, two clicks can register before first re-render) | Duplicate purchase events | Medium |
| 6 | `order.total` is a string `"$149.97"` -- even if parsed, it includes `$` | `value` field must be a clean float | Critical |
| 7 | `discount` field values are strings (`"$20.00"`) | GA4 ignores or zeros out non-numeric discount values | Medium |
| 8 | `item_category` uses ` > ` delimiter (`"Shoes > Sneakers > Lifestyle"`) instead of separate `item_category`, `item_category2`, `item_category3` fields | Category hierarchy is lost in GA4 reports | Low-Medium |
| 9 | No `tax` or `shipping` fields in the purchase payload | Incomplete revenue data (acceptable to note, not critical) | Low |
| 10 | `submitOrder` is called but never imported/defined | Runtime error -- order never completes | Medium |

### Perfect Refactored Solution

```jsx
import React, { useState, useRef, useCallback } from "react";

function parseCurrency(value) {
  if (typeof value === "number") return value;
  return parseFloat(String(value).replace(/[^0-9.\-]/g, "")) || 0;
}

function parseCategories(categoryString) {
  if (!categoryString) return {};

  const parts = categoryString.split(">").map((s) => s.trim());
  const result = {};

  parts.forEach((part, index) => {
    const suffix = index === 0 ? "" : String(index + 1);
    result[`item_category${suffix}`] = part;
  });

  return result;
}

function buildEcommercePayload(order) {
  return {
    transaction_id: order.id,
    value: parseCurrency(order.total),
    currency: "USD",
    coupon: order.appliedCoupon || undefined,
    items: order.items.map((item) => ({
      item_id: item.sku,
      item_name: item.name,
      price: parseCurrency(item.price),
      quantity: item.qty,
      discount: parseCurrency(item.discountAmount),
      ...parseCategories(item.category),
    })),
  };
}

function pushPurchaseEvent(order) {
  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({ ecommerce: null });

  window.dataLayer.push({
    event: "purchase",
    ecommerce: buildEcommercePayload(order),
  });
}

const OrderConfirmation = ({ order, onSubmitOrder }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFiredRef = useRef(false);

  const handleCompleteOrder = useCallback(async () => {
    if (hasFiredRef.current || isSubmitting) return;

    hasFiredRef.current = true;
    setIsSubmitting(true);

    pushPurchaseEvent(order);

    try {
      await onSubmitOrder(order);
    } catch (error) {
      hasFiredRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [order, isSubmitting, onSubmitOrder]);

  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      <p>Order ID: {order.id}</p>
      <p>Total: ${parseCurrency(order.total).toFixed(2)}</p>
      {order.appliedCoupon && <p>Coupon: {order.appliedCoupon}</p>}
      <ul>
        {order.items.map((item) => (
          <li key={item.sku}>
            {item.name} - ${parseCurrency(item.price).toFixed(2)} x {item.qty}
          </li>
        ))}
      </ul>
      <button onClick={handleCompleteOrder} disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Complete Order"}
      </button>
    </div>
  );
};

export default OrderConfirmation;
```

### Scoring Checklist -- Part 1

| Criterion | Strong (3) | Acceptable (2) | Weak (1) |
|-----------|-----------|----------------|----------|
| Identifies useEffect firing on every render | Immediately spots missing deps array, removes useEffect entirely | Spots it after some time, adds `[]` but leaves the push in useEffect | Does not identify the issue |
| Identifies double-push (useEffect + click) | Explains why both locations are wrong, consolidates to click-only | Removes one but does not articulate why clearly | Leaves both in place |
| Fixes string prices to numbers | Creates a reusable parse utility, strips `$` and converts | Hardcodes `parseFloat` inline | Does not fix or uses `parseInt` |
| Pushes `ecommerce: null` before purchase | Explains GA4 data bleeding, adds the null push | Adds it but cannot explain why | Does not add it |
| Implements double-click guard | Uses a `useRef` flag (survives re-renders) in addition to `disabled` | Uses only `disabled` or only state-based guard | No guard at all |
| Splits category hierarchy | Creates `item_category`, `item_category2`, etc. | Mentions it should be split but does not implement | Leaves the `>` delimited string |
| Clean code structure | Extracts helper functions, clear naming, no side effects in render | Inline but functional | Messy, hard to follow |

---

## Part 2: Subscription Tracking Architecture -- Answer Key

### What a Strong Answer Covers

**1. Initial vs. Renewal Tracking**

- **Initial purchase**: Standard client-side `dataLayer.push()` with GA4 `purchase` event (same as Part 1)
- **Renewals**: Server-side only -- the user is not on the website, so client-side tracking is impossible

**2. GA4 Measurement Protocol**

The candidate should name the **GA4 Measurement Protocol** (not the older Universal Analytics version). Key details:

- POST to `https://www.google-analytics.com/mp/collect`
- Requires `api_secret` and `measurement_id` as query params
- Payload includes `client_id` (or `user_id`), and an `events` array
- The event structure mirrors the client-side schema

```
POST /mp/collect?api_secret=<SECRET>&measurement_id=G-XXXXXXX

{
  "client_id": "stored_ga_client_id",
  "user_id": "sfcc_customer_id",
  "events": [{
    "name": "purchase",
    "params": {
      "transaction_id": "SUB-20260607-1842-R3",
      "value": 29.99,
      "currency": "USD",
      "items": [...]
    }
  }]
}
```

**3. User Identity**

- Store the GA4 `client_id` (from the `_ga` cookie) at the time of the initial purchase in SFCC against the customer record
- Also send a `user_id` (the SFCC customer ID) on both client-side and server-side events to enable User-ID reporting
- The candidate should mention that `client_id` is **required** by the Measurement Protocol and cannot be replaced by `user_id` alone

**4. Transaction ID Strategy for Renewals**

GA4 deduplicates events with the same `transaction_id` within a **31-day window**. For monthly subscriptions this is a collision risk.

Strong answer: Generate unique IDs per renewal, e.g.:
- `SUB-{original_order_id}-R{renewal_number}` (e.g., `SUB-1001-R1`, `SUB-1001-R2`)
- `SUB-{original_order_id}-{YYYYMMDD}` (e.g., `SUB-1001-20260607`)
- UUID per renewal event

Red flag: Reusing the original `transaction_id` for all renewals.

**5. Data Flow Sketch**

```
SFCC Subscription Engine
        |
        | (cron job or webhook on renewal)
        v
Server-Side Service (Node.js / Cloud Function)
        |
        | 1. Fetch stored client_id + user_id
        | 2. Generate unique transaction_id
        | 3. Build GA4 MP payload
        |
        v
GA4 Measurement Protocol Endpoint
        |
        v
GA4 Property (purchase event, LTV reports)
```

### Scoring Checklist -- Part 2

| Criterion | Strong (3) | Acceptable (2) | Weak (1) |
|-----------|-----------|----------------|----------|
| Names Measurement Protocol | Correctly identifies GA4 MP, knows the endpoint and required params | Mentions "server-side tracking" but vague on mechanism | Suggests client-side workarounds or does not know |
| User identity strategy | Explains client_id storage + user_id, mentions _ga cookie | Mentions user_id but not client_id requirement | No coherent identity strategy |
| Transaction ID dedup awareness | Knows the 31-day rule, proposes unique ID scheme | Aware of dedup but unsure of window | Not aware of dedup risk |
| Data flow clarity | Can sketch the full pipeline from SFCC to GA4 | Describes it verbally but misses a step | Cannot articulate the flow |

---

## Part 3: Debugging & Data Validation -- Answer Key

### Expected Debugging Walkthrough

**Step 1: Open Chrome DevTools Console**

```javascript
// inspect the current state of the dataLayer
console.table(window.dataLayer);

// filter for purchase events only
window.dataLayer.filter(e => e.event === "purchase");

// check if ecommerce object has stale data
window.dataLayer.filter(e => e.ecommerce).forEach(e => console.log(JSON.stringify(e.ecommerce, null, 2)));
```

**Step 2: Open GTM Preview / Debug Mode**

- Navigate to `https://tagmanager.google.com`, open the container, click "Preview"
- Load the site in the connected tab
- In the GTM Debug panel:
  - Click on the `purchase` event in the left sidebar
  - Inspect the "Data Layer" tab to see the exact payload GTM received
  - Check the "Tags" tab to verify the GA4 tag fired and see what it sent
  - Click on the "Variables" tab to verify variable resolution (e.g., `{{DLV - ecommerce.value}}`)

**Step 3: Network Tab**

- Filter by `google-analytics.com/g/collect` or `analytics.google.com`
- Inspect the request payload for the `purchase` event
- Look for `ep.transaction_id`, `epn.value` (the `n` prefix means numeric -- if it says `ep.value` the value was sent as a string)
- Verify `epn.value` is not `0` or `NaN`

**Step 4: Root Cause -- Coupon Bleeding**

GTM's `dataLayer` is a **merge-based** persistence layer. Once `coupon: "SUMMER20"` is pushed, it remains in the merged data model until explicitly overwritten or cleared.

Fix: Push `{ ecommerce: null }` before every new ecommerce event.

**Step 5: Root Cause -- $0.00 Revenue**

The `value` field is sent as the string `"$149.97"`. GA4 cannot parse strings with currency symbols. It defaults to `0`.

Fix: Strip the `$` sign and convert to a float: `parseFloat(order.total.replace("$", ""))`.

### Keywords to Listen For

| Keyword / Concept | Significance |
|-------------------|-------------|
| `ecommerce: null` | The single most important fix for data bleeding |
| `dataLayer` is merge-based / persistent | Shows understanding of GTM's internal data model |
| `epn.` vs `ep.` prefix in Network tab | Shows they know how to verify numeric vs string typing at the protocol level |
| GA4 DebugView | Real-time event inspection directly in GA4 admin |
| Tag sequencing / firing order | Awareness that tag execution order matters |
| `console.table(dataLayer)` | Practical debugging fluency |

### Scoring Checklist -- Part 3

| Criterion | Strong (3) | Acceptable (2) | Weak (1) |
|-----------|-----------|----------------|----------|
| Console inspection method | Uses `console.table`, filters dataLayer, inspects ecommerce objects | Uses `console.log` on the full dataLayer | Does not know how to inspect dataLayer |
| GTM Preview Mode usage | Navigates Debug panel fluently, checks Data Layer + Tags + Variables tabs | Knows it exists but vague on workflow | Has not used it |
| Network tab analysis | Filters for GA collect calls, checks `epn.` vs `ep.` prefixes | Checks Network tab but does not know what to look for | Does not use Network tab |
| Identifies coupon bleeding root cause | Explains merge-based persistence, prescribes `ecommerce: null` | Identifies the symptom but unsure of mechanism | Cannot identify root cause |
| Identifies $0 revenue root cause | Points to string type, shows the `$` symbol issue | Mentions "maybe a type issue" but cannot pinpoint | Cannot identify root cause |

---

## Part 4: Cross-Functional Collaboration -- Answer Key

### Expected SDR Table

| User Action | dataLayer Event | Field | Type | Sample Value | Data Source |
|-------------|----------------|-------|------|-------------|-------------|
| User clicks "Complete Order" | `purchase` | `ecommerce.transaction_id` | string | `"ORD-20260507-1842"` | SFCC Order API response |
| | | `ecommerce.value` | number | `149.97` | SFCC Order API (parsed, no `$`) |
| | | `ecommerce.currency` | string | `"USD"` | SFCC storefront config |
| | | `ecommerce.coupon` | string \| undefined | `"SUMMER20"` | SFCC basket / promo engine |
| | | `ecommerce.items[].item_id` | string | `"NKE-AF1-WHT-10"` | SFCC product catalog (SKU) |
| | | `ecommerce.items[].item_name` | string | `"Nike Air Force 1 '07"` | SFCC product catalog |
| | | `ecommerce.items[].price` | number | `99.99` | SFCC price book (parsed) |
| | | `ecommerce.items[].quantity` | number | `1` | SFCC basket |
| | | `ecommerce.items[].discount` | number | `20.00` | SFCC promo engine (parsed) |
| | | `ecommerce.items[].item_category` | string | `"Shoes"` | SFCC catalog categories |
| | | `ecommerce.items[].item_category2` | string | `"Sneakers"` | SFCC catalog categories |

**For SFCC developers, the SDR should clarify:**
- Order data must be available in the front-end **before** the confirmation page renders (e.g., via API response or Next.js `getServerSideProps`)
- Price values must be raw numbers -- no currency symbols, no formatting
- Category hierarchy should be provided as an array or separate fields, not a `>` delimited string

### Expected QA Acceptance Criteria

1. **Single Fire**: When a tester clicks "Complete Order" once, exactly **one** `purchase` event appears in GTM Preview Mode's event timeline. Rapidly double-clicking the button must **not** produce a second event.

2. **Clean Coupon Data**: After completing Order A with coupon `SUMMER20`, navigate to a new order B with no coupon. In GTM Preview Mode, the `purchase` event for Order B must show `coupon: undefined` (or the field must be absent). The `coupon` field must **never** carry over from a previous order.

3. **Correct Revenue**: In GA4 DebugView, the `purchase` event's `value` parameter must match the actual order total as a number (e.g., `149.97`, not `"$149.97"`, not `0`). Verify by checking that the parameter key in the Network tab uses the `epn.` prefix (numeric), not `ep.` (string).

### Scoring Checklist -- Part 4

| Criterion | Strong (3) | Acceptable (2) | Weak (1) |
|-----------|-----------|----------------|----------|
| SDR quality | Complete table with types, sample values, data sources | Partial table, missing some fields or sources | Vague list, no structure |
| SFCC developer guidance | Specifies when/how data should be exposed (API response, SSR props) | Mentions data needs to be available but no specifics | No guidance for backend team |
| QA criteria clarity | Pass/fail statements a non-technical tester can execute | Criteria exist but require technical interpretation | No criteria or too vague |
| Communication style | Clear, structured, empathetic to non-analytics audiences | Functional but overly technical | Confusing or dismissive |

---

## Overall Scoring

### Per-Pillar Score (1-3 scale, averaged from criteria above)

| Pillar | Score (1-3) | Weight | Weighted |
|--------|------------|--------|----------|
| P1: JS & SPA Data Layer | ___ | 25% | ___ |
| P2: GA4 E-Commerce Architecture | ___ | 25% | ___ |
| P3: Debugging & Validation | ___ | 25% | ___ |
| P4: Collaboration & Documentation | ___ | 25% | ___ |
| **Total** | | | **___/3.0** |

### Hiring Recommendation

| Score Range | Recommendation |
|-------------|---------------|
| 2.5 - 3.0 | **Strong Hire** -- Can operate independently from day one |
| 2.0 - 2.4 | **Hire** -- Solid fundamentals, may need ramp-up on some areas |
| 1.5 - 1.9 | **Weak Hire / No Hire** -- Significant gaps, discuss with team |
| 1.0 - 1.4 | **No Hire** -- Missing core competencies |

---

## Red Flags to Watch For

| Red Flag | Why It Matters |
|----------|---------------|
| Uses `useEffect` to fire purchase events on page load | Fundamental misunderstanding of when purchase tracking should fire |
| Does not know `ecommerce: null` | Will ship data bleeding bugs to production |
| Suggests tracking renewals client-side (e.g., "redirect user to a hidden page") | Does not understand server-side analytics |
| Cannot explain the difference between `ep.` and `epn.` in GA4 collect calls | Cannot debug type issues at the protocol level |
| Writes QA criteria like "check that tracking works" | Cannot collaborate effectively with non-technical teams |
| Uses `parseInt` instead of `parseFloat` for prices | Will truncate decimal values ($99.99 becomes $99) |
| Reuses the same `transaction_id` for subscription renewals | Will cause GA4 to deduplicate and drop renewal revenue |
| Does not mention `client_id` in Measurement Protocol discussion | Payload will be rejected by GA4 MP endpoint |

---

## Bonus Points (Not Required, But Impressive)

- Mentions **consent mode** and checking consent state before firing tags
- Suggests **event validation** in GA4 Measurement Protocol (using the `/debug/mp/collect` endpoint)
- Proposes a **shared TypeScript interface** between front-end and SFCC for the ecommerce payload
- Mentions **data contracts** or schema validation (e.g., Zod, JSON Schema) for the dataLayer
- Brings up **testing the dataLayer** with unit tests (e.g., asserting the shape of the pushed object)
- Mentions **BigQuery export** for raw event analysis beyond GA4's UI
