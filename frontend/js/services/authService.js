import { registerUser, loginUser } from '../api/authApi.js';
import { setAuthToken, clearAuth, getAuthToken, setStoredUser, getStoredUser } from '../utils/authStorage.js';

export async function register({ name, email, password }) {
  const response = await registerUser({ name, email, password });
  setAuthToken(response.token);
  if (response.user) setStoredUser(response.user);
  return response;
}

export async function login({ email, password }) {
  const response = await loginUser({ email, password });
  setAuthToken(response.token);
  if (response.user) setStoredUser(response.user);
  return response;
}

export function logout() {
  clearAuth();
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function getUser() {
  return getStoredUser();
}
