import { fetchProducts, fetchProductById } from '../api/productApi.js';

export async function getProducts(options = {}) {
  if (typeof options === 'string') {
    return fetchProducts(arguments[0], arguments[1]);
  }
  return fetchProducts(options);
}

export async function getProductById(id) {
  return fetchProductById(id);
}
