// Utilities
function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// Data and auth (localStorage mock)
const USERS_KEY = 'hm_users';
const SESSION_EMAIL_KEY = 'hm_session_email';

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  return getUsers().find((u) => (u.email || '').toLowerCase() === (email || '').toLowerCase());
}

function createUser(user) {
  const users = getUsers();
  users.push(user);
  setUsers(users);
}

function login(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  sessionStorage.setItem(SESSION_EMAIL_KEY, user.email);
  return user;
}

function logout() {
  sessionStorage.removeItem(SESSION_EMAIL_KEY);
}

function getCurrentUser() {
  const email = sessionStorage.getItem(SESSION_EMAIL_KEY);
  if (!email) return null;
  return findUserByEmail(email);
}

// Theme handling
const THEME_KEY = 'hm_theme';
function applySavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  if (next === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem(THEME_KEY, next);
}

// Page wiring
onReady(() => {
  // Theme init and toggle
  applySavedTheme();
  const themeBtn = qs('#themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const registerForm = qs('#registerForm');
  const loginForm = qs('#loginForm');
  const pageType = document.body?.dataset?.page;

  // Register page
  if (registerForm) {
    const nameInput = qs('#name');
    const emailInput = qs('#email');
    const passwordInput = qs('#password');
    const confirmInput = qs('#confirm');
    const roleInputs = document.getElementsByName('role');
    const message = qs('#registerMessage');

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      message.textContent = '';

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      const role = Array.from(roleInputs).find((r) => r.checked)?.value || 'buyer';

      if (!name || !email || !password || !confirm) {
        message.textContent = 'Please fill in all fields.';
        message.className = 'error';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = 'Please enter a valid email address.';
        message.className = 'error';
        return;
      }

      if (password.length < 6) {
        message.textContent = 'Password must be at least 6 characters.';
        message.className = 'error';
        return;
      }

      if (password !== confirm) {
        message.textContent = 'Passwords do not match.';
        message.className = 'error';
        return;
      }

      if (findUserByEmail(email)) {
        message.textContent = 'An account with this email already exists.';
        message.className = 'error';
        return;
      }

      createUser({ name, email, password, role });
      message.textContent = 'Account created! Redirecting to login...';
      message.className = 'success';
      setTimeout(() => (window.location.href = 'login.html'), 900);
    });
  }

  // Login page
  if (loginForm) {
    const emailInput = qs('#loginEmail');
    const passwordInput = qs('#loginPassword');
    const message = qs('#loginMessage');

    const hintedRole = getQueryParam('role');
    if (hintedRole) {
      const hint = qs('#roleHint');
      if (hint) {
        hint.textContent = `You are signing in as a ${hintedRole}.`;
      }
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      message.textContent = '';
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        message.textContent = 'Please enter email and password.';
        message.className = 'error';
        return;
      }

      const user = login(email, password);
      if (!user) {
        message.textContent = 'Invalid credentials.';
        message.className = 'error';
        return;
      }

      const target = user.role === 'seller' ? 'seller.html' : 'buyer.html';
      window.location.href = target;
    });
  }

  // Protected pages
  if (pageType === 'buyer' || pageType === 'seller') {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    const nameSlot = qs('[data-user-name]');
    if (nameSlot) nameSlot.textContent = user.name || user.email;

    const logoutBtn = qs('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        window.location.href = 'login.html';
      });
    }

    // Simple role guard: if user opens the other role page, allow but show a subtle note
    const roleNote = qs('#roleNote');
    if (roleNote && user.role !== pageType) {
      roleNote.textContent = `Note: Your account role is ${user.role}.`;
    }
  }
});


