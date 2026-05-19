const PRODUCTS_KEY = 'yjwatches_products';
const USERS_KEY = 'yjwatches_users';
const CART_KEY = 'yjwatches_cart';
const SESSION_KEY = 'yjwatches_session';

const defaultProducts = [
  { id: 1, name: 'Richard Mille', price: 300000, image: 'images/item1.jpg', category: 'Luxury', description: 'High-end luxury timepiece.', stock: 10 },
  { id: 2, name: 'Rolex Submariner', price: 18000, image: 'images/item2.jpg', category: 'Sport', description: 'Premium dive watch with iconic styling.', stock: 15 },
  { id: 3, name: 'Omega Speedmaster', price: 9500, image: 'images/item3.jpg', category: 'Classic', description: 'Legendary chronograph with a rich history.', stock: 12 },
  { id: 4, name: 'Rado', price: 9500, image: 'images/Rado.jpg', category: 'Classic', description: 'Elegant ceramic design with a refined finish.', stock: 18 },
  { id: 5, name: 'Cartier', price: 100000, image: 'images/item5.jpg', category: 'Luxury', description: 'Iconic dress watch with timeless design.', stock: 8 },
  { id: 6, name: 'Patek Philippe', price: 500000, image: 'images/item6.jpg', category: 'Luxury', description: 'Collector-grade watch with superior craftsmanship.', stock: 5 },
];

function getStorageItem(key, fallback = null) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function setStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeMockData() {
  if (!getStorageItem(PRODUCTS_KEY)) {
    setStorageItem(PRODUCTS_KEY, defaultProducts);
  }

  if (!getStorageItem(USERS_KEY)) {
    setStorageItem(USERS_KEY, []);
  }

  if (!getStorageItem(CART_KEY)) {
    setStorageItem(CART_KEY, {});
  }
}

function hashPassword(password) {
  return btoa(password);
}

function verifyPassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

function generateToken(email) {
  return btoa(`${email}:${Date.now()}`);
}

function getSession() {
  return getStorageItem(SESSION_KEY, null);
}

function setSession(session) {
  setStorageItem(SESSION_KEY, session);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth(headers) {
  const session = getSession();
  const authorization = headers?.Authorization || headers?.authorization;

  if (!session || !authorization || authorization !== `Bearer ${session.token}`) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  return session;
}

function getUsers() {
  return getStorageItem(USERS_KEY, []);
}

function saveUsers(users) {
  setStorageItem(USERS_KEY, users);
}

function getProducts() {
  return getStorageItem(PRODUCTS_KEY, defaultProducts);
}

function saveCartForUser(email, cartItems) {
  const cartData = getStorageItem(CART_KEY, {});
  cartData[email] = cartItems;
  setStorageItem(CART_KEY, cartData);
}

function getCartForUser(email) {
  const cartData = getStorageItem(CART_KEY, {});
  return cartData[email] || [];
}

function applyQueryFilters(products, queryParams) {
  const { search, category } = queryParams;
  let filtered = [...products];

  if (search) {
    const searchValue = search.toString().trim().toLowerCase();
    filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchValue) || product.description.toLowerCase().includes(searchValue));
  }

  if (category) {
    filtered = filtered.filter((product) => product.category.toLowerCase() === category.toString().toLowerCase());
  }

  return filtered;
}

function findProductById(id) {
  const products = getProducts();
  return products.find((product) => product.id === Number(id));
}

function handleRegister(body) {
  const { fullname, email, password } = body;
  const users = getUsers();
  const lowerEmail = email.toString().trim().toLowerCase();

  if (users.some((user) => user.email === lowerEmail)) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  const user = {
    id: Date.now(),
    fullname: fullname.toString().trim(),
    email: lowerEmail,
    password: hashPassword(password),
    role: 'user',
  };

  users.push(user);
  saveUsers(users);

  const token = generateToken(user.email);
  setSession({ token, email: user.email });

  return {
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

function handleLogin(body) {
  const { email, password } = body;
  const users = getUsers();
  const lowerEmail = email.toString().trim().toLowerCase();
  const user = users.find((entry) => entry.email === lowerEmail);

  if (!user || !verifyPassword(password, user.password)) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user.email);
  setSession({ token, email: user.email });

  return {
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

function handleGetProducts(url) {
  const urlObject = new URL(url, 'https://example.com');
  const query = Object.fromEntries(urlObject.searchParams.entries());
  const products = getProducts();
  return applyQueryFilters(products, query);
}

function handleGetProductById(id) {
  const product = findProductById(id);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return product;
}

function handleGetCart(headers) {
  const session = requireAuth(headers);
  return getCartForUser(session.email);
}

function handleAddCartItem(body, headers) {
  const session = requireAuth(headers);
  const product = findProductById(body.productId);

  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  const currentCart = getCartForUser(session.email);
  const existing = currentCart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    currentCart.push({ ...product, quantity: 1 });
  }

  saveCartForUser(session.email, currentCart);
  return currentCart;
}

function handleUpdateCartItem(id, body, headers) {
  const session = requireAuth(headers);
  const currentCart = getCartForUser(session.email);
  const item = currentCart.find((entry) => entry.id === Number(id));

  if (!item) {
    const error = new Error('Cart item not found');
    error.status = 404;
    throw error;
  }

  item.quantity = Number(body.quantity);

  if (item.quantity <= 0) {
    return handleDeleteCartItem(id, headers);
  }

  saveCartForUser(session.email, currentCart);
  return currentCart;
}

function handleDeleteCartItem(id, headers) {
  const session = requireAuth(headers);
  const currentCart = getCartForUser(session.email);
  const filtered = currentCart.filter((entry) => entry.id !== Number(id));
  saveCartForUser(session.email, filtered);
  return filtered;
}

function parseRoute(route) {
  const url = new URL(route, 'https://example.com');
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  return { pathname, segments, query: Object.fromEntries(url.searchParams.entries()) };
}

export async function handleRequest(path, config) {
  initializeMockData();

  const { pathname, segments } = parseRoute(path);
  const method = (config.method || 'GET').toUpperCase();
  const headers = config.headers || {};
  const body = config.body ? JSON.parse(config.body) : null;

  try {
    if (pathname === '/api/auth/register' && method === 'POST') {
      return handleRegister(body);
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      return handleLogin(body);
    }

    if (pathname === '/api/products' && method === 'GET') {
      return handleGetProducts(path);
    }

    if (segments[0] === 'api' && segments[1] === 'products' && segments[2] && method === 'GET') {
      return handleGetProductById(segments[2]);
    }

    if (pathname === '/api/cart' && method === 'GET') {
      return handleGetCart(headers);
    }

    if (pathname === '/api/cart' && method === 'POST') {
      return handleAddCartItem(body, headers);
    }

    if (segments[0] === 'api' && segments[1] === 'cart' && segments[2] && method === 'PUT') {
      return handleUpdateCartItem(segments[2], body, headers);
    }

    if (segments[0] === 'api' && segments[1] === 'cart' && segments[2] && method === 'DELETE') {
      return handleDeleteCartItem(segments[2], headers);
    }

    const error = new Error('API endpoint not found');
    error.status = 404;
    throw error;
  } catch (error) {
    const responseError = new Error(error.message || 'Mock backend error');
    responseError.status = error.status || 500;
    throw responseError;
  }
}
