// frontend/src/utils/api.js

// Save username locally
export function saveUsername(username) {
  localStorage.setItem('username', username);
}

// Get saved username
export function getUsername() {
  return localStorage.getItem('username');
}

// Clear username
export function clearUsername() {
  localStorage.removeItem('username');
}
