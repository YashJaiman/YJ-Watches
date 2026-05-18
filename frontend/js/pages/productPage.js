import { getProductById, getProducts } from '../services/productService.js';
import { getCart, addToCart, updateCartItem } from '../services/cartService.js';
import { createProductCard } from '../components/productCard.js';

let currentProductId = '';
let currentProduct = null;
let cartItems = [];

const gridContainer = document.getElementById('productDetailGrid');

function normalizeId(value) {
  return value == null ? '' : String(value);
}

function findCartItemForProduct(product) {
  return cartItems.find((item) =>
    normalizeId(item.productId || item._id || item.id) === normalizeId(product._id || product.id)
  );
}

function findCartItemByProductId(productId) {
  return cartItems.find((item) =>
    normalizeId(item.productId || item._id || item.id) === normalizeId(productId)
  );
}
const breadcrumbCat = document.getElementById('breadcrumbCategory');
const breadcrumbProd = document.getElementById('breadcrumbProduct');
const relatedGrid = document.getElementById('relatedProductsGrid');

async function initPage() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  currentProductId = urlParams.get('id') || '';

  if (!currentProductId) {
    globalThis.location.assign('Home.html');
    return;
  }

  await loadCart();
  await loadProductDetails();
}

async function loadCart() {
  try {
    const cart = await getCart();
    cartItems = Array.isArray(cart) ? cart : cart?.items || [];
  } catch (err) {
    console.error('Cart load error:', err);
  }
}

