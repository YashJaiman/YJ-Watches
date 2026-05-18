import { getProducts } from '../services/productService.js';
import { getCart, addToCart, updateCartItem } from '../services/cartService.js';
import { createProductCard } from '../components/productCard.js';

let searchQuery = '';
let currentPage = 1;
let totalPages = 1;
let productsList = [];
let cartItems = [];
let selectedBrands = new Set();
let selectedCategories = new Set();
let minPrice = null;
let maxPrice = null;
let currentSort = 'newest';

const gridContainer = document.getElementById('searchResultsGrid');
const queryTextEl = document.getElementById('searchQueryText');
const searchTotalCountEl = document.getElementById('searchTotalCount');
const categoryContainer = document.getElementById('categoryFilterContainer');
const brandContainer = document.getElementById('brandFilterContainer');
const minPriceInput = document.getElementById('priceMin');
const maxPriceInput = document.getElementById('priceMax');
const sortBySelect = document.getElementById('sortBy');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const currentCountEl = document.getElementById('currentCount');
const totalCountEl = document.getElementById('totalCount');
const emptyStateEl = document.getElementById('searchEmptyState');
const mainLayoutEl = document.getElementById('searchMainLayout');

async function initPage() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  searchQuery = urlParams.get('q') || '';
  
  if (!searchQuery) {
    globalThis.location.assign('Home.html');
    return;
  }

  queryTextEl.textContent = `"${searchQuery}"`;

  setupEventListeners();
  await loadCart();
  await loadFacetedFilters();
  await loadProducts(true);
}

async function loadCart() {
  try {
    const cart = await getCart();
    cartItems = Array.isArray(cart) ? cart : cart?.items || [];
  } catch (err) {
    console.error('Cart load error:', err);
  }
}

async function loadFacetedFilters() {
  try {
    // Dynamic fetch of matches to discover brands and categories within results
    const response = await getProducts({ search: searchQuery, limit: 100 });
    const items = response.products || [];

    if (items.length === 0) return; // Empty state will handle it

    // Extract unique brands
    const brands = [...new Set(items.map(item => item.brand).filter(Boolean))].sort();
    brandContainer.innerHTML = '';
    brands.forEach(brand => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';
      label.innerHTML = `
        <input type="checkbox" class="brand-checkbox" value="${brand}">
        <span>${brand}</span>
      `;
      brandContainer.appendChild(label);
    });

    // Extract unique categories
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))].sort();
    categoryContainer.innerHTML = '';
    categories.forEach(category => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';
      label.innerHTML = `
        <input type="checkbox" class="category-checkbox" value="${category}">
        <span>${category}</span>
      `;
      categoryContainer.appendChild(label);
    });
  } catch (err) {
    console.error('Faceted search filters error:', err);
  }
}

