/**
 * ENVIRONMENT CONFIGURATION
 * 
 * For local development, this defaults to 'http://localhost:5000/api'.
 * 
 * For Production Deployment (Vercel/Netlify):
 * 1. Change the fallback string below to your deployed backend URL.
 *    Example: 'https://yj-watches-backend.onrender.com'
 * 2. OR inject it dynamically via window.API_BASE_URL before this script loads.
 */

const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

export const API_BASE_URL = window.API_BASE_URL 
  || (IS_PRODUCTION ? 'https://your-production-backend-url.com' : 'http://localhost:5000');

export const USE_MOCK_API = false;