async function loadProductDetails() {
  try {
    currentProduct = await getProductById(currentProductId);
    if (!currentProduct) {
      throw new Error('Timepiece metrics not found.');
    }

    // Render breadcrumbs
    breadcrumbCat.textContent = currentProduct.category;
    breadcrumbCat.href = `category.html?category=${currentProduct.category}`;
    breadcrumbProd.textContent = currentProduct.name;

    // Render details
    renderDetailsPanel(currentProduct);
    setupZoomEffect();
    await loadRelatedProducts(currentProduct.category);
  } catch (err) {
    console.error('Failed to load product details:', err);
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #f87171;">
        <h3 style="font-family: 'Orbitron', sans-serif; margin-bottom: 8px;">Quantum Dial Error</h3>
        <p style="font-size: 14px;">${err.message || 'Unable to retrieve watch metrics from server.'}</p>
        <a href="Home.html" style="color: #38bdf8; text-decoration: underline; margin-top: 16px; display: inline-block;">Return to Shop</a>
      </div>
    `;
  }
}

function renderDetailsPanel(product) {
  const cartItem = findCartItemForProduct(product);
  const hasStock = product.stock > 0;
  
  const fallbackImage = 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80';

  gridContainer.innerHTML = `
    <!-- Left Hand Image Gallery -->
    <div class="product-gallery">
      <div class="image-zoom-viewport" id="zoomViewport">
        <img src="${product.image || fallbackImage}" onerror="this.src='${fallbackImage}'" id="zoomImage" class="product-zoom-img" alt="${product.name}">
      </div>
    </div>

    <!-- Right Hand Spec Content Panel -->
    <div class="product-info-panel">
      <span class="p-brand-badge">${product.brand || 'Luxury Model'}</span>
      <h1 class="p-title">${product.name}</h1>
      
      <div class="p-tags-row">
        ${(product.tags || []).map(tag => `<span class="p-tag">${tag}</span>`).join('')}
      </div>

      <div class="p-meta-badges">
        <div class="p-meta-item">
          <span class="p-meta-label">Category</span>
          <span class="p-meta-value">${product.category}</span>
        </div>
        <div class="p-meta-item">
          <span class="p-meta-label">Dials</span>
          <span class="p-meta-value">Swiss Quartz</span>
        </div>
        <div class="p-meta-item">
          <span class="p-meta-label">Reference</span>
          <span class="p-meta-value">#SM-${(product._id || product.id).substring(0, 5).toUpperCase()}</span>
        </div>
      </div>

      <div class="p-price-panel">
        <span class="p-price-display">$${(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        <span class="p-stock-badge ${hasStock ? 'in-stock' : 'out-of-stock'}">
          ${hasStock ? `In Vault (${product.stock} units)` : 'Out of Vault'}
        </span>
      </div>

      <div class="p-description-panel">
        <h3 class="p-desc-title">Spec Sheet</h3>
        <p class="p-desc-text">${product.description || 'This timepiece remains an engineering marvel, crafted with ultimate luxury materials, precise gears, and a sleek modern strap for premium presentation.'}</p>
      </div>

      <div class="p-action-section" id="pActionBlock">
        ${cartItem ? `
          <div class="p-qty-container">
            <button class="p-qty-btn decrease-qty" aria-label="Decrease quantity">−</button>
            <span class="p-qty-val">${cartItem.quantity}</span>
            <button class="p-qty-btn increase-qty" aria-label="Increase quantity">+</button>
          </div>
        ` : `
          <button class="p-add-btn" id="addToCartBtn" ${hasStock ? '' : 'disabled'}>
            ${hasStock ? 'Add to Vault Cart' : 'Temporarily Unavailable'}
          </button>
        `}
      </div>
    </div>
  `;

  // Attach Action Button Listeners
  const actionBlock = document.getElementById('pActionBlock');
  actionBlock.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.id === 'addToCartBtn') {
      try {
        await addToCart(product._id || product.id);
        await loadCart();
        renderDetailsPanel(product);
        setupZoomEffect();
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('unauthorized')) {
          globalThis.location.assign('index.html');
          return;
        }
        console.error('Cart detail add error:', err);
      }
      return;
    }

    if (target.classList.contains('increase-qty') || target.classList.contains('decrease-qty')) {
      const item = findCartItemForProduct(product);
      if (!item) return;

      const isInc = target.classList.contains('increase-qty');
      const nextQty = isInc ? item.quantity + 1 : item.quantity - 1;

      try {
        await updateCartItem(product._id || product.id, nextQty);
        await loadCart();
        renderDetailsPanel(product);
        setupZoomEffect();
      } catch (err) {
        console.error('Cart quantity adjust error:', err);
      }
    }
  });
}

function setupZoomEffect() {
  const viewport = document.getElementById('zoomViewport');
  const img = document.getElementById('zoomImage');
  if (!viewport || !img) return;

  viewport.addEventListener('mousemove', (e) => {
    const bounds = viewport.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    
    // Convert to percentage coordinates
    const xPercent = (x / bounds.width) * 100;
    const yPercent = (y / bounds.height) * 100;

    // Shift transform origin to match mouse position and scale
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    img.style.transform = 'scale(1.8)';
  });

  viewport.addEventListener('mouseleave', () => {
    img.style.transformOrigin = 'center center';
    img.style.transform = 'scale(1)';
  });
}

async function loadRelatedProducts(category) {
  try {
    relatedGrid.innerHTML = '';
    const response = await getProducts({ category, limit: 5 });
    const items = response.products || [];

    // Filter out active watch
    const filtered = items.filter(item => (item._id || item.id) !== currentProductId).slice(0, 4);

    if (filtered.length === 0) {
      relatedGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 20px;">
          No additional timepiece releases in this category.
        </div>
      `;
      return;
    }

    filtered.forEach(product => {
      const cartItem = findCartItemForProduct(product);
      const card = createProductCard(product, cartItem);
      relatedGrid.appendChild(card);
    });

    // Wire up related clicks
    relatedGrid.addEventListener('click', async (e) => {
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
          await loadRelatedProducts(category); // Re-render
          // Update details panel in case it affects current cart status
          await loadProductDetails();
        } catch (err) {
          if (err.message && err.message.toLowerCase().includes('unauthorized')) {
            globalThis.location.assign('index.html');
            return;
          }
          console.error('Related cart add error:', err);
        }
        return;
      }

      if (target.classList.contains('increase') || target.classList.contains('decrease')) {
        e.stopPropagation();
        const cartItem = findCartItemByProductId(productId);
        if (!cartItem) return;
        const isInc = target.classList.contains('increase');
        const nextQty = isInc ? cartItem.quantity + 1 : cartItem.quantity - 1;
        
        try {
          await updateCartItem(productId, nextQty);
          await loadCart();
          await loadRelatedProducts(category);
          await loadProductDetails();
        } catch (err) {
          console.error('Related quantity update error:', err);
        }
        return;
      }

      // Redirection click
      if (target.closest('.product-image-wrapper') || target.closest('.product-name') || target.closest('.product-description') || target.closest('.product-price-section')) {
        globalThis.location.assign(`product.html?id=${productId}`);
      }
    });
  } catch (err) {
    console.error('Failed to load related products:', err);
  }
}

initPage();