async function loadProducts(reset = false) {
  if (reset) {
    currentPage = 1;
    gridContainer.innerHTML = '';
    showLoadingSkeletons();
  }

  try {
    const brandsQuery = Array.from(selectedBrands).join(',');
    const categoriesQuery = Array.from(selectedCategories).join(',');
    const options = {
      search: searchQuery,
      page: currentPage,
      limit: 12,
      sort: currentSort
    };

    if (brandsQuery) options.brand = brandsQuery;
    if (categoriesQuery) options.category = categoriesQuery;
    if (minPrice) options.priceMin = minPrice;
    if (maxPrice) options.priceMax = maxPrice;

    const response = await getProducts(options);
    const products = response.products || [];
    totalPages = response.pages || 1;

    if (reset) {
      gridContainer.innerHTML = '';
    } else {
      removeSkeletons();
    }

    if (products.length === 0 && reset) {
      // Empty state block
      emptyStateEl.style.display = 'block';
      searchTotalCountEl.textContent = '0';
      
      // Let's render recommendations instead!
      await loadRecommendations();
      return;
    }

    emptyStateEl.style.display = 'none';

    // Render cards
    products.forEach(product => {
      const cartItem = cartItems.find(item => String(item.productId || item._id) === String(product._id || product.id));
      const card = createProductCard(product, cartItem);
      gridContainer.appendChild(card);
    });

    if (reset) {
      productsList = products;
    } else {
      productsList = [...productsList, ...products];
    }

    currentCountEl.textContent = productsList.length.toString();
    const totalCountVal = response.total || productsList.length;
    totalCountEl.textContent = totalCountVal.toString();
    searchTotalCountEl.textContent = totalCountVal.toString();

    // Enable/Disable Load More button
    if (currentPage >= totalPages) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'End of Collection';
    } else {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  } catch (err) {
    console.error('Search products load error:', err);
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #f87171;">
        <h3 style="font-family: 'Orbitron', sans-serif; margin-bottom: 8px;">Failed to Retrieve Timepieces</h3>
        <p style="font-size: 14px;">${err.message || 'Unable to establish server connection.'}</p>
      </div>
    `;
  }
}

async function loadRecommendations() {
  try {
    gridContainer.innerHTML = '';
    // Show subtitle header for recommendations
    const recHeader = document.createElement('h3');
    recHeader.className = 'recommended-title';
    recHeader.style.gridColumn = '1/-1';
    recHeader.textContent = '🔥 Featured Timepieces For You';
    gridContainer.appendChild(recHeader);

    // Fetch popular/first 8 watches in DB
    const response = await getProducts({ page: 1, limit: 8 });
    const recommended = response.products || [];

    recommended.forEach(product => {
      const cartItem = cartItems.find(item => String(item.productId || item._id) === String(product._id || product.id));
      const card = createProductCard(product, cartItem);
      gridContainer.appendChild(card);
    });

    productsList = recommended;
    currentCountEl.textContent = recommended.length.toString();
    totalCountEl.textContent = recommended.length.toString();
    loadMoreBtn.style.display = 'none'; // No pagination for recommendations
  } catch (err) {
    console.error('Failed to load search recommendations:', err);
  }
}

function showLoadingSkeletons() {
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = 'skeleton-card';
    gridContainer.appendChild(el);
  }
}

function removeSkeletons() {
  const skeletons = gridContainer.querySelectorAll('.skeleton-card');
  skeletons.forEach(s => s.remove());
}

function setupEventListeners() {
  // Sort event
  sortBySelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    loadProducts(true);
  });

  // Load More event
  loadMoreBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      showLoadingSkeletons();
      loadProducts(false);
    }
  });

  // Sidebar brand filter event delegation
  brandContainer.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
      const val = e.target.value;
      if (e.target.checked) {
        selectedBrands.add(val);
      } else {
        selectedBrands.delete(val);
      }
      loadProducts(true);
    }
  });

  // Sidebar category filter event delegation
  categoryContainer.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
      const val = e.target.value;
      if (e.target.checked) {
        selectedCategories.add(val);
      } else {
        selectedCategories.delete(val);
      }
      loadProducts(true);
    }
  });

  // Price inputs with debounce
  let priceDebounce = null;
  const priceChange = () => {
    clearTimeout(priceDebounce);
    priceDebounce = setTimeout(() => {
      minPrice = minPriceInput.value ? Number(minPriceInput.value) : null;
      maxPrice = maxPriceInput.value ? Number(maxPriceInput.value) : null;
      loadProducts(true);
    }, 400);
  };

  minPriceInput.addEventListener('input', priceChange);
  maxPriceInput.addEventListener('input', priceChange);

  // Grid Action clicks
  gridContainer.addEventListener('click', async (e) => {
    const target = e.target;
    const card = target.closest('.product-card');
    if (!card) return;
    
    const productId = card.dataset.id;
    if (!productId) return;

    if (target.classList.contains('add-to-cart-btn')) {
      e.stopPropagation();
      try {
        await addToCart(productId);
        await loadCart();
        
        // Redraw grid
        gridContainer.innerHTML = '';
        // If empty state was showing, redraw recommendations
        if (emptyStateEl.style.display === 'block') {
          const recHeader = document.createElement('h3');
          recHeader.className = 'recommended-title';
          recHeader.style.gridColumn = '1/-1';
          recHeader.textContent = '🔥 Featured Timepieces For You';
          gridContainer.appendChild(recHeader);
        }

        productsList.forEach(product => {
          const item = cartItems.find(itm => (itm.productId || itm._id) === (product._id || product.id));
          const el = createProductCard(product, item);
          gridContainer.appendChild(el);
        });
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('unauthorized')) {
          globalThis.location.assign('index.html');
          return;
        }
        console.error('Cart add error:', err);
      }
      return;
    }

    if (target.classList.contains('increase') || target.classList.contains('decrease')) {
      e.stopPropagation();
      const cartItem = cartItems.find(item => String(item.productId || item._id) === String(productId));
      const nextQty = isInc ? cartItem.quantity + 1 : cartItem.quantity - 1;
      
      try {
        await updateCartItem(productId, nextQty);
        await loadCart();
        
        gridContainer.innerHTML = '';
        if (emptyStateEl.style.display === 'block') {
          const recHeader = document.createElement('h3');
          recHeader.className = 'recommended-title';
          recHeader.style.gridColumn = '1/-1';
          recHeader.textContent = '🔥 Featured Timepieces For You';
          gridContainer.appendChild(recHeader);
        }

        productsList.forEach(product => {
          const item = cartItems.find(itm => (itm.productId || itm._id) === (product._id || product.id));
          const el = createProductCard(product, item);
          gridContainer.appendChild(el);
        });
      } catch (err) {
        console.error('Quantity update error:', err);
      }
      return;
    }

    // Redirect card click
    if (target.closest('.product-image-wrapper') || target.closest('.product-name') || target.closest('.product-description') || target.closest('.product-price-section')) {
      globalThis.location.assign(`product.html?id=${productId}`);
    }
  });
}

initPage();
