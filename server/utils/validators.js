const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const ZIP_RE = /^[0-9]{5,6}$/;
const CARD_RE = /^[0-9]{16}$/;
const CVV_RE = /^[0-9]{3,4}$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

function validateRegistration(body) {
  const errors = {};
  const { username, email, password, confirmPassword, acceptTerms } = body || {};

  if (!username || !username.trim()) errors.username = 'Username is required';
  else if (!USERNAME_RE.test(username.trim())) errors.username = 'Username must be 3-20 characters, letters/numbers/underscore only';

  if (!email || !email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) errors.password = 'Password must contain letters and at least one number';

  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (!acceptTerms) errors.acceptTerms = 'You must accept the terms to continue';

  return errors;
}

function validateLogin(body) {
  const errors = {};
  const { username, password } = body || {};
  if (!username || !username.trim()) errors.username = 'Username is required';
  if (!password) errors.password = 'Password is required';
  return errors;
}

function validateAddress(shipping) {
  const errors = {};
  const s = shipping || {};
  if (!s.fullName || !s.fullName.trim()) errors.fullName = 'Full name is required';
  if (!s.addressLine || !s.addressLine.trim()) errors.addressLine = 'Address is required';
  if (!s.city || !s.city.trim()) errors.city = 'City is required';
  if (!s.state || !s.state.trim()) errors.state = 'State is required';
  if (!s.zip || !ZIP_RE.test(s.zip.trim())) errors.zip = 'Enter a valid 5 or 6 digit ZIP code';
  if (!s.country || !s.country.trim()) errors.country = 'Country is required';
  return errors;
}

function validatePayment(payment) {
  const errors = {};
  const p = payment || {};
  const cardDigits = (p.cardNumber || '').replace(/\s+/g, '');
  if (!cardDigits) errors.cardNumber = 'Card number is required';
  else if (!CARD_RE.test(cardDigits)) errors.cardNumber = 'Card number must be exactly 16 digits';

  if (!p.expiry) errors.expiry = 'Expiry date is required';
  else if (!EXPIRY_RE.test(p.expiry.trim())) errors.expiry = 'Expiry must be in MM/YY format';
  else {
    const [, mm, yy] = p.expiry.trim().match(EXPIRY_RE);
    const expDate = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10), 1);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (expDate <= thisMonth) errors.expiry = 'Card has expired';
  }

  if (!p.cvv) errors.cvv = 'CVV is required';
  else if (!CVV_RE.test(p.cvv.trim())) errors.cvv = 'CVV must be 3 or 4 digits';

  if (!p.nameOnCard || !p.nameOnCard.trim()) errors.nameOnCard = 'Name on card is required';

  return errors;
}

function validateProduct(body) {
  const errors = {};
  const b = body || {};
  if (!b.name || !b.name.trim()) errors.name = 'Product name is required';
  if (b.price === undefined || b.price === null || b.price === '' || isNaN(Number(b.price)) || Number(b.price) <= 0) {
    errors.price = 'Price must be a number greater than 0';
  }
  if (b.stock === undefined || b.stock === null || b.stock === '' || isNaN(Number(b.stock)) || Number(b.stock) < 0 || !Number.isInteger(Number(b.stock))) {
    errors.stock = 'Stock must be a whole number of 0 or more';
  }
  if (!b.category || !b.category.trim()) errors.category = 'Category is required';
  return errors;
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateAddress,
  validatePayment,
  validateProduct,
  EMAIL_RE,
  USERNAME_RE
};
