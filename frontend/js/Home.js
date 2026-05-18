import initHomePage from './pages/homePage.js';
import { isAuthenticated } from './services/authService.js';

if (!isAuthenticated()) {
  globalThis.location.replace('index.html');
} else {
  initHomePage();
}
