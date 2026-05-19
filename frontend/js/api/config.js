/**
 * ENVIRONMENT CONFIGURATION
 * 
 * Use the deployed backend for production.
 * The production backend is hosted on Render.
 */

const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const PROD_API_BASE_URL = 'https://yj-watches-backend.onrender.com';

export const API_BASE_URL = window.API_BASE_URL || PROD_API_BASE_URL;

export const USE_MOCK_API = false;
