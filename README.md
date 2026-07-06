# QA Shop — a practice e‑commerce site for automation testing

A small, self-hosted mock online store built specifically for practicing UI and API test
automation (Selenium, Playwright, Cypress, WebdriverIO, REST-assured, Postman, etc.).
It has real client/server validation, several multi-step flows, and stable
`data-testid` attributes on every interactive element.

Runs as a normal Node.js web app — host it once (a laptop, a small VM, Render/Railway/Fly.io,
etc.) and share the URL with your whole cohort. Everyone sees the same product catalog;
each person's account, cart, and orders are private to them.

## 1. Setup

Requirements: Node.js 18+ (no database to install — data is stored in a local JSON file).

```bash
cd qa-shop
npm install
npm start
```

The site runs at **http://localhost:4000** (set `PORT=xxxx` to change it).
On first run it auto-seeds the product catalog and two demo accounts.

To wipe all accounts/orders/carts created during testing and restore the original
seeded catalog, either delete `data/db.json` and restart, or call:

```
POST /api/reset-demo-data
```

## 2. Demo accounts

| Role     | Username   | Password    |
|----------|------------|-------------|
| Customer | `testuser` | `Test1234`  |
| Admin    | `admin`    | `Admin123`  |

Anyone can also register a brand-new account from the site itself.

## 3. What's in it

- **Catalog** — browse, search, filter by category, sort by price/name/stock. Includes
  products that are out of stock, at 1 unit, and at low stock (≤3) on purpose.
- **Auth** — register and login with field-level validation, duplicate username/email
  detection, and a login lockout after 5 failed attempts (60s).
- **Cart** — add/update/remove items, quantity limited to available stock, coupon codes
  (valid, invalid, and expired examples included).
- **Checkout** — shipping address + payment form validation, a live re-check of stock at
  order time, and an order confirmation page.
- **Order history** — view past orders, expand details, cancel orders (only while `Pending`).
- **Admin panel** — product CRUD with validation, order status workflow
  (`Pending → Shipped → Delivered`, or `Pending → Cancelled`), and a read-only user list.
  Only reachable by the `admin` account (role-based access control, 403 for anyone else).

Every button, input, and message has a `data-testid` attribute. Click the **`#ids`** toggle
in the header to visually reveal every testid on the current page — handy while writing
selectors.

## 4. Coupon codes (for cart testing)

| Code       | Effect                          |
|------------|----------------------------------|
| `SAVE10`   | 10% off subtotal                |
| `FLAT5`    | $5 off subtotal                 |
| `EXPIRED5` | Always rejected — "has expired" |
| anything else | Rejected — "Invalid coupon code" |

## 5. Test card numbers (checkout — no real payments happen)

Any 16-digit number passes card-format validation, e.g. `4111111111111111`.
Use an expiry in the past (e.g. `01/20`) to trigger the "card has expired" error,
and a future one (e.g. `12/29`) to succeed.

## 6. A starter test-scenario catalog

**Registration**
- Empty form submit → all required-field errors shown
- Username < 3 chars / with symbols → rejected
- Password < 8 chars, or missing a number → rejected
- Confirm password mismatch → rejected
- Terms checkbox unchecked → rejected
- Duplicate username or email → rejected
- Valid data → account created and auto-logged-in

**Login**
- Wrong password 5x in a row → account locks for 60s, 6th attempt shows lockout message
- Unknown username → "Invalid username or password" (doesn't reveal which field was wrong)
- Valid login → redirected to the page you came from (`next` param)

**Catalog**
- Search with no matches → empty-state message
- Filter by category → result count updates
- Out-of-stock product → "Add to cart" is disabled, badge reads "Out of stock"
- Product with 1 unit left → "Only 1 left" badge, quantity capped at 1

**Cart**
- Add more than available stock → 409 error with the exact remaining count
- Reduce quantity to 0 or type an invalid value → item is removed
- Apply `SAVE10` → discount line appears, total recalculates
- Apply `EXPIRED5` → rejected with an "expired" message
- Empty cart → checkout button disabled, "cart is empty" messaging

**Checkout**
- Submit with missing/invalid shipping or payment fields → per-field errors, none silently pass
- Expired card date → rejected
- Successful order → redirected to confirmation page with an order ID and totals

**Order history**
- Cancel a `Pending` order → stock is restored, status becomes `Cancelled`
- Try to cancel a non-Pending order → no cancel button is shown at all (state-dependent UI)

**Admin**
- Log in as `testuser` and open `/admin.html` → "Access denied" (role check)
- Log in as `admin` → create a product with price ≤ 0 or non-integer stock → rejected
- Move an order `Pending → Delivered` directly (skipping `Shipped`) via the API → 409 rejected,
  since the UI only ever offers valid next statuses

## 7. API reference (for API-level test practice)

Base URL: `http://localhost:4000/api`. Authenticated requests need
`Authorization: Bearer <token>` (token returned by register/login).

| Method | Path                          | Auth   | Purpose                          |
|--------|-------------------------------|--------|-----------------------------------|
| POST   | /auth/register                | —      | Create account                    |
| POST   | /auth/login                   | —      | Log in                            |
| GET    | /auth/me                      | user   | Current user                      |
| GET    | /products                     | —      | List/search/filter/sort products  |
| GET    | /products/:id                 | —      | Product detail                    |
| GET    | /cart                         | user   | View cart with computed totals    |
| POST   | /cart/items                   | user   | Add item `{ productId, quantity }`|
| PUT    | /cart/items/:productId        | user   | Update quantity                   |
| DELETE | /cart/items/:productId        | user   | Remove item                       |
| DELETE | /cart                         | user   | Clear cart                        |
| POST   | /cart/coupon                  | user   | Apply coupon `{ code }`           |
| DELETE | /cart/coupon                  | user   | Remove coupon                     |
| POST   | /orders                       | user   | Checkout `{ shipping, payment }`  |
| GET    | /orders                       | user   | Your order history                |
| GET    | /orders/:id                   | user   | Order detail                      |
| POST   | /orders/:id/cancel            | user   | Cancel a Pending order             |
| GET    | /admin/products                | admin  | All products                     |
| POST   | /admin/products                | admin  | Create product                   |
| PUT    | /admin/products/:id             | admin  | Update product                   |
| DELETE | /admin/products/:id             | admin  | Delete product                   |
| GET    | /admin/orders                   | admin  | All orders, any user             |
| PUT    | /admin/orders/:id/status         | admin  | Change order status              |
| GET    | /admin/users                     | admin  | List users                       |
| POST   | /reset-demo-data                 | —      | Wipe & reseed sample data        |

All error responses use `{ success: false, error: "..." }` or, for field-level
validation, `{ success: false, errors: { fieldName: "message" } }` — convenient for
asserting on specific messages rather than just status codes.

## 8. Notes for hosting it for a group

- It's a single Node process with no external database — deploy it anywhere that runs
  Node (a shared internal server, Render, Railway, Fly.io, an EC2 box, etc.) and give the
  cohort the URL.
- Data lives in `data/db.json` on that machine. Everyone shares the same product catalog;
  each person's cart/orders are scoped to their own account, so candidates won't collide.
- This app has no real payment processing, doesn't send real email, and is meant purely as
  a practice target — don't put real personal or payment data into it.
