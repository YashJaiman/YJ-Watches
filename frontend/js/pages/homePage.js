import { getProducts } from '../services/productService.js';
import { getCart, addToCart, updateCartItem } from '../services/cartService.js';
import { createProductCard } from '../components/productCard.js';
import { createSkeletonGrid } from '../components/skeletonLoader.js';
import { showError, showSuccess } from '../utils/notifications.js';

const productGrid = document.getElementById('productGrid');
const searchInput = document.querySelector('.search-bar input');
const categoryContainer = document.querySelector('.dropdown-category');

let products = [];
let cartItems = [];
let currentSearch = '';
let currentCategory = '';
let isLoading = false;
let searchDebounceTimer = null;

function showLoadingSkeletons() {
  productGrid.innerHTML = '';
  productGrid.appendChild(createSkeletonGrid(6));
}

function renderProducts(items) {
  productGrid.innerHTML = '';

  if (items.length === 0) {
    productGrid.innerHTML = `
      <div style="
        grid-column: 1/-1;
        text-align: center;
        padding: 60px 20px;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        color: #94a3b8;
      ">
        <div style="font-size: 48px; margin-bottom: 16px; filter: drop-shadow(0 0 10px rgba(56,189,248,0.3));">🔍</div>
        <h4 style="color: #f1f5f9; font-size: 18px; margin: 0 0 8px;">No products found</h4>
        <p style="font-size: 14px; margin: 0;">Try a different search term or category.</p>
      </div>
    `;
    return;
  }

  const cartMap = new Map((cartItems.items || cartItems || []).map((item) => [item.productId || item.id || item._id, item]));
  items.forEach((product) => {
    const cartItem = cartMap.get(product._id || product.id);
    productGrid.appendChild(createProductCard(product, cartItem));
  });
}

async function refreshCart() {
  try {
    cartItems = await getCart();
  } catch {
    cartItems = [];
  }
}

function renderErrorState(message) {
  productGrid.innerHTML = `
    <div style="
      grid-column: 1/-1;
      text-align: center;
      padding: 60px 20px;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      color: #94a3b8;
    ">
      <div style="font-size: 48px; margin-bottom: 16px; filter: drop-shadow(0 0 10px rgba(239,68,68,0.3));">⚠️</div>
      <h4 style="color: #f1f5f9; font-size: 18px; margin: 0 0 8px;">Something went wrong</h4>
      <p style="font-size: 14px; margin: 0 0 20px;">${message}</p>
      <button id="retryBtn" style="
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 30px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      ">Retry Connection</button>
    </div>
  `;

  document.getElementById('retryBtn')?.addEventListener('click', () => {
    refreshProducts();
  });
}

async function refreshProducts() {
  if (isLoading) return;
  
  try {
    isLoading = true;
    showLoadingSkeletons();
    const response = await getProducts({ search: currentSearch, category: currentCategory, limit: 12 });
    products = response.products || response;
    renderProducts(products);
  } catch (error) {
    showError(error.message || 'Unable to load products.');
    renderErrorState(error.message || 'Unable to establish connection to the server.');
  } finally {
    isLoading = false;
  }
}

async function initPage() {
  await refreshCart();
  await refreshProducts();

  // Wire up Explore collections cards clicks
  const homeCategoriesWrapper = document.querySelector('.categories-section .wrapper');
  if (homeCategoriesWrapper) {
    homeCategoriesWrapper.addEventListener('click', (e) => {
      const card = e.target.closest('.category-card');
      if (!card) return;
      const titleText = card.querySelector('.category-title')?.textContent.trim();
      if (!titleText) return;
      
      let categoryParam = 'Luxury';
      if (titleText === 'MEN') categoryParam = 'Men';
      else if (titleText === 'WOMEN') categoryParam = 'Women';
      else if (titleText === 'LUXURY WATCH') categoryParam = 'Luxury';
      else if (titleText === 'SMART WATCH') categoryParam = 'Smart';
      else if (titleText === 'FITNESS WATCH') categoryParam = 'Fitness';
      
      globalThis.location.assign(`category.html?category=${categoryParam}`);
    });
  }
}


function handleSearch(event) {
  currentSearch = event.target.value.trim();
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    refreshProducts();
  }, 300);
}

function getProductIdFromEvent(target) {
  const id = target.dataset.id || target.closest('[data-id]')?.dataset.id;
  return id;
}

async function handleAddToCart(productId) {
  try {
    await addToCart(productId);
    await refreshCart();
    const product = products.find((p) => (p._id || p.id) === productId);
    showSuccess(product ? `"${product.name}" added to cart!` : 'Item added to cart!');
    renderProducts(products);
  } catch (error) {
    if (error.message && error.message.toLowerCase().includes('unauthorized')) {
      globalThis.location.assign('index.html');
      return;
    }
    showError(error.message || 'Unable to add product to cart.');
  }
}

async function handleQuantityChange(productId, target) {
  const product = products.find((item) => (item._id || item.id) === productId);
  const cartItem = cartItems.find((item) => (item.productId || item.id) === productId);

  if (!cartItem || !product) return;

  const newQuantity = target.classList.contains('increase') ? cartItem.quantity + 1 : cartItem.quantity - 1;

  try {
    if (newQuantity > 0) {
      await updateCartItem(productId, newQuantity);
    } else {
      await updateCartItem(productId, 0);
    }
    await refreshCart();
    renderProducts(products);
  } catch (error) {
    showError(error.message || 'Unable to update cart quantity.');
  }
}

async function handleProductGridClick(event) {
  const target = event.target;
  const productId = getProductIdFromEvent(target);

  if (!productId) return;

  if (target.classList.contains('add-to-cart-btn')) {
    await handleAddToCart(productId);
    return;
  }

  if (target.classList.contains('increase') || target.classList.contains('decrease')) {
    await handleQuantityChange(productId, target);
    return;
  }

  // Redirect to product details page
  if (target.closest('.product-image-wrapper') || target.closest('.product-name') || target.closest('.product-description') || target.closest('.product-price-section')) {
    globalThis.location.assign(`product.html?id=${productId}`);
  }
}

productGrid.addEventListener('click', handleProductGridClick);

searchInput?.addEventListener('input', handleSearch);

export default initPage;
