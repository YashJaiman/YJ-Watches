import { getCart } from './services/cartService.js';

const orderIdEl = document.getElementById('orderId');
const orderItemsEl = document.getElementById('orderItems');
const orderTotalEl = document.getElementById('orderTotal');
const confettiContainer = document.getElementById('confetti');

function generateOrderId() {
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `#YJW-${random}`;
}

function createConfettiParticles() {
  if (!confettiContainer) return;

  const particleCount = 22;
  const width = confettiContainer.clientWidth;
  const height = confettiContainer.clientHeight;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('span');
    const size = Math.floor(Math.random() * 8) + 6;
    const left = Math.random() * width;
    const delay = Math.random() * 0.6;
    const duration = Math.random() * 1.2 + 2.4;
    const opacity = Math.random() * 0.5 + 0.5;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}px`;
    particle.style.top = `${Math.random() * height * 0.5 + 20}px`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.opacity = opacity;

    confettiContainer.appendChild(particle);
  }
}

async function initOrderSuccess() {
  const orderId = generateOrderId();
  if (orderIdEl) orderIdEl.textContent = orderId;

  let totalItems = 0;
  let totalAmount = 0;

  try {
    const cart = await getCart();
    if (Array.isArray(cart) && cart.length > 0) {
      totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      totalAmount = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    }
  } catch (error) {
    console.warn('Unable to load order summary:', error.message || error);
  }

  if (orderItemsEl) {
    orderItemsEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  }

  if (orderTotalEl) {
    orderTotalEl.textContent = `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  createConfettiParticles();
}

initOrderSuccess();
