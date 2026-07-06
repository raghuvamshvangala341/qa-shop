const bcrypt = require('bcryptjs');
const { readDB, writeDB, genId } = require('./db');

const PRODUCTS = [
  { name: 'Aria Wireless Headphones', category: 'Electronics', price: 79.99, stock: 24, description: 'Over-ear headphones with 30-hour battery life and active noise cancellation.', image: '🎧' },
  { name: 'Pulse Smartwatch', category: 'Electronics', price: 149.0, stock: 8, description: 'Fitness tracking smartwatch with heart-rate monitor and 5-day battery.', image: '⌚' },
  { name: 'Nimbus Bluetooth Speaker', category: 'Electronics', price: 45.5, stock: 0, description: 'Portable speaker with 360-degree sound, currently out of stock.', image: '🔊' },
  { name: 'Flux Mechanical Keyboard', category: 'Electronics', price: 89.99, stock: 15, description: 'Hot-swappable mechanical keyboard with RGB backlighting.', image: '⌨️' },
  { name: 'Orbit Wireless Mouse', category: 'Electronics', price: 24.99, stock: 60, description: 'Ergonomic wireless mouse with adjustable DPI.', image: '🖱️' },
  { name: 'Classic Denim Jacket', category: 'Apparel', price: 59.99, stock: 12, description: 'Unisex denim jacket, mid-wash, relaxed fit.', image: '🧥' },
  { name: 'Everyday Cotton Tee', category: 'Apparel', price: 14.99, stock: 200, description: 'Soft, breathable cotton t-shirt available in multiple colors.', image: '👕' },
  { name: 'Trailhead Hiking Boots', category: 'Apparel', price: 110.0, stock: 5, description: 'Waterproof hiking boots with reinforced ankle support.', image: '🥾' },
  { name: 'Aurora Running Shoes', category: 'Apparel', price: 74.5, stock: 1, description: 'Lightweight running shoes, only one pair left in stock.', image: '👟' },
  { name: 'The Quiet Algorithm', category: 'Books', price: 18.99, stock: 30, description: 'A novel about a programmer who discovers a pattern no one else can see.', image: '📘' },
  { name: 'Practical Test Automation', category: 'Books', price: 32.0, stock: 22, description: 'A hands-on guide to building reliable automated test suites.', image: '📗' },
  { name: 'Atlas of Small Kitchens', category: 'Books', price: 21.5, stock: 0, description: 'Recipes and layouts for cooking in compact spaces. Out of stock.', image: '📙' },
  { name: 'Solstice Ceramic Mug Set', category: 'Home & Kitchen', price: 27.99, stock: 40, description: 'Set of 4 hand-glazed ceramic mugs.', image: '☕' },
  { name: 'Drift Standing Desk', category: 'Home & Kitchen', price: 249.0, stock: 3, description: 'Electric height-adjustable standing desk.', image: '🪑' },
  { name: 'Ember Cast Iron Skillet', category: 'Home & Kitchen', price: 39.99, stock: 18, description: 'Pre-seasoned 12-inch cast iron skillet.', image: '🍳' },
  { name: 'Basecamp 2-Person Tent', category: 'Sports', price: 129.99, stock: 6, description: 'Lightweight 3-season tent for backpacking trips.', image: '⛺' },
  { name: 'Momentum Yoga Mat', category: 'Sports', price: 22.0, stock: 55, description: 'Non-slip yoga mat with alignment guides.', image: '🧘' },
  { name: 'Ridge Insulated Water Bottle', category: 'Sports', price: 19.99, stock: 2, description: 'Double-wall insulated bottle, keeps drinks cold for 24 hours.', image: '🧴' }
];

function seedIfEmpty(force) {
  const db = readDB();
  if (!force && db.products.length > 0) return;

  db.products = PRODUCTS.map(p => ({
    id: genId('prod'),
    sku: genId('sku').toUpperCase(),
    ...p
  }));

  const existingUsernames = new Set(db.users.map(u => u.username));
  db.users = db.users.filter(u => u.role !== 'admin' && u.username !== 'testuser');

  if (!existingUsernames.has('admin')) {
    const admin = {
      id: genId('user'),
      username: 'admin',
      email: 'admin@qashop.test',
      passwordHash: bcrypt.hashSync('Admin123', 10),
      role: 'admin',
      failedAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString()
    };
    db.users.push(admin);
    db.carts[admin.id] = { items: [], coupon: null };
  }

  const testUser = {
    id: genId('user'),
    username: 'testuser',
    email: 'testuser@qashop.test',
    passwordHash: bcrypt.hashSync('Test1234', 10),
    role: 'customer',
    failedAttempts: 0,
    lockUntil: null,
    createdAt: new Date().toISOString()
  };
  db.users.push(testUser);
  db.carts[testUser.id] = { items: [], coupon: null };

  db.orders = force ? [] : db.orders;

  writeDB(db);
  console.log('Seeded product catalog and demo accounts (admin / admin@qashop.test, testuser / testuser@qashop.test).');
}

module.exports = { seedIfEmpty, PRODUCTS };
