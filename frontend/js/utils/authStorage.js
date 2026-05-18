const AUTH_TOKEN_KEY = 'yjwatches_auth_token';
const AUTH_USER_KEY = 'yjwatches_user';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function removeStoredUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function clearAuth() {
  removeAuthToken();
  removeStoredUser();
}
