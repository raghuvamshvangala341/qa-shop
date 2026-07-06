const express = require('express');
const { readDB, writeDB, genId } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateProduct } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth, requireAdmin);

const VALID_STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
const VALID_TRANSITIONS = {
  Pending: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: []
};

router.get('/products', (req, res) => {
  const db = readDB();
  res.json({ success: true, products: db.products });
});

router.post('/products', (req, res) => {
  const errors = validateProduct(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  const db = readDB();
  const product = {
    id: genId('prod'),
    sku: genId('sku').toUpperCase(),
    name: req.body.name.trim(),
    description: (req.body.description || '').trim(),
    category: req.body.category.trim(),
    price: Math.round(Number(req.body.price) * 100) / 100,
    stock: Number(req.body.stock),
    image: req.body.image || '📦'
  };
  db.products.push(product);
  writeDB(db);
  res.status(201).json({ success: true, product });
});

router.put('/products/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const errors = validateProduct({ ...product, ...req.body });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  product.name = req.body.name.trim();
  product.description = (req.body.description || '').trim();
  product.category = req.body.category.trim();
  product.price = Math.round(Number(req.body.price) * 100) / 100;
  product.stock = Number(req.body.stock);
  if (req.body.image) product.image = req.body.image;

  writeDB(db);
  res.json({ success: true, product });
});

router.delete('/products/:id', (req, res) => {
  const db = readDB();
  const before = db.products.length;
  db.products = db.products.filter(p => p.id !== req.params.id);
  if (db.products.length === before) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  writeDB(db);
  res.json({ success: true });
});

router.get('/orders', (req, res) => {
  const db = readDB();
  const orders = [...db.orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(o => {
      const user = db.users.find(u => u.id === o.userId);
      return { ...o, username: user ? user.username : 'unknown' };
    });
  res.json({ success: true, orders });
});

router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(status)) {
    return res.status(409).json({
      success: false,
      error: `Cannot move order from ${order.status} to ${status}`
    });
  }

  if (status === 'Cancelled') {
    for (const item of order.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product) product.stock += item.quantity;
    }
  }

  order.status = status;
  writeDB(db);
  res.json({ success: true, order });
});

router.get('/users', (req, res) => {
  const db = readDB();
  const users = db.users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt }));
  res.json({ success: true, users });
});

module.exports = router;
