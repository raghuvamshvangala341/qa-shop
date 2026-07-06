const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { seedIfEmpty } = require('./seed');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

seedIfEmpty();

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// Reset endpoint - lets anyone restore the shared catalog & wipe demo data
// back to a known state, which is useful before a test run or workshop.
app.post('/api/reset-demo-data', (req, res) => {
  const { readDB, writeDB, DB_PATH } = require('./db');
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  seedIfEmpty(true);
  res.json({ success: true, message: 'Demo data has been reset to its original seeded state.' });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`\nQA Shop is running:  http://localhost:${PORT}`);
  console.log(`API base:            http://localhost:${PORT}/api\n`);
});
