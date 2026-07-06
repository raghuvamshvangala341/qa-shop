const express = require('express');
const { readDB, writeDB, genId } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateAddress, validatePayment } = require('../utils/validators');
const { buildCartResponse, getCart } = require('./cart');

const router = express.Router();

router.post('/', requireAuth, (req, res) => {
  const db = readDB();
  const cart = getCart(db, req.user.id);

  if (!cart.items.length) {
    return res.status(400).json({ success: false, error: 'Your cart is empty. Add items before checking out.' });
  }

  const { shipping, payment } = req.body || {};
  const shippingErrors = validateAddress(shipping);
  const paymentErrors = validatePayment(payment);
  const errors = { ...shippingErrors, ...paymentErrors };

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Re-check stock at time of order in case it changed since it was added to the cart
  const stockIssues = [];
  for (const item of cart.items) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product) {
      stockIssues.push('An item in your cart no longer exists');
      continue;
    }
    if (item.quantity > product.stock) {
      stockIssues.push(`${product.name}: only ${product.stock} left in stock (you have ${item.quantity} in cart)`);
    }
  }
  if (stockIssues.length > 0) {
    return res.status(409).json({ success: false, error: 'Some items changed availability', details: stockIssues });
  }

  const cartSummary = buildCartResponse(db, cart);

  // Deduct stock
  for (const item of cart.items) {
    const product = db.products.find(p => p.id === item.productId);
    product.stock -= item.quantity;
  }

  const cardDigits = payment.cardNumber.replace(/\s+/g, '');
  const order = {
    id: genId('order'),
    userId: req.user.id,
    items: cartSummary.items,
    subtotal: cartSummary.subtotal,
    coupon: cartSummary.coupon,
    discount: cartSummary.discount,
    tax: cartSummary.tax,
    total: cartSummary.total,
    shipping: {
      fullName: shipping.fullName.trim(),
      addressLine: shipping.addressLine.trim(),
      city: shipping.city.trim(),
      state: shipping.state.trim(),
      zip: shipping.zip.trim(),
      country: shipping.country.trim()
    },
    payment: { last4: cardDigits.slice(-4) },
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  cart.items = [];
  cart.coupon = null;
  writeDB(db);

  res.status(201).json({ success: true, order });
});

router.get('/', requireAuth, (req, res) => {
  const db = readDB();
  const orders = db.orders
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, orders });
});

router.get('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, order });
});

router.post('/:id/cancel', requireAuth, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  if (order.status !== 'Pending') {
    return res.status(409).json({ success: false, error: `Order cannot be cancelled once it is ${order.status}` });
  }

  order.status = 'Cancelled';
  for (const item of order.items) {
    const product = db.products.find(p => p.id === item.productId);
    if (product) product.stock += item.quantity;
  }
  writeDB(db);
  res.json({ success: true, order });
});

module.exports = router;
