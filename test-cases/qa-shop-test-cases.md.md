# QA Shop – Test Cases

**Application:** QA Shop – E-commerce application  
**Test account:** Username: `raghu` | Password: `raghu@123`  
**Coverage:** Login, product search/filter/sort, cart, checkout, orders, invalid login, no-result search, stock validation, coupon validation, and checkout validation.

---

## Positive Test Cases

### TC_01 – Login with valid credentials

- **Scenario ID:** SC_01
- **Test Type:** Positive
- **Severity:** High
- **Test Case Description:** Verify that a registered customer can log in to the QA Shop application using valid credentials.
- **Test Steps:**
  1. Open the QA Shop application.
  2. Click **Log in**.
  3. Enter username `raghu` and password `raghu@123`.
  4. Click the **Log in** button.
  5. Verify that the customer is logged in and authenticated navigation options are displayed.
- **Test Data:** Username: `raghu`; Password: `raghu@123`
- **Expected Result:** The customer should log in successfully and the application should display the authenticated view.
- **Actual Result:**

### TC_02 – Search, filter, and sort products

- **Scenario ID:** SC_02
- **Test Type:** Positive
- **Severity:** High
- **Test Case Description:** Verify that a customer can search for products, filter them by category, and sort the product list.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123` and open the **Shop** page.
  2. Search for `Aurora Running Shoes` and verify the matching product is displayed.
  3. Clear the search and select the **Electronics** category filter.
  4. Verify that only products from the selected category are displayed.
  5. Select the available price and name sorting options and verify that the product list follows the selected order.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; Search term: `Aurora Running Shoes`; Category: `Electronics`; Sorting: available price/name options.
- **Expected Result:** Search results should match the search term, category filtering should show only relevant products, and sorting should arrange products in the selected order.
- **Actual Result:**

### TC_03 – Add products to cart and update quantity

- **Scenario ID:** SC_03
- **Test Type:** Positive
- **Severity:** High
- **Test Case Description:** Verify that a customer can add available products to the cart, update quantities, and remove products.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123` and open the **Shop** page.
  2. Add an available product to the cart and verify that the cart count is updated.
  3. Add another available product and open the **Cart** page.
  4. Increase and decrease the quantity of one product and verify that the quantity and total are updated.
  5. Remove a product and verify that it is no longer displayed in the cart.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; Any two products currently marked as available.
- **Expected Result:** Products should be added and removed successfully. Cart count, quantities, and displayed totals should update correctly.
- **Actual Result:**

### TC_04 – Complete checkout and place an order

- **Scenario ID:** SC_04
- **Test Type:** Positive
- **Severity:** Critical
- **Test Case Description:** Verify that a logged-in customer can place an order by entering valid shipping and accepted test payment details.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123` and add an available product to the cart.
  2. Open the **Cart** page and click **Proceed to checkout**.
  3. Enter valid values in all required shipping fields.
  4. Enter payment details accepted by the application's test environment.
  5. Click **Place order** and verify that the order confirmation is displayed.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; Valid test shipping details; payment test data accepted by the application.
- **Expected Result:** The order should be placed successfully, a unique order reference should be generated, and the confirmation should display the order details and total amount.
- **Actual Result:**

### TC_05 – View order history and order details

- **Scenario ID:** SC_05
- **Test Type:** Positive
- **Severity:** High
- **Test Case Description:** Verify that a customer can view a successfully placed order in order history and open its details.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123`.
  2. Place an order successfully or use an existing order belonging to this account.
  3. Open **Orders** or **View my orders**.
  4. Verify that the order is listed with its order ID, date, status, and total.
  5. Open the order details and verify that the displayed items and amounts match the placed order.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; An order placed using this account.
- **Expected Result:** The customer's order should appear in order history, and its details should match the information shown during order confirmation.
- **Actual Result:**

---

## Negative Test Cases

### TC_06 – Login with invalid or blank credentials

- **Scenario ID:** SC_06
- **Test Type:** Negative
- **Severity:** Critical
- **Test Case Description:** Verify that the application rejects incorrect credentials and does not allow login when required credentials are missing.
- **Test Steps:**
  1. Open the QA Shop application and click **Log in**.
  2. Enter username `invaliduser` and password `Wrong123`, then click **Log in**.
  3. Verify that an error or validation message is displayed and the user remains logged out.
  4. Clear both fields and click **Log in** without entering credentials.
  5. Verify that the application does not allow login and indicates the required fields.
