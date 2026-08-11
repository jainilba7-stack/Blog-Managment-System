// ============================================
// DASHBOARD PAGE LOGIC (protected route)
// ============================================

requireAuth();

let myBlogs = [];
let blogToDelete = null;

async function loadDashboard() {
    const user = getUser();
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('profileName').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profileBio').value = user.bio || '';

    try {
        const data = await apiFetch('/blogs/my-blogs');
        myBlogs = data.blogs || [];
        renderMyBlogs();
        updateStats();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function updateStats() {
    document.getElementById('totalBlogsCount').textContent = myBlogs.length;
    document.getElementById('totalViewsCount').textContent = myBlogs.reduce((s, b) => s + (b.views || 0), 0);
    document.getElementById('totalLikesCount').textContent = myBlogs.reduce((s, b) => s + (b.likes?.length || 0), 0);
}

function renderMyBlogs(filterText = '') {
    const list = document.getElementById('myBlogsList');
    const emptyState = document.getElementById('emptyState');

    let filtered = myBlogs;
    if (filterText) {
        filtered = myBlogs.filter(b => b.title.toLowerCase().includes(filterText.toLowerCase()));
    }

    if (myBlogs.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    list.style.display = 'block';
    emptyState.style.display = 'none';

    if (filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center;color:var(--text-light);padding:30px;">No matches found.</p>`;
        return;
    }

    list.innerHTML = filtered.map(blog => `
    <div class="my-blog-row">
      <img src="${blog.coverImage || 'https://via.placeholder.com/80x60/6C5CE7/fff?text=Blog'}" alt="">
      <div class="my-blog-row-body">
        <h4>${escapeHtml(blog.title)}</h4>
        <span>${blog.category} · ${blog.views || 0} views · ${blog.likes?.length || 0} likes</span>
      </div>
      <div class="my-blog-row-actions">
        <a href="blog.html?id=${blog._id}" class="icon-btn" title="View">👁️</a>
        <a href="create-blog.html?edit=${blog._id}" class="icon-btn" title="Edit">✏️</a>
        <button class="icon-btn danger" title="Delete" onclick="openDeleteModal('${blog._id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

window.openDeleteModal = function (id) {
    blogToDelete = id;
    document.getElementById('deleteModal').classList.add('show');
};

document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('show');
    blogToDelete = null;
});

document.getElementById('confirmDelete').addEventListener('click', async () => {
    if (!blogToDelete) return;
    try {
        await apiFetch(`/blogs/${blogToDelete}`, { method: 'DELETE' });
        myBlogs = myBlogs.filter(b => b._id !== blogToDelete);
        renderMyBlogs();
        updateStats();
        showToast('Blog deleted successfully', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        document.getElementById('deleteModal').classList.remove('show');
        blogToDelete = null;
    }
});

// ---- Tabs ----
document.querySelectorAll('.dash-menu li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelectorAll('.dash-menu li').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        document.getElementById('tab' + li.dataset.tab.charAt(0).toUpperCase() + li.dataset.tab.slice(1)).classList.add('active');
    });
});

// ---- Search my blogs ----
document.getElementById('myBlogSearch').addEventListener('input', (e) => {
    renderMyBlogs(e.target.value.trim());
});

// ---- Profile update ----
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const data = await apiFetch('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({
                name: document.getElementById('profileName').value.trim(),
                bio: document.getElementById('profileBio').value.trim(),
            }),
        });
        setSession(getToken(), data.user);
        document.getElementById('userName').textContent = data.user.name;
        document.getElementById('userAvatar').textContent = data.user.name.charAt(0).toUpperCase();
        showToast('Profile updated!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ---- Logout ----
document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'index.html';
});

document.addEventListener('DOMContentLoaded', loadDashboard);