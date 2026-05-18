export function createProductCard(product, cartItem) {
  const card = document.createElement('div');
  card.classList.add('product-card');
  card.dataset.id = product._id || product.id;

  const fallbackImage = 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80';

  card.innerHTML = `
    <div class="product-image-wrapper">
      <img src="${product.image || fallbackImage}" alt="${product.name}" loading="lazy" onerror="this.src='${fallbackImage}';" class="product-image">
      <div class="glow-effect"></div>
    </div>
    <div class="product-info">
      <h4 class="product-name">${product.name}</h4>
      ${product.description ? `<p class="product-description">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</p>` : ''}
      <div class="product-price-section">
        <h5 class="product-price">$${(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h5>
        ${product.stock !== undefined ? `<span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>` : ''}
      </div>
      <div class="product-actions">
        ${cartItem ? `
          <div class="quantity-control" data-id="${product._id || product.id}">
            <button class="decrease" aria-label="Decrease quantity" title="Decrease quantity">−</button>
            <span class="qty">${cartItem.quantity}</span>
            <button class="increase" aria-label="Increase quantity" title="Increase quantity">+</button>
          </div>
        ` : `
          <button class="add-to-cart-btn" data-id="${product._id || product.id}" aria-label="Add ${product.name} to cart" title="Add to cart">Add to Cart</button>
        `}
      </div>
    </div>
  `;

  return card;
}
