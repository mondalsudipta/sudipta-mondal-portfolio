// ── Page Router ──────────────────────────────────────────────────────────────
const pages = ['about', 'research', 'publications', 'cv'];
const navLinks = document.querySelectorAll('nav a[data-page]');
const contentEl = document.getElementById('content');

async function loadPage(page) {
  if (!pages.includes(page)) page = 'about';

  // Update nav active state
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === page));

  // Update URL hash
  history.pushState({ page }, '', `#${page}`);
  document.title = `Sudipta Mondal — ${page.charAt(0).toUpperCase() + page.slice(1)}`;

  // Fetch and inject page fragment
  contentEl.classList.add('loading');
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error('Page not found');
    const html = await res.text();
    contentEl.innerHTML = html;
    contentEl.classList.remove('loading');

    // Wrap zoomable images after content loads
    initLightboxImages();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Add fade-in class
    const inner = contentEl.firstElementChild;
    if (inner) { inner.classList.remove('page-fade'); void inner.offsetWidth; inner.classList.add('page-fade'); }

  } catch (e) {
    contentEl.innerHTML = '<div class="container"><p style="color:var(--ink-soft); padding-top:60px;">Page could not be loaded.</p></div>';
    contentEl.classList.remove('loading');
  }
}

// Nav clicks
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    loadPage(link.dataset.page);
  });
});

// Browser back/forward
window.addEventListener('popstate', e => {
  const page = e.state?.page || location.hash.replace('#', '') || 'about';
  loadPage(page);
});

// Initial load from hash
const initialPage = location.hash.replace('#', '') || 'about';
loadPage(initialPage);


// ── Lightbox ─────────────────────────────────────────────────────────────────
function initLightboxImages() {
  document.querySelectorAll(
    '.cs-img-col img, .cs-single-img img, .cs-sketch-pair img'
  ).forEach(img => {
    if (img.closest('.cs-zoomable')) return; // already wrapped
    const wrapper = document.createElement('span');
    wrapper.className = 'cs-zoomable';
    const icon = document.createElement('span');
    icon.className = 'cs-zoom-icon';
    icon.innerHTML = '<i class="fas fa-search-plus"></i>';
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(icon);
    wrapper.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
}

function openLightbox(src, caption) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-img').alt = caption || '';
  document.getElementById('lightbox-caption').textContent = caption || '';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && e.target === document.getElementById('lightbox-img')) return;
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


// ── Abstract toggle ───────────────────────────────────────────────────────────
function toggleAbstract(btn) {
  const abs = btn.nextElementSibling;
  const open = abs.classList.toggle('open');
  btn.textContent = open ? '▾ Hide abstract' : '▸ Show abstract';
}


// ── BibTeX copy ───────────────────────────────────────────────────────────────
function copyBibtex(e, id) {
  e.preventDefault();
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = e.target.closest('a');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
}