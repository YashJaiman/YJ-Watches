import { apiClient } from './apiClient.js';

export async function fetchProducts(options = {}) {
  const params = new URLSearchParams();
  if (typeof options === 'string') {
    const search = arguments[0];
    const category = arguments[1];
    if (search) params.set('search', search);
    if (category) params.set('category', category);
  } else {
    const { search, category, brand, priceMin, priceMax, sort, page, limit } = options;
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (sort) params.set('sort', sort);
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
  }

  const query = params.toString();
  return apiClient.get(`/api/products${query ? `?${query}` : ''}`);
}

export async function fetchProductById(id) {
  return apiClient.get(`/api/products/${id}`);
}
