import * as mockBackend from './mockBackend.js';
import { API_BASE_URL, USE_MOCK_API } from './config.js';
import { getAuthToken } from '../utils/authStorage.js';

function buildHeaders(headers = {}) {
  const token = getAuthToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...headers }
    : { 'Content-Type': 'application/json', ...headers };
}

async function fetchApi(path, options = {}) {
  const config = {
    ...options,
    headers: buildHeaders(options.headers),
  };

  if (!USE_MOCK_API) {
    let response;

    try {
      response = await fetch(`${API_BASE_URL}${path}`, config);
    } catch (fetchError) {
      const error = new Error('Network error or backend unavailable');
      error.status = 0;
      throw error;
    }

    const text = await response.text();
    let body = null;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }

    if (!response.ok) {
      const message = body?.message || body?.error || response.statusText || 'API request failed';
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return body;
  }

  return mockBackend.handleRequest(path, config);
}

export const apiClient = {
  get: (path) => fetchApi(path, { method: 'GET' }),
  post: (path, body) => fetchApi(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => fetchApi(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => fetchApi(path, { method: 'DELETE' }),
};
