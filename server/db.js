const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function defaultData() {
  return {
    users: [],
    products: [],
    carts: {},
    orders: [],
    coupons: [
      { code: 'SAVE10', type: 'percent', value: 10, active: true },
      { code: 'FLAT5', type: 'flat', value: 5, active: true },
      { code: 'EXPIRED5', type: 'percent', value: 5, active: false }
    ]
  };
}

function ensureFile() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData(), null, 2));
  }
}

function readDB() {
  ensureFile();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    const fresh = defaultData();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let nextId = 1;
function genId(prefix) {
  const id = `${prefix}_${Date.now().toString(36)}_${(nextId++).toString(36)}`;
  return id;
}

module.exports = { readDB, writeDB, genId, DB_PATH };
