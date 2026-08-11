// ============================================
// CREATE / EDIT BLOG PAGE LOGIC (protected route)
// ============================================

requireAuth();



const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');
let uploadedImageBase64 = '';

document.getElementById('imageFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be under 2MB', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { uploadedImageBase64 = ev.target.result; };
    reader.readAsDataURL(file);
});
// ---- Rich text editor toolbar ----
document.querySelectorAll('.editor-toolbar button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
        document.getElementById('contentEditor').focus();
    });
});

// ---- Load existing blog if editing ----
async function loadForEdit() {
    if (!editId) return;
    document.getElementById('pageTitle').textContent = 'Edit Blog';
    document.getElementById('publishBtn').querySelector('.btn-text').textContent = 'Update Blog';
    document.getElementById('blogId').value = editId;

    try {
        const data = await apiFetch(`/blogs/${editId}`);
        const blog = data.blog;
        document.getElementById('title').value = blog.title;
        document.getElementById('category').value = blog.category;
        document.getElementById('coverImage').value = blog.coverImage || '';
        document.getElementById('description').value = blog.description;
        document.getElementById('contentEditor').innerHTML = blog.content;
        document.getElementById('tags').value = (blog.tags || []).join(', ');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- Submit form ----
document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('publishBtn');
    btn.classList.add('loading');

    const payload = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value,
        coverImage: uploadedImageBase64,
        description: document.getElementById('description').value.trim(),
        content: document.getElementById('contentEditor').innerHTML,
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
        if (editId) {
            await apiFetch(`/blogs/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
            showToast('Blog updated successfully!', 'success');
        } else {
            await apiFetch('/blogs', { method: 'POST', body: JSON.stringify(payload) });
            showToast('Blog published successfully!', 'success');
        }
        setTimeout(() => window.location.href = 'dashboard.html', 900);
    } catch (err) {
        showToast(err.message, 'error');
        btn.classList.remove('loading');
    }
});

document.addEventListener('DOMContentLoaded', loadForEdit);