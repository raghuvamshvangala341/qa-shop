### TC_11
- **Scenario ID:** SC_11
- **Test Type:** Negative / Boundary
- **Severity:** High
- **Test Case Description:** Verify that login rejects usernames containing leading/trailing spaces or unexpected letter casing when those values do not match a registered account.
- **Test Steps:**
  1. Open the QA Shop login page.
  2. Enter username ` raghu ` and password `raghu@123`.
  3. Click **Log in** and observe the response.
  4. Repeat with username `RAGHU` and the same password.
  5. Verify that no authenticated session is created unless the application explicitly supports trimming or case-insensitive usernames.
- **Test Data:** Username values: ` raghu `, `RAGHU`; Password: `raghu@123`
- **Expected Result:** Login behavior should follow the application's documented username rules. Invalid variants must not silently authenticate as a different account; a clear error should be displayed.
- **Actual Result:**
- **AgentQA Validation Focus:** Exact text entry, handling of similar credential values, and verification of authenticated state rather than relying only on a click or URL change.

### TC_12
- **Scenario ID:** SC_12
- **Test Type:** Negative / Security
- **Severity:** High
- **Test Case Description:** Verify that the product search field safely handles special characters and injection-like input without exposing data or breaking the page.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123` and open **Shop**.
  2. Enter `' OR '1'='1` in the product search field.
  3. Click **Search** and inspect the displayed results.
  4. Repeat with `<script>alert(1)</script>` as the search term.
  5. Verify that no script executes, no unintended products/data appear, and the page remains usable.
- **Test Data:** Search strings: `' OR '1'='1`; `<script>alert(1)</script>`
- **Expected Result:** Search input must be treated as data, not executable code or a query instruction. No script should execute, no private data should be exposed, and no unrelated full catalogue should be returned because of the input.
- **Actual Result:**
- **AgentQA Validation Focus:** Special-character entry, safe assertion of results, and recognition of browser dialogs or unexpected page behavior.

### TC_13
- **Scenario ID:** SC_13
- **Test Type:** Negative / Boundary
- **Severity:** Medium
- **Test Case Description:** Verify that a search with whitespace-only input does not produce misleading or stale product results.
- **Test Steps:**
  1. Log in and open the **Shop** page.
  2. Enter only spaces in the product search field.
  3. Click **Search**.
  4. Observe the result list and any validation message.
  5. Verify that the application follows a consistent empty-search behavior and does not show stale results as matching results.
- **Test Data:** Search term: `     ` (five spaces)
- **Expected Result:** The application should trim/reject blank search input or deliberately show the default catalogue. It must not display misleading results or an application error.
- **Actual Result:**
- **AgentQA Validation Focus:** Whitespace-only input and distinguishing an intentional default catalogue from stale search results.

### TC_14
- **Scenario ID:** SC_14
- **Test Type:** Negative / Boundary
- **Severity:** High
- **Test Case Description:** Verify that combined search and category filters do not display products that violate either active condition.
- **Test Steps:**
  1. Log in and open **Shop**.
  2. Enter a search term that does not belong to the currently selected category.
  3. Select a category filter and apply the search.
  4. Inspect every displayed result and its category/name.
  5. Verify that conflicting filters produce a correct empty state rather than unrelated products.
- **Test Data:** Search term: `Aurora Running Shoes`; Category: `Electronics` (adjust only if the live catalogue differs)
- **Expected Result:** Results must satisfy the active search and category conditions together. If no product matches both, an empty state should be shown.
- **Actual Result:**
- **AgentQA Validation Focus:** Multiple controls with dependent state, filter persistence, and validating the actual result set rather than just the selected filter label.

### TC_15
- **Scenario ID:** SC_15
- **Test Type:** Negative / Boundary
- **Severity:** Medium
- **Test Case Description:** Verify that sorting controls handle an empty search result set without causing an error or restoring unrelated products.
- **Test Steps:**
  1. Log in and open **Shop**.
  2. Search for `NoSuchProduct987` and confirm that no products match.
  3. Change each available sort option one at a time.
  4. Observe the result area after each sort selection.
  5. Verify that the empty state remains stable and no unrelated products appear.
- **Test Data:** Search term: `NoSuchProduct987`; Sort options: each option available in the UI
- **Expected Result:** Sorting an empty result set should not crash the page, clear the search unexpectedly, or display unrelated products.
- **Actual Result:**
- **AgentQA Validation Focus:** Empty-state handling, dropdown/menu selection and assertions after a state transition.

### TC_16
- **Scenario ID:** SC_16
- **Test Type:** Negative / Boundary
- **Severity:** Critical
- **Test Case Description:** Verify that the cart rejects zero, negative, decimal and non-numeric product quantities.
- **Test Steps:**
  1. Log in and add an available product to the cart.
  2. Open **Cart** and locate the product quantity control.
  3. If quantity is editable, enter `0` and attempt to update the cart.
  4. Repeat with `-1`, `1.5` and `abc` where the control permits text entry.
  5. Verify the cart quantity, line total and subtotal after each attempt.
- **Test Data:** Quantity values: `0`, `-1`, `1.5`, `abc`
- **Expected Result:** The cart must reject invalid quantities or apply a clearly defined minimum/removal rule for zero. Negative, fractional (if only whole units are supported) and non-numeric quantities must never produce an invalid order total.
- **Actual Result:**
- **AgentQA Validation Focus:** Input type handling, boundary values, repeated updates and verifying calculated totals after rejected input.

### TC_17
- **Scenario ID:** SC_17
- **Test Type:** Negative / Boundary
- **Severity:** Critical
- **Test Case Description:** Verify that a customer cannot increase cart quantity beyond the available stock limit.
- **Test Steps:**
  1. Log in and identify a product with a known limited stock quantity.
  2. Add the product to the cart and open **Cart**.
  3. Increase the quantity to the stated stock limit.
  4. Attempt to increase the quantity once more.
  5. Verify that the excess quantity is rejected and totals remain consistent.
- **Test Data:** Product: An item with a visible/known stock limit; Quantity: stock limit and stock limit + 1
- **Expected Result:** Quantity must not exceed available stock. The application should show a clear stock/quantity message and must not calculate or accept an order for unavailable units.
- **Actual Result:**
- **AgentQA Validation Focus:** Boundary-value execution, dynamic stock messages and checking that the final cart state did not exceed the limit.

### TC_18
- **Scenario ID:** SC_18
- **Test Type:** Negative / Security
- **Severity:** Critical
- **Test Case Description:** Verify that a cart cannot be manipulated to submit an invalid product price or quantity through client-side changes.
- **Test Steps:**
  1. Log in and add an available product to the cart.
  2. Record the product name, displayed unit price and quantity.
  3. Using browser developer tools or an approved test proxy, attempt to alter the client-side displayed price or cart quantity before checkout.
  4. Continue only in the QA test environment and inspect the checkout/order total.
  5. Verify that the server rejects or recalculates manipulated values using trusted product and stock data.
- **Test Data:** Product: Any test product; Modified client-side price: `0.01`; Modified quantity: `999`
- **Expected Result:** Client-side changes must not allow a customer to purchase at an arbitrary price or exceed stock. The authoritative total must be recalculated or validated by the server. If the application is frontend-only and has no server-side cart, record this case as Not Applicable to backend enforcement.
- **Actual Result:**
- **AgentQA Validation Focus:** Do not accept a displayed value alone as proof. Verify the final server-side order/cart response and capture the relevant network evidence.

### TC_19
- **Scenario ID:** SC_19
- **Test Type:** Negative / Boundary
- **Severity:** Critical
- **Test Case Description:** Verify that an out-of-stock product cannot be added to the cart when availability changes after the product listing is loaded.
- **Test Steps:**
  1. Open **Shop** and locate a product with limited stock.
  2. Keep the product listing open while the stock is changed to zero in the approved test environment or by a second test session.
  3. Attempt to add the previously displayed product to the cart.
  4. Open **Cart** and inspect the item and quantity.
  5. Verify that the application blocks the stale add-to-cart action and displays an availability message.
- **Test Data:** Product: A limited-stock test product; Updated stock: `0`
- **Expected Result:** The application must revalidate stock at add-to-cart/checkout time. A stale product listing must not allow an unavailable item to be purchased.
- **Actual Result:**
- **AgentQA Validation Focus:** Stale UI state, asynchronous updates and verifying the final cart state after the page data becomes outdated.

### TC_20
- **Scenario ID:** SC_20
- **Test Type:** Negative / Security
- **Severity:** High
- **Test Case Description:** Verify that invalid, expired or whitespace-padded coupon codes are not applied and do not alter order totals.
- **Test Steps:**
  1. Log in, add a product to the cart and open **Cart**.
  2. Record the subtotal, discount, tax and total shown.
  3. Apply `INVALID999`, then try a whitespace-padded version of the same code.
  4. If the test environment provides an expired coupon, attempt to apply it.
  5. Verify that no unauthorized discount is applied and all totals remain mathematically consistent.
- **Test Data:** Coupon values: `INVALID999`, ` INVALID999 `; Expired coupon: use a known expired test code if available
- **Expected Result:** Invalid or expired coupons must be rejected. No discount should be applied, and subtotal, tax and total must remain correct. Do not assume an expired coupon exists; mark that variation Not Applicable if none is configured.
- **Actual Result:**
- **AgentQA Validation Focus:** Multiple attempts, whitespace handling, validation-message detection and independent verification of monetary values.

### TC_21
- **Scenario ID:** SC_21
- **Test Type:** Negative / Boundary
- **Severity:** Critical
- **Test Case Description:** Verify that checkout blocks malformed values in each required shipping field.
- **Test Steps:**
  1. Add a product to the cart and navigate to **Checkout**.
  2. Submit the form with all required fields blank.
  3. Enter invalid values one field at a time: numeric-only name, symbols-only city, malformed ZIP/postal code and an invalid country/state value where constrained.
  4. Attempt to place the order after each invalid variation.
  5. Verify field-level errors and confirm that no order is created.
- **Test Data:** Full Name: `123456`; City: `@@@`; ZIP/postal code: `ABCDE` (if numeric format is required); other required fields: blank/invalid
- **Expected Result:** Required and format-constrained fields must be validated. Invalid submissions must not create an order, and errors should identify the relevant field without clearing unrelated valid entries.
- **Actual Result:**
- **AgentQA Validation Focus:** Field-specific validation, dynamic error placement, form re-submission and confirming that no order record was created.

### TC_22
- **Scenario ID:** SC_22
- **Test Type:** Negative / Boundary
- **Severity:** High
- **Test Case Description:** Verify that checkout rejects overlong and special-character input in shipping name and address fields without layout or script issues.
- **Test Steps:**
  1. Add a product to the cart and open **Checkout**.
  2. Enter a very long string (for example, 500 characters) in the Full Name field.
  3. Enter `<script>alert(1)</script>` in the Address field.
  4. Attempt to place the order.
  5. Verify that input limits/validation are enforced and no script executes or malformed order is created.
- **Test Data:** Full Name: 500-character string; Address: `<script>alert(1)</script>`
- **Expected Result:** The application should safely validate or limit input length and encode special characters. No script should execute, the page layout should remain usable, and invalid data must not create an order.
- **Actual Result:**
- **AgentQA Validation Focus:** Long-text entry, special characters, scrolling to field errors and detecting unexpected dialogs or page rendering.

### TC_23
- **Scenario ID:** SC_23
- **Test Type:** Negative / Boundary
- **Severity:** Critical
- **Test Case Description:** Verify that rapid repeated clicks on **Place Order** do not create duplicate orders.
- **Test Steps:**
  1. Log in, add one product to the cart and complete checkout with valid test data.
  2. Click **Place Order** rapidly more than once or double-click it.
  3. Wait for the response and record the displayed order reference.
  4. Open order history and search for orders created at that time.
  5. Verify that only one order was created for the single checkout submission.
- **Test Data:** One cart; one checkout submission; rapid double-click on **Place Order**
- **Expected Result:** The application should prevent duplicate order creation through button state and/or server-side idempotency. Only one order should be recorded for the submission.
- **Actual Result:**
- **AgentQA Validation Focus:** Timing-sensitive interaction, waiting for asynchronous completion and verifying the persisted order count rather than only the confirmation screen.

### TC_24
- **Scenario ID:** SC_24
- **Test Type:** Negative / Boundary
- **Severity:** High
- **Test Case Description:** Verify that refreshing or navigating backward during checkout does not duplicate an order or corrupt the cart.
- **Test Steps:**
  1. Add a product to the cart and navigate to **Checkout**.
  2. Refresh the page before submitting the order.
  3. Verify the cart and checkout state.
  4. If an order is submitted in a separate controlled run, use browser Back and Refresh after confirmation.
  5. Verify that no duplicate order is created and the order/cart state remains consistent.
- **Test Data:** One test product; browser Refresh and Back actions
- **Expected Result:** Refresh/back navigation must not create duplicate orders or corrupt cart data. The application should display a safe, consistent state and request confirmation before any potentially repeated submission where appropriate.
- **Actual Result:**
- **AgentQA Validation Focus:** Browser navigation, page reloads, state persistence and avoiding false pass results from cached confirmation pages.

### TC_25
- **Scenario ID:** SC_25
- **Test Type:** Negative / Security
- **Severity:** Critical
- **Test Case Description:** Verify that an unauthenticated user cannot access cart, checkout or order pages by directly entering their URLs.
- **Test Steps:**
  1. Log out of QA Shop or open a fresh private browser session.
  2. Enter the direct Cart page URL.
  3. Enter the direct Checkout page URL.
  4. Enter the direct Orders page URL.
  5. Verify that protected pages redirect to login or show an access-denied state without exposing customer data.
- **Test Data:** Unauthenticated browser session; direct URLs for Cart, Checkout and Orders (use actual routes from the application)
- **Expected Result:** Protected pages and customer data must not be accessible without authentication. The application should redirect or deny access consistently.
- **Actual Result:**
- **AgentQA Validation Focus:** Direct URL navigation, authentication-state verification and checking page content for data leakage.

### TC_26
- **Scenario ID:** SC_26
- **Test Type:** Negative / Security
- **Severity:** Critical
- **Test Case Description:** Verify that a customer cannot view another customer's order by changing an order identifier in the URL or request.
- **Test Steps:**
  1. Log in with the test account and open **Orders**.
  2. Open an order belonging to the test account and record its URL/order identifier.
  3. In the approved test environment, change the identifier to a different known test order identifier belonging to another test account.
  4. Load the modified URL or request.
  5. Verify that the other customer's order details are denied and no personal/order data is exposed.
- **Test Data:** Test account: `raghu`; Order identifier: a second test account's order ID created for QA
- **Expected Result:** The application must enforce order ownership on the server. A user must not access another customer's order by changing an identifier. If the app has no multi-user/order-detail feature, mark this case Not Applicable.
- **Actual Result:**
- **AgentQA Validation Focus:** Authorization checks, URL parameter manipulation and verifying the response content—not just whether navigation succeeded.

---
