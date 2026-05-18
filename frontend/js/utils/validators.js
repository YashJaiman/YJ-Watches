export function validateFullname(fullname) {
  return /^[A-Za-z ]{3,}$/.test(fullname.trim());
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export function validateLoginForm(email, password) {
  return validateEmail(email) && password.length > 0;
}
