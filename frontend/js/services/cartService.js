import { fetchCart, addCartProduct, updateCartProduct, removeCartProduct } from '../api/cartApi.js';

function normalizeCartResponse(cartResponse) {
  if (Array.isArray(cartResponse)) {
    return cartResponse;
  }
  return cartResponse?.items || [];
}

export async function getCart() {
  return normalizeCartResponse(await fetchCart());
}

export async function addToCart(productId) {
  return normalizeCartResponse(await addCartProduct(productId));
}

export async function updateCartItem(productId, quantity) {
  return normalizeCartResponse(await updateCartProduct(productId, quantity));
}

export async function removeCartItem(productId) {
  return normalizeCartResponse(await removeCartProduct(productId));
}