- **Test Data:** Invalid username: `invaliduser`; Invalid password: `Wrong123`; Blank username and password.
- **Expected Result:** The application should reject invalid or missing credentials, display an appropriate error or validation message, and keep the user unauthenticated.
- **Actual Result:**

### TC_07 – Search for a product that does not exist

- **Scenario ID:** SC_07
- **Test Type:** Negative
- **Severity:** Medium
- **Test Case Description:** Verify that the application handles a search with no matching products without displaying unrelated results or an application error.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123` and open the **Shop** page.
  2. Enter `NoSuchProduct987` in the search field.
  3. Click **Search**.
  4. Verify that a no-results message or empty result state is displayed.
  5. Verify that the page remains usable and no unrelated products are shown as matches.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; Search term: `NoSuchProduct987`.
- **Expected Result:** The application should show an appropriate no-results message or empty state. It should not display unrelated search results or crash.
- **Actual Result:**

### TC_08 – Attempt to add an out-of-stock product or exceed stock quantity

- **Scenario ID:** SC_08
- **Test Type:** Negative
- **Severity:** Critical
- **Test Case Description:** Verify that the application prevents customers from adding out-of-stock products or selecting a quantity greater than the available stock.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123` and open the **Shop** page.
  2. Locate a product marked **Out of stock** or **Sold out**.
  3. Verify that the product cannot be added to the cart.
  4. Add a product with limited available stock to the cart and open the **Cart** page.
  5. Try to increase its quantity beyond the available stock and verify that the application prevents the update.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; One currently out-of-stock product and one product with limited stock, if available.
- **Expected Result:** The application should not add an out-of-stock product or allow a cart quantity greater than available stock. An appropriate validation message or disabled action should be displayed.
- **Actual Result:**

### TC_09 – Apply an invalid or blank coupon code

- **Scenario ID:** SC_09
- **Test Type:** Negative
- **Severity:** High
- **Test Case Description:** Verify that the application rejects an invalid or blank coupon code and does not apply an unauthorised discount.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123` and add an available product to the cart.
  2. Open the **Cart** page and note the displayed total.
  3. Enter coupon code `INVALID999` and click **Apply**.
  4. Verify that the application displays an invalid-coupon message and does not apply a discount.
  5. Clear the coupon field, submit it blank, and verify that the cart total remains correct.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; Invalid coupon: `INVALID999`; Blank coupon value.
- **Expected Result:** The application should reject the invalid or blank coupon, should not apply a discount, and should retain the correct cart items and total.
- **Actual Result:**

### TC_10 – Checkout with missing or invalid details

- **Scenario ID:** SC_10
- **Test Type:** Negative
- **Severity:** Critical
- **Test Case Description:** Verify that the application prevents order placement when required shipping or payment details are missing or invalid.
- **Test Steps:**
  1. Log in using `raghu` / `raghu@123`, add an available product to the cart, and proceed to checkout.
  2. Leave the required shipping and payment fields blank, then attempt to place the order.
  3. Verify that the application displays validation messages and does not place the order.
  4. Enter invalid data in a required field, such as an invalid postal code or incomplete payment value, and try again.
  5. Verify that the order is not created and the cart contents remain available.
- **Test Data:** Username: `raghu`; Password: `raghu@123`; Blank required fields; Invalid postal code: `ABCDE`; Incomplete payment value: `1234`.
- **Expected Result:** The application should validate required shipping and payment fields, prevent order placement, display appropriate validation messages, and retain the cart contents. No order confirmation or order ID should be generated.
- **Actual Result:**

---

## Test Case Summary

| Test Case ID | Scenario | Test Type | Severity |
|---|---|---|---|
| TC_01 | Login with valid credentials | Positive | High |
| TC_02 | Search, filter, and sort products | Positive | High |
| TC_03 | Add products to cart and update quantity | Positive | High |
| TC_04 | Complete checkout and place an order | Positive | Critical |
| TC_05 | View order history and order details | Positive | High |
| TC_06 | Login with invalid or blank credentials | Negative | Critical |
| TC_07 | Search for a product that does not exist | Negative | Medium |
| TC_08 | Attempt to add an out-of-stock product or exceed stock quantity | Negative | Critical |
| TC_09 | Apply an invalid or blank coupon code | Negative | High |
| TC_10 | Checkout with missing or invalid details | Negative | Critical |
