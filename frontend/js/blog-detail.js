// ============================================
// BLOG DETAIL PAGE LOGIC
// ============================================

const params = new URLSearchParams(window.location.search);
const blogId = params.get('id');

async function loadBlog() {
    const container = document.getElementById('blogContent');
    if (!blogId) {
        container.innerHTML = `<p style="text-align:center;">No blog specified.</p>`;
        return;
    }

    try {
        const data = await apiFetch(`/blogs/${blogId}`);
        renderBlog(data.blog);
        loadRelated(data.blog.category, data.blog._id);
    } catch (err) {
        container.innerHTML = `<p style="text-align:center;color:var(--text-light);">Blog not found. ${err.message}</p>`;
    }
}

function renderBlog(blog) {
    const container = document.getElementById('blogContent');
    const user = getUser();
    const authorName = blog.author?.name || 'Anonymous';
    const initial = authorName.charAt(0).toUpperCase();
    const date = new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const isLiked = user && blog.likes?.includes(user.id);

    container.innerHTML = `
    <span class="blog-detail-cat">${blog.category}</span>
    <h1>${escapeHtml(blog.title)}</h1>
    <div class="blog-detail-meta">
      <div class="author-info">
        <div class="avatar">${initial}</div>
        <div>
          <h4>${escapeHtml(authorName)}</h4>
          <span>${date}</span>
        </div>
      </div>
      <div class="blog-detail-stats">
        <span>👁️ ${blog.views || 0} views</span>
        <span>❤️ ${blog.likes?.length || 0} likes</span>
      </div>
    </div>
    ${blog.coverImage ? `<img src="${blog.coverImage}" class="blog-cover" alt="">` : ''}
    <div class="blog-detail-content">${blog.content}</div>
    ${blog.tags?.length ? `<div class="blog-tags">${blog.tags.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    <div class="engage-bar">
      <button class="like-btn ${isLiked ? 'liked' : ''}" id="likeBtn">
        <span class="heart">${isLiked ? '❤️' : '🤍'}</span>
        <span id="likeCount">${blog.likes?.length || 0}</span> Likes
      </button>
    </div>
  `;

    document.getElementById('likeBtn').addEventListener('click', () => toggleLike(blog._id));
}

async function toggleLike(id) {
    if (!isLoggedIn()) {
        showToast('Please log in to like this blog', 'error');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    try {
        const data = await apiFetch(`/blogs/${id}/like`, { method: 'POST' });
        const btn = document.getElementById('likeBtn');
        const heart = btn.querySelector('.heart');
        document.getElementById('likeCount').textContent = data.likesCount;
        if (data.liked) {
            btn.classList.add('liked');
            heart.textContent = '❤️';
        } else {
            btn.classList.remove('liked');
            heart.textContent = '🤍';
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function loadRelated(category, excludeId) {
    const grid = document.getElementById('relatedGrid');
    try {
        const data = await apiFetch(`/blogs?category=${encodeURIComponent(category)}`);
        const related = (data.blogs || []).filter(b => b._id !== excludeId).slice(0, 3);
        if (related.length === 0) {
            document.querySelector('.related-blogs').style.display = 'none';
            return;
        }
        grid.innerHTML = related.map(blog => `
      <div class="blog-card" onclick="window.location.href='blog.html?id=${blog._id}'">
        <div class="blog-card-img"><img src="${blog.coverImage || 'https://via.placeholder.com/400x300/6C5CE7/fff?text=Blog'}" alt=""></div>
        <div class="blog-card-body">
          <span class="blog-card-cat">${blog.category}</span>
          <h3>${escapeHtml(blog.title)}</h3>
          <p>${escapeHtml((blog.description || '').slice(0, 80))}...</p>
        </div>
      </div>
    `).join('');
    } catch (err) {
        document.querySelector('.related-blogs').style.display = 'none';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadBlog);