/* =============================================
   ОТЫРАР МУЗЕЙ — MAIN JS
   ============================================= */

/* ── HERO SLIDER ── */
(function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.slider-dot');
  if (!slides.length) return;
  let current = 0, timer;

  function go(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }
  function startAuto() { timer = setInterval(next, 5000); }
  function resetAuto() { clearInterval(timer); startAuto(); }

  document.querySelector('.slider-next')?.addEventListener('click', () => { next(); resetAuto(); });
  document.querySelector('.slider-prev')?.addEventListener('click', () => { prev(); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); resetAuto(); }));

  go(0); startAuto();
})();

/* ── MOBILE NAV ── */
(function initMobileNav() {
  const burger = document.querySelector('.burger');
  const nav    = document.querySelector('.main-nav');
  if (!burger || !nav) return;
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    document.body.classList.toggle('mobile-nav-open');
  });
})();

/* ── COUNTER ANIMATION ── */
(function initCounters() {
  const items = document.querySelectorAll('.num[data-target]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const step = Math.ceil(target / 60);
      const tick = () => {
        start = Math.min(start + step, target);
        el.textContent = (target < 3000 ? start.toString() : start.toLocaleString()) + suffix;
        if (start < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  items.forEach(el => observer.observe(el));
})();

/* ── ADMIN ── */

/* Login */
function adminLogin(event) {
  event ? event.preventDefault() : null;
  const user = document.getElementById('admin-user')?.value;
  const pass = document.getElementById('admin-pass')?.value;
  // Credentials stored in localStorage
  const saved = JSON.parse(localStorage.getItem('otyrar_admin') || '{"user":"admin","pass":"otyrar2024"}');
  if (user === saved.user && pass === saved.pass) {
    sessionStorage.setItem('otyrar_auth', '1');
    window.location.href = 'dashboard.html';
  } else {
    const err = document.getElementById('login-error');
    if (err) err.textContent = 'Логин немесе пароль қате!';
  }
}

function checkAuth() {
  if (!sessionStorage.getItem('otyrar_auth')) {
    window.location.href = 'index.html';
  }
}

function adminLogout() {
  sessionStorage.removeItem('otyrar_auth');
  window.location.href = 'index.html';
}

/* Tab switcher */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.tab-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.tab-content[data-group="${group}"]`).forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });
}

/* News CRUD */
function getNews() {
  return JSON.parse(localStorage.getItem('otyrar_news') || '[]');
}
function saveNews(arr) {
  localStorage.setItem('otyrar_news', JSON.stringify(arr));
}

function renderNewsTable() {
  const tbody = document.getElementById('news-tbody');
  if (!tbody) return;
  const news = getNews();
  if (!news.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:24px">Жаңалық жоқ</td></tr>';
    return;
  }
  tbody.innerHTML = news.map((n, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${n.date}</td>
      <td>${n.title_kk?.substring(0,50) || '—'}…</td>
      <td>
        <span class="badge badge-kk">ҚАЗ</span>
        <span class="badge badge-ru">РУС</span>
        <span class="badge badge-en">ENG</span>
      </td>
      <td>
        <button onclick="editNews(${i})" style="background:var(--gold);border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:13px;font-weight:600">✏️ Өңдеу</button>
        <button onclick="deleteNews(${i})" style="background:#c0392b;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:13px;margin-left:6px">🗑️ Жою</button>
      </td>
    </tr>
  `).join('');
}

function addNewsForm() {
  const form = document.getElementById('news-form-section');
  if (!form) return;
  form.classList.remove('hidden');
  document.getElementById('news-form-title').textContent = 'Жаңа жаңалық қосу';
  document.getElementById('news-edit-index').value = '-1';
  ['kk','ru','en'].forEach(lang => {
    document.getElementById(`news-title-${lang}`).value = '';
    document.getElementById(`news-body-${lang}`).value = '';
  });
  document.getElementById('news-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('news-img').value = '';
  form.scrollIntoView({ behavior: 'smooth' });
}

function editNews(idx) {
  const news = getNews();
  const n = news[idx];
  if (!n) return;
  document.getElementById('news-form-section').classList.remove('hidden');
  document.getElementById('news-form-title').textContent = 'Жаңалықты өңдеу';
  document.getElementById('news-edit-index').value = idx;
  ['kk','ru','en'].forEach(lang => {
    document.getElementById(`news-title-${lang}`).value = n[`title_${lang}`] || '';
    document.getElementById(`news-body-${lang}`).value  = n[`body_${lang}`]  || '';
  });
  document.getElementById('news-date').value = n.date || '';
  document.getElementById('news-img').value  = n.img  || '';
  document.getElementById('news-form-section').scrollIntoView({ behavior: 'smooth' });
}

function saveNewsForm(event) {
  event?.preventDefault();
  const idx = parseInt(document.getElementById('news-edit-index').value);
  const obj = {
    date:     document.getElementById('news-date').value,
    img:      document.getElementById('news-img').value,
    title_kk: document.getElementById('news-title-kk').value,
    body_kk:  document.getElementById('news-body-kk').value,
    title_ru: document.getElementById('news-title-ru').value,
    body_ru:  document.getElementById('news-body-ru').value,
    title_en: document.getElementById('news-title-en').value,
    body_en:  document.getElementById('news-body-en').value,
  };
  const news = getNews();
  if (idx === -1) news.unshift(obj);
  else news[idx] = obj;
  saveNews(news);
  document.getElementById('news-form-section').classList.add('hidden');
  renderNewsTable();
  showAlert('Жаңалық сәтті сақталды! ✅');
}

function deleteNews(idx) {
  if (!confirm('Жаңалықты жою керек пе?')) return;
  const news = getNews();
  news.splice(idx, 1);
  saveNews(news);
  renderNewsTable();
  showAlert('Жаңалық жойылды.', 'warning');
}

function cancelNewsForm() {
  document.getElementById('news-form-section')?.classList.add('hidden');
}

function showAlert(msg, type = 'success') {
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = msg;
  document.querySelector('.admin-content')?.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

/* Change password */
function changePassword(event) {
  event?.preventDefault();
  const oldPass = document.getElementById('old-pass').value;
  const newPass = document.getElementById('new-pass').value;
  const saved = JSON.parse(localStorage.getItem('otyrar_admin') || '{"user":"admin","pass":"otyrar2024"}');
  if (oldPass !== saved.pass) {
    showAlert('Ескі пароль қате!', 'danger'); return;
  }
  saved.pass = newPass;
  localStorage.setItem('otyrar_admin', JSON.stringify(saved));
  showAlert('Пароль өзгертілді! ✅');
}

/* Public news display */
async function renderPublicNews(lang) {
  const container = document.getElementById('public-news-grid');
  if (!container) return;
  let news = getNews();
  if (typeof window.fetchPublicCmsContent === 'function') {
    try {
      const content = await window.fetchPublicCmsContent();
      if (content && Array.isArray(content.otyrar_news)) {
        news = content.otyrar_news;
      }
    } catch {
      // Fallback to local data when backend is unavailable.
    }
  } else {
    try {
      const res = await fetch('/api/public/content');
      if (res.ok) {
        const payload = await res.json();
        if (Array.isArray(payload?.content?.otyrar_news)) {
          news = payload.content.otyrar_news;
        }
      }
    } catch {
      // Keep local fallback.
    }
  }
  if (!news.length) {
    const msgs = { kk: 'Жаңалық жоқ', ru: 'Новостей нет', en: 'No news yet' };
    container.innerHTML = `<p style="color:var(--muted)">${msgs[lang]||''}</p>`;
    return;
  }
  container.innerHTML = news.slice(0, 6).map(n => {
    const title = n[`title_${lang}`] || n.title_kk || '—';
    const body  = n[`body_${lang}`]  || n.body_kk  || '';
    const img   = n.img || '../images/51.jpg';
    return `
      <div class="news-card">
        <div class="news-card-img"><img src="${img}" alt="${title}" loading="lazy"></div>
        <div class="news-card-body">
          <div class="news-date">📅 ${n.date}</div>
          <h3>${title}</h3>
          <p>${body.substring(0,120)}${body.length>120?'…':''}</p>
        </div>
      </div>`;
  }).join('');
}

/* Init on load */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderNewsTable();
  const lang = document.documentElement.lang || 'kk';
  renderPublicNews(lang);
});

/* ============================================
   LIGHTBOX — суретті үлкейту терезесі
   ============================================ */
(function initLightbox() {
  // Lightbox HTML-ін бір рет жасау
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" aria-label="Жабу">✕</button>
    <button class="lb-prev" aria-label="Алдыңғы">‹</button>
    <button class="lb-next" aria-label="Келесі">›</button>
    <img class="lb-img" src="" alt="">
    <div class="lb-counter"></div>
  `;
  // Стиль
  const style = document.createElement('style');
  style.textContent = `
    #lightbox{position:fixed;inset:0;background:rgba(15,10,5,.94);z-index:99999;display:none;align-items:center;justify-content:center}
    #lightbox.open{display:flex}
    #lightbox .lb-img{max-width:90vw;max-height:85vh;border-radius:8px;box-shadow:0 10px 50px rgba(0,0,0,.6);object-fit:contain;animation:lbZoom .25s ease}
    @keyframes lbZoom{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
    #lightbox button{position:absolute;background:rgba(255,255,255,.12);color:#fff;border:none;cursor:pointer;border-radius:50%;transition:.2s;display:flex;align-items:center;justify-content:center}
    #lightbox button:hover{background:var(--gold,#C9973A)}
    #lightbox .lb-close{top:24px;right:28px;width:48px;height:48px;font-size:24px}
    #lightbox .lb-prev,#lightbox .lb-next{top:50%;transform:translateY(-50%);width:56px;height:56px;font-size:38px;line-height:1}
    #lightbox .lb-prev{left:24px}
    #lightbox .lb-next{right:24px}
    #lightbox .lb-counter{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);color:#fff;background:rgba(0,0,0,.5);padding:6px 16px;border-radius:20px;font-size:14px;font-family:'Noto Sans',sans-serif}
    @media(max-width:600px){
      #lightbox .lb-prev{left:8px;width:44px;height:44px;font-size:30px}
      #lightbox .lb-next{right:8px;width:44px;height:44px;font-size:30px}
      #lightbox .lb-close{top:12px;right:12px;width:42px;height:42px}
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('.lb-img');
  const lbCounter = lb.querySelector('.lb-counter');
  let images = [];
  let current = 0;

  function collectImages() {
    // Галереядағы барлық суретті жинау
    images = Array.from(document.querySelectorAll('.gallery-grid img, .gallery-item img'));
  }

  function show(i) {
    if (!images.length) return;
    current = (i + images.length) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt || '';
    lbCounter.textContent = (current + 1) + ' / ' + images.length;
  }

  function open(i) {
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  // Галерея суреттерін басқанда ашу
  document.addEventListener('click', function(e) {
    const img = e.target.closest('.gallery-grid img, .gallery-item img');
    if (img) {
      e.preventDefault();
      collectImages();
      const idx = images.indexOf(img);
      open(idx >= 0 ? idx : 0);
    }
  });

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
