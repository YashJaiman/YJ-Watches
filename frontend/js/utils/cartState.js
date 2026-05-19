/**
 * Cart State Manager
 * Manages cart state and broadcasts updates across pages
 */

const CART_STATE_KEY = 'yjwatches_cart_state';
const CART_UPDATE_EVENT = 'yjwatches:cartUpdated';

/**
 * Get current cart item count
 */
export function getCartCount() {
  try {
    const state = JSON.parse(localStorage.getItem(CART_STATE_KEY) || '{"count":0}');
    return state.count || 0;
  } catch {
    return 0;
  }
}

/**
 * Update cart count and broadcast
 */
export function setCartCount(count) {
  try {
    localStorage.setItem(CART_STATE_KEY, JSON.stringify({ count, timestamp: Date.now() }));
    broadcastCartUpdate(count);
  } catch (err) {
    console.error('Failed to save cart state:', err);
  }
}

/**
 * Broadcast cart update to all open tabs/windows
 */
function broadcastCartUpdate(count) {
  // Trigger custom event for current window
  const event = new CustomEvent(CART_UPDATE_EVENT, { detail: { count } });
  window.dispatchEvent(event);
  
  // Notify other tabs via storage event
  try {
    localStorage.setItem(`${CART_STATE_KEY}_broadcast`, JSON.stringify({ count, timestamp: Date.now() }));
  } catch {}
}

/**
 * Listen for cart updates
 */
export function onCartUpdate(callback) {
  // Listen to same-tab updates
  window.addEventListener(CART_UPDATE_EVENT, (e) => {
    callback(e.detail.count);
  });
  
  // Listen to other-tab updates
  window.addEventListener('storage', (e) => {
    if (e.key === `${CART_STATE_KEY}_broadcast`) {
      try {
        const data = JSON.parse(e.newValue || '{}');
        callback(data.count);
      } catch {}
    }
  });
}

/**
 * Increment cart count
 */
export function incrementCartCount() {
  const current = getCartCount();
  setCartCount(current + 1);
}

/**
 * Decrement cart count
 */
export function decrementCartCount() {
  const current = getCartCount();
  if (current > 0) {
    setCartCount(current - 1);
  }
}

/**
 * Sync cart count from server (use after fetching cart)
 */
export function syncCartCount(cartItems) {
  const count = Array.isArray(cartItems) ? cartItems.length : 0;
  setCartCount(count);
}
