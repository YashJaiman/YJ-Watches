import { register, isAuthenticated } from '../services/authService.js';
import { validateFullname, validateEmail, validatePassword } from '../utils/validators.js';
import { showError, showSuccess } from '../utils/notifications.js';

// Already logged-in users should go straight to Home
if (isAuthenticated()) {
  globalThis.location.replace('Home.html');
}

const form = document.getElementById('signupForm');
const fullname = document.getElementById('fullname');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const terms = document.getElementById('terms');
const signupButton = document.querySelector('.signup-btn');

function setButtonState(isLoading) {
  if (!signupButton) return;
  signupButton.disabled = isLoading;
  signupButton.textContent = isLoading ? 'Creating account...' : 'Sign Up';
}

function getErrorMessage(error) {
  const message = error.message || 'Signup failed.';
  if (message.includes('already exists') || message.includes('already')) {
    return 'User with this email already exists.';
  }
  if (message.includes('email')) {
    return 'Invalid email address.';
  }
  return message;
}

async function handleSubmit(event) {
  event.preventDefault();

  const nameValue = fullname.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;

  if (!validateFullname(nameValue)) {
    showError('Enter a valid full name (minimum 3 letters).');
    fullname.focus();
    return;
  }

  if (!validateEmail(emailValue)) {
    showError('Invalid email address.');
    email.focus();
    return;
  }

  if (!validatePassword(passwordValue)) {
    showError('Password must have at least 8 characters including uppercase, lowercase, and number.');
    password.focus();
    return;
  }

  if (passwordValue !== confirmPasswordValue) {
    showError('Passwords do not match.');
    confirmPassword.focus();
    return;
  }

  if (!terms.checked) {
    showError('You must accept Terms & Conditions.');
    terms.focus();
    return;
  }

  try {
    setButtonState(true);
    await register({ name: nameValue, email: emailValue, password: passwordValue });
    showSuccess('Account created successfully. Logging in...');
    setTimeout(() => {
      globalThis.location.href = 'Home.html';
    }, 1500);
  } catch (error) {
    showError(getErrorMessage(error));
  } finally {
    setButtonState(false);
  }
}

form?.addEventListener('submit', handleSubmit);
