// ============================================
// REGISTER PAGE LOGIC
// ============================================

redirectIfLoggedIn();

document.getElementById('togglePass').addEventListener('click', () => {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
});

document.getElementById('password').addEventListener('input', (e) => {
    const val = e.target.value;
    const fill = document.getElementById('strengthFill');
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['#e17055', '#e17055', '#fdcb6e', '#00b894', '#00b894'];
    const widths = [0, 25, 50, 75, 100];
    fill.style.width = widths[score] + '%';
    fill.style.background = colors[score];
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('formError');
    const btn = document.getElementById('registerBtn');

    errorEl.classList.remove('show');
    btn.classList.add('loading');

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Registration failed');

        setSession(data.token, data.user);
        showToast('Account created! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);

    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('show');
        btn.classList.remove('loading');
    }
});