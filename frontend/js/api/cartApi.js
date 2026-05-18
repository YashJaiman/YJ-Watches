import { apiClient } from './apiClient.js';

export async function fetchCart() {
  return apiClient.get('/api/cart');
}

export async function addCartProduct(productId) {
  return apiClient.post('/api/cart', { productId });
}

export async function updateCartProduct(productId, quantity) {
  return apiClient.put(`/api/cart/${productId}`, { quantity });
}

export async function removeCartProduct(productId) {
  return apiClient.del(`/api/cart/${productId}`);
}
