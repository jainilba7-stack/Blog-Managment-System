// ============================================
// SHARED AUTH & UI UTILITIES
// Used on every page
// ============================================

// ---- Token helpers ----
function getToken() {
    return localStorage.getItem('token');
}
function getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
}
function setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
function isLoggedIn() {
    return !!getToken();
}

// ---- Redirect helpers ----
// Call at top of protected pages (dashboard, create-blog)
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}
// Call at top of login/register so logged-in users skip past them
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

// ---- Toast notifications ----
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3200);
}

// ---- Navbar rendering (logged in vs logged out state) ----
function renderNavAuth() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;
    const user = getUser();

    if (user) {
        const initial = (user.name || 'U').charAt(0).toUpperCase();
        navAuth.innerHTML = `
      <div class="user-menu" id="userMenuBtn">
        <div class="avatar-sm">${initial}</div>
      </div>
    `;
        navAuth.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    } else {
        navAuth.innerHTML = `
      <a href="login.html" class="btn btn-outline">Login</a>
      <a href="register.html" class="btn btn-primary">Sign Up</a>
    `;
    }
}

// ---- Mobile hamburger menu ----
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navAuth = document.getElementById('navAuth');
    if (!hamburger) return;
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        if (navAuth) navAuth.classList.toggle('open');
    });
}

// ---- Authenticated fetch wrapper ----
// Automatically attaches JWT token and handles 401 (expired/invalid token)
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        clearSession();
        window.location.href = 'login.html';
        throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

// ---- Run on every page load ----
document.addEventListener('DOMContentLoaded', () => {
    renderNavAuth();
    initMobileMenu();
});