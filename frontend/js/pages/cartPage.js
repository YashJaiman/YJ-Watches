import { getCart, updateCartItem, removeCartItem } from '../services/cartService.js';
import { createCartItemCard } from '../components/cartItemCard.js';
import { showError, showSuccess, showToast } from '../utils/notifications.js';

const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');

let cartItems = [];
let isMutating = false;

// ── Render ────────────────────────────────────────────────────────────────────

function renderCart() {
  cartItemsContainer.innerHTML = '';

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <a href="Home.html" class="continue-shopping-btn">Browse Products</a>
      </div>
    `;
    if (cartTotal) cartTotal.textContent = '0.00';
    if (cartCount) cartCount.textContent = '0 items';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('disabled');
    }
    return;
  }

  let total = 0;
  let totalQty = 0;
  cartItems.forEach((item) => {
    total += item.price * item.quantity;
    totalQty += item.quantity;
    cartItemsContainer.appendChild(createCartItemCard(item));
  });

  if (cartTotal) cartTotal.textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
  if (cartCount) cartCount.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;
  if (checkoutBtn) {
    checkoutBtn.disabled = cartItems.length === 0;
    checkoutBtn.classList.toggle('disabled', cartItems.length === 0);
  }
}

function showLoadingState() {
  cartItemsContainer.innerHTML = `
    <div class="cart-loading">
      <div class="cart-loading-spinner"></div>
      <p>Loading your cart...</p>
    </div>
  `;
}

// ── Data ──────────────────────────────────────────────────────────────────────

async function refreshCart(silent = false) {
  if (!silent) showLoadingState();
  try {
    cartItems = await getCart();
    renderCart();
  } catch (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('unauthorized') || msg.includes('token') || error.status === 401) {
      globalThis.location.assign('index.html');
      return;
    }
    showError(error.message || 'Unable to retrieve cart.');
    cartItems = [];
    renderCart();
  }
}

// ── Event handling ─────────────────────────────────────────────────────────────

/**
 * Read the product ID from the closest element with [data-id].
 * IDs are MongoDB ObjectId strings — never convert to Number().
 */
function getProductId(target) {
  return target.closest('[data-id]')?.dataset.id || null;
}

cartItemsContainer.addEventListener('click', async (event) => {
  if (isMutating) return;

  const target = event.target;
  const productId = getProductId(target);
  if (!productId) return;

  // Match by string comparison — MongoDB _id values are strings
  const cartItem = cartItems.find((item) => String(item.id) === String(productId));
  if (!cartItem) return;

  isMutating = true;

  try {
    if (target.classList.contains('cart-remove-btn') || target.closest('.cart-remove-btn')) {
      await removeCartItem(productId);
      await refreshCart(true);
      showToast(`"${cartItem.name}" removed from cart.`, 'info');

    } else if (target.classList.contains('increase')) {
      await updateCartItem(productId, cartItem.quantity + 1);
      await refreshCart(true);
      showToast('Quantity updated.', 'success');

    } else if (target.classList.contains('decrease')) {
      const newQty = cartItem.quantity - 1;
      if (newQty <= 0) {
        await removeCartItem(productId);
        showToast(`"${cartItem.name}" removed from cart.`, 'info');
      } else {
        await updateCartItem(productId, newQty);
        showToast('Quantity updated.', 'success');
      }
      await refreshCart(true);
    }
  } catch (error) {
    showError(error.message || 'Could not update cart.');
  } finally {
    isMutating = false;
  }
});

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (checkoutBtn.disabled || isMutating) return;
    checkoutBtn.disabled = true;
    checkoutBtn.classList.add('loading');
    checkoutBtn.textContent = 'Processing...';

    setTimeout(() => {
      globalThis.location.assign('order-success.html');
    }, 1600);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initCartPage() {
  refreshCart();
}

export default initCartPage;
