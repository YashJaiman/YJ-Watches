import { login, isAuthenticated } from '../services/authService.js';
import { validateLoginForm } from '../utils/validators.js';
import { showToast, showError, showSuccess } from '../utils/notifications.js';

// Already logged-in users should go straight to Home
if (isAuthenticated()) {
  globalThis.location.replace('Home.html');
}

const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.querySelector('.login-btn');

function setButtonState(isLoading) {
  if (!loginButton) return;
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? 'Signing in...' : 'Login';
}

function getErrorMessage(error) {
  const message = error.message || 'Login failed.';
  if (message.includes('not found') || message.includes('does not exist')) {
    return 'User not found. Please check your email.';
  }
  if (message.includes('password')) {
    return 'Wrong password. Please try again.';
  }
  if (message.includes('email')) {
    return 'Invalid email address.';
  }
  if (message.includes('Invalid email or password')) {
    return 'Invalid email or password.';
  }
  return message;
}

async function handleSubmit(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!validateLoginForm(email, password)) {
    showError('Please enter a valid email and password.');
    return;
  }

  try {
    setButtonState(true);
    await login({ email, password });
    showSuccess('Login successful. Redirecting...');
    setTimeout(() => {
      globalThis.location.href = 'Home.html';
    }, 1500);
  } catch (error) {
    showError(getErrorMessage(error));
  } finally {
    setButtonState(false);
  }
}

const forgotLink = document.querySelector('.forgot-link');

function handleForgotPassword(event) {
  event.preventDefault();
  showToast('We will implement this feature soon.', 'info', 3500);
  event.currentTarget.blur();
}

forgotLink?.addEventListener('click', handleForgotPassword);
form?.addEventListener('submit', handleSubmit);
