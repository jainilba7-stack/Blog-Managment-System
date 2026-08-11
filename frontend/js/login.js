// ============================================
// LOGIN PAGE LOGIC
// ============================================

redirectIfLoggedIn();

document.getElementById('togglePass').addEventListener('click', () => {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('formError');
    const btn = document.getElementById('loginBtn');

    errorEl.classList.remove('show');
    btn.classList.add('loading');

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Login failed');

        setSession(data.token, data.user);
        showToast('Welcome back! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);

    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('show');
        btn.classList.remove('loading');
    }
});