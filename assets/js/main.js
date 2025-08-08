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

// Enhanced animations and interactions
function addLoadingState(button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.innerHTML = '<span class="loading-spinner"></span> Loading...';
  return () => {
    button.disabled = false;
    button.textContent = originalText;
  };
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
  `;
  
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  }
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Enhanced form validation with real-time feedback
function setupFormValidation(form) {
  const inputs = form.querySelectorAll('input, select');
  
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name || field.id;
  let isValid = true;
  let errorMessage = '';
  
  // Remove existing error styling
  field.classList.remove('error');
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Validation rules
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
  } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address';
  } else if (field.type === 'password' && value && value.length < 6) {
    isValid = false;
    errorMessage = 'Password must be at least 6 characters';
  }
  
  if (!isValid) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = errorMessage;
    errorDiv.style.cssText = `
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      animation: fadeIn 0.3s ease;
    `;
    field.parentNode.appendChild(errorDiv);
  }
  
  return isValid;
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
  
  // Add theme transition animation
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  setTimeout(() => {
    document.body.style.transition = '';
  }, 300);
}

// Enhanced page interactions
function setupPageInteractions() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Enhanced card interactions
  document.querySelectorAll('.card, .listing-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Enhanced button interactions
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Add ripple effect
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// Page wiring
onReady(() => {
  // Theme init and toggle
  applySavedTheme();
  const themeBtn = qs('#themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
    // Update theme button icon
    const updateThemeIcon = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const icon = themeBtn.querySelector('.icon');
      if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
      }
    };
    updateThemeIcon();
    // Listen for theme changes
    const observer = new MutationObserver(updateThemeIcon);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // Setup page interactions
  setupPageInteractions();

  const registerForm = qs('#registerForm');
  const loginForm = qs('#loginForm');
  const pageType = document.body?.dataset?.page;

  // Register page
  if (registerForm) {
    setupFormValidation(registerForm);
    
    const nameInput = qs('#name');
    const emailInput = qs('#email');
    const passwordInput = qs('#password');
    const confirmInput = qs('#confirm');
    const roleInputs = document.getElementsByName('role');
    const message = qs('#registerMessage');

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      message.textContent = '';
      message.className = '';

      // Validate all fields
      const fields = [nameInput, emailInput, passwordInput, confirmInput];
      const isValid = fields.every(field => validateField(field));

      if (!isValid) {
        showNotification('Please fix the errors above', 'error');
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      const role = Array.from(roleInputs).find((r) => r.checked)?.value || 'buyer';

      if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
      }

      if (findUserByEmail(email)) {
        showNotification('An account with this email already exists', 'error');
        return;
      }

      // Add loading state
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const removeLoading = addLoadingState(submitBtn);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      createUser({ name, email, password, role });
      showNotification('Account created successfully!', 'success');
      
      removeLoading();
      
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }

  // Login page
  if (loginForm) {
    setupFormValidation(loginForm);
    
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

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      message.textContent = '';
      message.className = '';
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
      }

      // Add loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const removeLoading = addLoadingState(submitBtn);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = login(email, password);
      if (!user) {
        showNotification('Invalid credentials', 'error');
        removeLoading();
        return;
      }

      showNotification(`Welcome back, ${user.name}!`, 'success');
      removeLoading();

      setTimeout(() => {
        const target = user.role === 'seller' ? 'seller.html' : 'buyer.html';
        window.location.href = target;
      }, 1000);
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
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      });
    }

    // Simple role guard: if user opens the other role page, allow but show a subtle note
    const roleNote = qs('#roleNote');
    if (roleNote && user.role !== pageType) {
      roleNote.textContent = `Note: Your account role is ${user.role}.`;
    }
  }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .field-error {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    animation: fadeIn 0.3s ease;
  }
  
  input.error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
  }
`;
document.head.appendChild(style);


