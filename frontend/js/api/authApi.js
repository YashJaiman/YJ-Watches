import { apiClient } from './apiClient.js';

export async function registerUser(payload) {
  return apiClient.post('/api/auth/signup', payload);
}

export async function loginUser(payload) {
  return apiClient.post('/api/auth/login', payload);
}
