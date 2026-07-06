const express = require('express');
const { readDB } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = readDB();
  let items = [...db.products];

  const { q, category, sort, minPrice, maxPrice } = req.query;

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  }

  if (category && category.trim() && category !== 'all') {
    items = items.filter(p => p.category.toLowerCase() === category.trim().toLowerCase());
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    items = items.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    items = items.filter(p => p.price <= Number(maxPrice));
  }

  if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
  else if (sort === 'name_asc') items.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'stock_desc') items.sort((a, b) => b.stock - a.stock);

  const categories = [...new Set(db.products.map(p => p.category))].sort();

  res.json({ success: true, products: items, categories, count: items.length });
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product });
});

module.exports = router;
