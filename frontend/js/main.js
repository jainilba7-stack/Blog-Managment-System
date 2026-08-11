// ============================================
// HOME PAGE (index.html) LOGIC
// ============================================

let allBlogs = [];
let currentCategory = 'all';
let currentSearch = '';
let visibleCount = 6;

async function loadBlogs() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    try {
        const data = await apiFetch('/blogs');
        allBlogs = data.blogs || [];
        animateStats(allBlogs);
        renderBlogs();
    } catch (err) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-light);">
      Couldn't load blogs. Is the backend running? (${err.message})
    </p>`;
    }
}

function animateStats(blogs) {
    const totalReads = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    const writers = new Set(blogs.map(b => b.author?._id || b.author)).size;
    animateCounter('statBlogs', blogs.length);
    animateCounter('statWriters', writers);
    animateCounter('statReads', totalReads);
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current;
    }, 30);
}

function renderBlogs() {
    const grid = document.getElementById('blogGrid');
    let filtered = allBlogs;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(b => b.category === currentCategory);
    }
    if (currentSearch) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(b =>
            b.title.toLowerCase().includes(q) ||
            (b.tags || []).some(t => t.toLowerCase().includes(q)) ||
            (b.author?.name || '').toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <h3>No blogs found</h3><p>Try a different search or category.</p>
    </div>`;
        document.getElementById('loadMoreBtn').style.display = 'none';
        return;
    }

    const toShow = filtered.slice(0, visibleCount);
    grid.innerHTML = toShow.map(blogCardHTML).join('');

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.style.display = visibleCount >= filtered.length ? 'none' : 'inline-flex';

    grid.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = `blog.html?id=${card.dataset.id}`;
        });
    });
}

function blogCardHTML(blog) {
    const authorName = blog.author?.name || 'Anonymous';
    const initial = authorName.charAt(0).toUpperCase();
    const img = blog.coverImage || `https://source.unsplash.com/random/400x300/?${blog.category?.toLowerCase() || 'blog'}`;
    const excerpt = (blog.description || '').slice(0, 100);
    const date = new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `
    <div class="blog-card" data-id="${blog._id}">
      <div class="blog-card-img"><img src="${img}" alt="${escapeHtml(blog.title)}" loading="lazy"></div>
      <div class="blog-card-body">
        <span class="blog-card-cat">${blog.category || 'General'}</span>
        <h3>${escapeHtml(blog.title)}</h3>
        <p>${escapeHtml(excerpt)}${excerpt.length >= 100 ? '...' : ''}</p>
        <div class="blog-card-meta">
          <div class="blog-card-author">
            <div class="mini-avatar">${initial}</div>
            <span>${escapeHtml(authorName)}</span>
          </div>
          <span>${date} · ${blog.views || 0} views</span>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

// ---- Event bindings ----
document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                currentSearch = e.target.value.trim();
                visibleCount = 6;
                renderBlogs();
            }, 300);
        });
    }

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.dataset.category;
            visibleCount = 6;
            renderBlogs();
        });
    });

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += 6;
            renderBlogs();
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thanks for subscribing! 🎉', 'success');
            newsletterForm.reset();
        });
    }
});