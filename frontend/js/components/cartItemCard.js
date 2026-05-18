const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80';

export function createCartItemCard(item) {
  const el = document.createElement('div');
  el.classList.add('cart-item');
  // data-id used consistently — cartPage.js reads this via closest('[data-id]')
  el.dataset.id = item.id;

  const itemTotal = (item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const unitPrice  = item.price.toLocaleString('en-US', { minimumFractionDigits: 2 });

  el.innerHTML = `
    <div class="cart-item-image-wrap">
      <img
        src="${item.image || FALLBACK_IMG}"
        alt="${item.name}"
        loading="lazy"
        onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
        class="cart-item-img"
      >
    </div>

    <div class="cart-info">
      <h4 class="cart-item-name">${item.name}</h4>
      <p class="cart-item-price">$${unitPrice} each</p>
      ${item.category ? `<span class="cart-item-badge">${item.category}</span>` : ''}
    </div>

    <div class="quantity-control" data-id="${item.id}">
      <button class="decrease" aria-label="Decrease quantity" title="Decrease quantity">−</button>
      <span class="qty">${item.quantity}</span>
      <button class="increase" aria-label="Increase quantity" title="Increase quantity">+</button>
    </div>

    <div class="item-total">$${itemTotal}</div>

    <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove ${item.name} from cart" title="Remove item">✕</button>
  `;

  return el;
}
