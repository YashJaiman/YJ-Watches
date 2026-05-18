import initCartPage from './pages/cartPage.js';
import { isAuthenticated } from './services/authService.js';

if (!isAuthenticated()) {
  globalThis.location.replace('index.html');
} else {
  initCartPage();
}
