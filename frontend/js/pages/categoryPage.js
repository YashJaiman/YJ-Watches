import { getProducts } from '../services/productService.js';
import { getCart, addToCart, updateCartItem } from '../services/cartService.js';
import { createProductCard } from '../components/productCard.js';

const categoryDescriptions = {
  Luxury: 'Discover precision-crafted Swiss masterpieces made for the most discerning collections.',
  Sport: 'High-performance tracking tools built to survive extreme environments and active lifestyles.',
  Classic: 'Timeless styling and vintage elegance that fits any sophisticated dress code.',
  Smart: 'Elite smartwatch tech featuring dynamic wear OS and touchscreen convenience.',
  Fitness: 'Next-gen calorie trackers and biometric heart-rate sensors to fuel your workouts.',
  Casual: 'Daily-wear designs that pair durability with an effortless minimalist style.',
  Premium: 'Collector-grade watches emphasizing absolute detail, luxury metals, and premium mechanics.',
  Digital: 'Retro designs styled with high-tech LED backlights, quartz power, and vintage layouts.',
  Women: 'Elegant watches featuring rose gold finishes and sleek, petite jewelry-level craftsmanship.',
  Men: 'Bold, masculine, and commanding watches designed for high-performance and executive status.'
};

let currentCategory = '';
let currentPage = 1;
let totalPages = 1;
let productsList = [];
let cartItems = [];
let selectedBrands = new Set();
let minPrice = null;
let maxPrice = null;
let currentSort = 'newest';
let isInitialBrandLoad = true;

const gridContainer = document.getElementById('categoryProductsGrid');
const titleEl = document.getElementById('categoryTitle');
const descEl = document.getElementById('categoryDescription');
const brandContainer = document.getElementById('brandFilterContainer');
const minPriceInput = document.getElementById('priceMin');
const maxPriceInput = document.getElementById('priceMax');
const sortBySelect = document.getElementById('sortBy');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const currentCountEl = document.getElementById('currentCount');
const totalCountEl = document.getElementById('totalCount');

async function initPage() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const rawCategory = urlParams.get('category');
  currentCategory = rawCategory ? decodeURIComponent(rawCategory) : 'Luxury';
  
  // Set details
  titleEl.textContent = `${currentCategory} Watches`;
  descEl.textContent = categoryDescriptions[currentCategory] || 'Elite timepiece collection.';

  setupEventListeners();
  await loadCart();
  await loadFacetedBrands();
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

async function loadFacetedBrands() {
  try {
    // Dynamic fetch of all products in category to extract brands
    const response = await getProducts({ category: currentCategory, limit: 100 });
    const items = response.products || [];
    const brands = [...new Set(items.map(item => item.brand).filter(Boolean))].sort();
    
    brandContainer.innerHTML = '';
    brands.forEach(brand => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';
      label.innerHTML = `
        <input type="checkbox" value="${brand}">
        <span>${brand}</span>
      `;
      brandContainer.appendChild(label);
    });
  } catch (err) {
    console.error('Faceted brands error:', err);
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
    const options = {
      category: currentCategory,
      page: currentPage,
      limit: 12,
      sort: currentSort
    };

    if (brandsQuery) options.brand = brandsQuery;
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
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
          <h3 style="font-family: 'Orbitron', sans-serif; color: white; margin-bottom: 8px;">No Timepieces Found</h3>
          <p style="font-size: 14px;">Try modifying your search or filter boundaries.</p>
        </div>
      `;
      currentCountEl.textContent = '0';
      totalCountEl.textContent = '0';
      loadMoreBtn.disabled = true;
      return;
    }

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
    totalCountEl.textContent = (response.total || productsList.length).toString();

    // Enable/Disable Load More button
    if (currentPage >= totalPages) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'End of Collection';
    } else {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  } catch (err) {
    console.error('Products load error:', err);
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #f87171;">
        <h3 style="font-family: 'Orbitron', sans-serif; margin-bottom: 8px;">Failed to Load Collection</h3>
        <p style="font-size: 14px;">${err.message || 'Unable to establish server connection.'}</p>
      </div>
    `;
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

function updateCardButtonState(card, product, cartItem) {
  const actionsDiv = card.querySelector('.product-actions');
  if (!actionsDiv) return;

  const html = cartItem ? `
    <div class="quantity-control" data-id="${product._id || product.id}">
      <button class="decrease" aria-label="Decrease quantity" title="Decrease quantity">−</button>
      <span class="qty">${cartItem.quantity}</span>
      <button class="increase" aria-label="Increase quantity" title="Increase quantity">+</button>
    </div>
  ` : `
    <button class="add-to-cart-btn" data-id="${product._id || product.id}" aria-label="Add ${product.name} to cart" title="Add to cart">Add to Cart</button>
  `;

  // Fade out
  actionsDiv.style.opacity = '0';
  actionsDiv.style.transform = 'scale(0.95)';
  
  setTimeout(() => {
    actionsDiv.innerHTML = html;
    // Fade in
    actionsDiv.style.opacity = '1';
    actionsDiv.style.transform = 'scale(1)';
  }, 150);
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
      // Show mini skeletons
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

  // Grid Action clicks (Add to Cart / Card redirection)
  gridContainer.addEventListener('click', async (e) => {
    const target = e.target;
    const card = target.closest('.product-card');
    if (!card) return;
    
    const productId = card.dataset.id;
    if (!productId) return;

    // Direct add-to-cart clicks
    if (target.classList.contains('add-to-cart-btn')) {
      e.stopPropagation();
      try {
        await addToCart(productId);
        await loadCart();
        
        // Find the product in productsList
        const product = productsList.find(p => String(p._id || p.id) === String(productId));
        if (product) {
          const cartItem = cartItems.find(item => String(item.productId || item._id) === String(productId));
          updateCardButtonState(card, product, cartItem);
        }
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('unauthorized')) {
          globalThis.location.assign('index.html');
          return;
        }
        console.error('Cart add error:', err);
      }
      return;
    }

    // Handle Quantity adjustments
    if (target.classList.contains('increase') || target.classList.contains('decrease')) {
      e.stopPropagation();
      const cartItem = cartItems.find(item => String(item.productId || item._id) === String(productId));
      if (!cartItem) return;
      const isInc = target.classList.contains('increase');
      const nextQty = isInc ? cartItem.quantity + 1 : cartItem.quantity - 1;
      
      try {
        await updateCartItem(productId, nextQty);
        await loadCart();
        
        // Update just this card's button state
        const product = productsList.find(p => String(p._id || p.id) === String(productId));
        if (product) {
          const updatedCartItem = nextQty > 0 
            ? cartItems.find(item => String(item.productId || item._id) === String(productId))
            : null;
          updateCardButtonState(card, product, updatedCartItem);
        }
      } catch (err) {
        console.error('Quantity update error:', err);
      }
      return;
    }

    // Card redirect click
    if (target.closest('.product-image-wrapper') || target.closest('.product-name') || target.closest('.product-description') || target.closest('.product-price-section')) {
      globalThis.location.assign(`product.html?id=${productId}`);
    }
  });
}

// Fire Page
initPage();
