const express = require('express');
const { readDB, writeDB } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const TAX_RATE = 0.08;

function getCart(db, userId) {
  if (!db.carts[userId]) db.carts[userId] = { items: [], coupon: null };
  if (Array.isArray(db.carts[userId])) db.carts[userId] = { items: db.carts[userId], coupon: null };
  return db.carts[userId];
}

function buildCartResponse(db, cart) {
  const items = cart.items.map(item => {
    const product = db.products.find(p => p.id === item.productId);
    if (!product) return null;
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: item.quantity,
      stock: product.stock,
      lineTotal: Math.round(product.price * item.quantity * 100) / 100
    };
  }).filter(Boolean);

  const subtotal = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;

  let discount = 0;
  let couponError = null;
  if (cart.coupon) {
    const coupon = db.coupons.find(c => c.code === cart.coupon);
    if (!coupon || !coupon.active) {
      couponError = 'Applied coupon is no longer valid';
    } else if (coupon.type === 'percent') {
      discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100;
    } else {
      discount = Math.min(coupon.value, subtotal);
    }
  }

  const taxable = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  return {
    items,
    subtotal,
    coupon: cart.coupon,
    discount,
    couponError,
    tax,
    total,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0)
  };
}

router.get('/', requireAuth, (req, res) => {
  const db = readDB();
  const cart = getCart(db, req.user.id);
  writeDB(db);
  res.json({ success: true, cart: buildCartResponse(db, cart) });
});

router.post('/items', requireAuth, (req, res) => {
  const { productId, quantity } = req.body || {};
  const qty = Number(quantity);

  if (!productId) return res.status(400).json({ success: false, error: 'productId is required' });
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ success: false, error: 'Quantity must be a whole number of at least 1' });
  }

  const db = readDB();
  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const cart = getCart(db, req.user.id);
  const existing = cart.items.find(i => i.productId === productId);
  const currentQty = existing ? existing.quantity : 0;
  const newQty = currentQty + qty;

  if (product.stock <= 0) {
    return res.status(409).json({ success: false, error: `${product.name} is out of stock` });
  }
  if (newQty > product.stock) {
    return res.status(409).json({
      success: false,
      error: `Only ${product.stock} unit(s) of ${product.name} available. You already have ${currentQty} in your cart.`
    });
  }

  if (existing) existing.quantity = newQty;
  else cart.items.push({ productId, quantity: qty });

  writeDB(db);
  res.status(201).json({ success: true, cart: buildCartResponse(db, cart) });
});

router.put('/items/:productId', requireAuth, (req, res) => {
  const { quantity } = req.body || {};
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ success: false, error: 'Quantity must be a whole number of at least 1' });
  }

  const db = readDB();
  const product = db.products.find(p => p.id === req.params.productId);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const cart = getCart(db, req.user.id);
  const item = cart.items.find(i => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ success: false, error: 'Item not in cart' });

  if (qty > product.stock) {
    return res.status(409).json({ success: false, error: `Only ${product.stock} unit(s) of ${product.name} available` });
  }

  item.quantity = qty;
  writeDB(db);
  res.json({ success: true, cart: buildCartResponse(db, cart) });
});

router.delete('/items/:productId', requireAuth, (req, res) => {
  const db = readDB();
  const cart = getCart(db, req.user.id);
  const before = cart.items.length;
  cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  if (cart.items.length === before) {
    return res.status(404).json({ success: false, error: 'Item not in cart' });
  }
  writeDB(db);
  res.json({ success: true, cart: buildCartResponse(db, cart) });
});

router.delete('/', requireAuth, (req, res) => {
  const db = readDB();
  const cart = getCart(db, req.user.id);
  cart.items = [];
  cart.coupon = null;
  writeDB(db);
  res.json({ success: true, cart: buildCartResponse(db, cart) });
});

router.post('/coupon', requireAuth, (req, res) => {
  const { code } = req.body || {};
  if (!code || !code.trim()) {
    return res.status(400).json({ success: false, error: 'Enter a coupon code' });
  }
  const db = readDB();
  const coupon = db.coupons.find(c => c.code.toLowerCase() === code.trim().toLowerCase());

  if (!coupon) {
    return res.status(404).json({ success: false, error: 'Invalid coupon code' });
  }
  if (!coupon.active) {
    return res.status(410).json({ success: false, error: 'This coupon has expired' });
  }

  const cart = getCart(db, req.user.id);
  if (cart.items.length === 0) {
    return res.status(409).json({ success: false, error: 'Add items to your cart before applying a coupon' });
  }
  cart.coupon = coupon.code;
  writeDB(db);
  res.json({ success: true, cart: buildCartResponse(db, cart) });
});

router.delete('/coupon', requireAuth, (req, res) => {
  const db = readDB();
  const cart = getCart(db, req.user.id);
  cart.coupon = null;
  writeDB(db);
  res.json({ success: true, cart: buildCartResponse(db, cart) });
});

module.exports = router;
module.exports.buildCartResponse = buildCartResponse;
module.exports.getCart = getCart;
