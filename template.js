/* =============================================
   SHARED TEMPLATES — header & footer
   ============================================= */

const MUSEUM_LANGS = {
  kk: {
    root: '../',
    home: 'Басты бет',
    news: 'ЖАҢАЛЫҚТАР',
    about: 'Музей Туралы',
    heritage: 'ТАРИХИ-МӘДЕНИ МҰРАЛАРЫ',
    science: 'ҒЫЛЫМИ ЖҰМЫСТАРЫ',
    media: 'МЕДИА',
    director: 'ДИРЕКТОР БЛОГЫ',
    ticket: 'Билет алу',
    contact: 'Байланыс',
    address: 'Түркістан облысы, Отырар ауданы, Шәуілдір ауылы, Жібек жолы №1',
    worktime: 'ДБ-ЖБ: 9:00 – 18:00',
    phone: '+7 725 44 21 150',
    rights: '© 2024 Отырар Мемлекеттік Археологиялық Музей-Қорығы. Барлық құқықтар қорғалған.',
    museum_history: 'Музей Тарихы',
    norm_acts: 'Нормативтік-Құқықтық актілер',
    structure: 'Музейдің құрылымы',
    rules: 'Музей қонақтарының ережесі',
    charter: 'Музей Жарғысы',
    plan: 'ЖОСПАР',
    otrar: 'ОТЫРАР ҚАЛАЖҰРТЫ',
    arystanbab: 'Арыстанбаб',
    ancient: 'Ежелгі Отырар қаласы',
    oksyz: 'Оқсыз қалажұрты',
    biography: 'Өмірбаян',
    qa: 'Сұрақ-жауап',
    documents: 'Құжаттар',
    nav_label_home: '/',
    nav_label_ru: '/ru/',
    nav_label_en: '/en/',
  },
  ru: {
    root: '../',
    home: 'Главная',
    news: 'НОВОСТИ',
    about: 'О Музее',
    heritage: 'ИСТОРИКО-КУЛЬТУРНОЕ НАСЛЕДИЕ',
    science: 'НАУЧНЫЕ ТРУДЫ',
    media: 'МЕДИА',
    director: 'БЛОГ ДИРЕКТОРА',
    ticket: 'Купить билет',
    contact: 'Контакты',
    address: 'Туркестанская обл., Отрарский р-н, с. Шаульдер, пр. Шёлкового пути №1',
    worktime: 'ПН-ВС: 9:00 – 18:00',
    phone: '+7 725 44 21 150',
    rights: '© 2024 Отрарский государственный археологический музей-заповедник. Все права защищены.',
    museum_history: 'История Музея',
    norm_acts: 'Нормативно-Правовые акты',
    structure: 'Структура Музея',
    rules: 'Правила посещения',
    charter: 'Устав Музея',
    plan: 'ПЛАН',
    otrar: 'ГОРОДИЩЕ ОТРАР',
    arystanbab: 'Арыстанбаб',
    ancient: 'Древний город Отрар',
    oksyz: 'Городище Оксыз',
    biography: 'Биография',
    qa: 'Вопросы и ответы',
    documents: 'Документы',
  },
  en: {
    root: '../',
    home: 'Home',
    news: 'NEWS',
    about: 'About Museum',
    heritage: 'HISTORICAL HERITAGE',
    science: 'SCIENTIFIC WORKS',
    media: 'MEDIA',
    director: 'DIRECTOR\'S BLOG',
    ticket: 'Buy Ticket',
    contact: 'Contact',
    address: 'Turkestan Region, Otrar District, Shaulder Village, Silk Road Ave. №1',
    worktime: 'Mon–Sun: 9:00 – 18:00',
    phone: '+7 725 44 21 150',
    rights: '© 2024 Otrar State Archaeological Museum-Reserve. All rights reserved.',
    museum_history: 'Museum History',
    norm_acts: 'Regulatory Documents',
    structure: 'Museum Structure',
    rules: 'Visitor Rules',
    charter: 'Museum Charter',
    plan: 'PLAN',
    otrar: 'OTRAR SETTLEMENT',
    arystanbab: 'Arystanbab',
    ancient: 'Ancient City of Otrar',
    oksyz: 'Oksyz Settlement',
    biography: 'Biography',
    qa: 'Q&A',
    documents: 'Documents',
  }
};

function normalizeImgPath(img) {
  if (!img) return '../images/51.jpg';
  if (img.startsWith('http') || img.startsWith('../')) return img;
  return `../images/${img}`;
}

async function fetchCmsPublicContent() {
  try {
    const res = await fetch('/api/public/content');
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.content || null;
  } catch {
    return null;
  }
}

function renderNewsFromCms(content, lang) {
  const grid = document.getElementById('public-news-grid');
  if (!grid) return;
  const news = Array.isArray(content?.otyrar_news) ? content.otyrar_news : [];
  if (!news.length) return;
  const staticGrid = document.getElementById('static-news-grid');
  if (staticGrid) staticGrid.style.display = 'none';
  grid.style.display = '';
  grid.innerHTML = news.map(n => {
    const title = n[`title_${lang}`] || n.title_kk || n.title_ru || n.title_en || '—';
    const body = n[`body_${lang}`] || n.body_kk || n.body_ru || n.body_en || '';
    return `<div class="card"><img src="${normalizeImgPath(n.img)}" alt=""><div class="card-body"><div class="card-date">📅 ${n.date || ''}</div><h3>${title}</h3><p>${body.substring(0,120)}${body.length>120?'…':''}</p></div></div>`;
  }).join('');
}

function renderGalleryFromCms(content) {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;
  const gallery = Array.isArray(content?.otyrar_gallery) ? content.otyrar_gallery : [];
  if (!gallery.length) return;
  grid.innerHTML = gallery.map(item => `<img src="${normalizeImgPath(item.img)}" alt="${item.caption || 'Museum image'}" loading="lazy">`).join('');
}

function renderScienceFromCms(content, lang) {
  if (!location.pathname.endsWith('/science.html')) return;
  const pageBody = document.querySelector('.page-body');
  const firstPub = document.querySelector('.pub-item');
  if (!pageBody || !firstPub) return;
  const items = Array.isArray(content?.otyrar_science) ? content.otyrar_science : [];
  if (!items.length) return;
  const old = pageBody.querySelectorAll('.pub-item');
  old.forEach(el => el.remove());
  const html = items.map((s, i) => {
    const title = s[`title_${lang}`] || s.title_kk || s.title_ru || s.title_en || '—';
    const desc = s[`desc_${lang}`] || s.desc_kk || s.desc_ru || s.desc_en || '';
    return `<div class="pub-item"><div class="pub-num">${i + 1}</div><div class="pub-content"><h3>${title}</h3><p>${desc}</p><div class="pub-meta">📅 ${s.year || ''}</div></div></div>`;
  }).join('');
  firstPub.insertAdjacentHTML('beforebegin', html);
}

function renderDirectorFromCms(content, lang) {
  if (!location.pathname.endsWith('/director.html')) return;
  const d = content?.otyrar_director || null;
  if (d && Object.keys(d).length) {
    const name = d[`name_${lang}`] || d.name_kk || d.name_ru || d.name_en || '';
    const pos = d[`pos_${lang}`] || d.pos_kk || d.pos_ru || d.pos_en || '';
    const bio = d[`bio_${lang}`] || d.bio_kk || d.bio_ru || d.bio_en || '';
    const img = document.querySelector('.director-img img');
    const nameEl = document.querySelector('.director-name');
    const posEl = document.querySelector('.director-pos');
    if (img) img.src = normalizeImgPath(d.img);
    if (nameEl) nameEl.textContent = name;
    if (posEl) posEl.textContent = pos;
    const bioWrap = posEl ? posEl.parentElement : null;
    if (bioWrap) {
      bioWrap.querySelectorAll('.director-bio').forEach(el => el.remove());
      bioWrap.insertAdjacentHTML('beforeend', bio.split('\n').filter(Boolean).map(line => `<p class="director-bio">${line}</p>`).join('') || `<p class="director-bio">${bio}</p>`);
    }
  }

  const qa = Array.isArray(content?.otyrar_qa) ? content.otyrar_qa : [];
  const qaSection = document.getElementById('qa');
  if (qaSection && qa.length) {
    const title = qaSection.querySelector('.section-title');
    qaSection.querySelectorAll('.qa-item').forEach(el => el.remove());
    const qaHtml = qa.map(item => {
      const q = item[`q_${lang}`] || item.q_kk || item.q_ru || item.q_en || '';
      const a = item[`a_${lang}`] || item.a_kk || item.a_ru || item.a_en || '';
      return `<div class="qa-item"><div class="qa-q">${q}</div><div class="qa-a">${a}</div></div>`;
    }).join('');
    if (title) title.insertAdjacentHTML('afterend', qaHtml);
  }
}

function renderHeritageFromCms(content, lang) {
  if (!location.pathname.endsWith('/heritage.html')) return;
  const items = Array.isArray(content?.otyrar_heritage) ? content.otyrar_heritage : [];
  if (!items.length) return;
  const pageBody = document.querySelector('.page-body');
  if (!pageBody) return;
  pageBody.querySelectorAll('.heritage-item').forEach(el => el.remove());
  const html = items.map((h, idx) => {
    const title = h[`title_${lang}`] || h.title_kk || h.title_ru || h.title_en || '—';
    const text = h[`text_${lang}`] || h.text_kk || h.text_ru || h.text_en || '';
    const badge = lang === 'ru' ? 'Историческое место' : (lang === 'en' ? 'Historical Site' : 'Тарихи орын');
    const id = h.id || `heritage-${idx + 1}`;
    return `<div id="${id}" class="heritage-item ${idx % 2 ? 'reverse' : ''}"><img src="${normalizeImgPath(h.img)}" alt="${title}"><div class="heritage-text"><div class="heritage-badge">${badge}</div><h2>${title}</h2><p>${text}</p></div></div>`;
  }).join('');
  pageBody.insertAdjacentHTML('beforeend', html);
}

function renderContactFromCms(content, lang) {
  if (!location.pathname.endsWith('/contact.html')) return;
  const c = content?.otyrar_contact || null;
  if (!c || !Object.keys(c).length) return;
  const rows = document.querySelectorAll('.contact-block .c-row');
  if (rows.length >= 5) {
    const hours = c[`hours_${lang}`] || c.hours_kk || c.hours_ru || '';
    const addr = c[`addr_${lang}`] || c.addr_kk || c.addr_ru || c.addr_en || '';
    const phoneLink = rows[1].querySelector('a');
    const emailLink = rows[2].querySelector('a');
    const addrSpan = rows[0].querySelector('span');
    const hoursSpan = rows[3].querySelector('span');
    const ticketLink = rows[4].querySelector('a');
    if (addrSpan) addrSpan.textContent = addr;
    if (phoneLink) {
      phoneLink.textContent = c.phone || phoneLink.textContent;
      phoneLink.href = `tel:${(c.phone || '').replace(/\s+/g, '')}`;
    }
    if (emailLink) {
      emailLink.textContent = c.email || emailLink.textContent;
      emailLink.href = `mailto:${c.email || ''}`;
    }
    if (hoursSpan) hoursSpan.textContent = hours;
    if (ticketLink && c.ticket) ticketLink.href = c.ticket;
  }
}

async function applyPublicCmsBindings(lang) {
  const content = await fetchCmsPublicContent();
  if (!content) return;
  renderNewsFromCms(content, lang);
  renderGalleryFromCms(content);
  renderScienceFromCms(content, lang);
  renderDirectorFromCms(content, lang);
  renderHeritageFromCms(content, lang);
  renderContactFromCms(content, lang);
}

function buildHeader(lang) {
  const t = MUSEUM_LANGS[lang];
  const paths = {
    kk: { home: '../kk/index.html', news: '../kk/news.html', heritage: '../kk/heritage.html', about: '../kk/about.html', media: '../kk/media.html', director: '../kk/director.html', science: '../kk/science.html', contact: '../kk/contact.html', documents: '../kk/documents.html' },
    ru: { home: '../ru/index.html', news: '../ru/news.html', heritage: '../ru/heritage.html', about: '../ru/about.html', media: '../ru/media.html', director: '../ru/director.html', science: '../ru/science.html', contact: '../ru/contact.html', documents: '../ru/documents.html' },
    en: { home: '../en/index.html', news: '../en/news.html', heritage: '../en/heritage.html', about: '../en/about.html', media: '../en/media.html', director: '../en/director.html', science: '../en/science.html', contact: '../en/contact.html', documents: '../en/documents.html' },
  };
  const p = paths[lang];
  const activeLang = (l) => l === lang ? 'active' : '';
  return `
<div class="topbar">
  <div class="inner">
    <div class="contact-topbar">
      📞 ${t.phone} &nbsp;|&nbsp; ✉ Otrar_muzey@mail.ru
    </div>
    <div class="lang-switch">
      <a href="${paths.kk.home}" class="${activeLang('kk')}">ҚАЗ</a>
      <a href="${paths.ru.home}" class="${activeLang('ru')}">РУС</a>
      <a href="${paths.en.home}" class="${activeLang('en')}">ENG</a>
    </div>
    <div class="social-links">
      <a href="https://facebook.com" target="_blank" rel="noopener" title="Facebook">📘</a>
      <a href="https://instagram.com" target="_blank" rel="noopener" title="Instagram">📷</a>
      <a href="https://youtube.com" target="_blank" rel="noopener" title="YouTube">▶</a>
    </div>
  </div>
</div>

<header class="site-header">
  <div class="header-inner">
    <a href="${p.home}" class="logo-wrap">
      <img src="../images/Logo4.jpg" alt="Отырар Музей логотипі">
      <div class="logo-text-wrap">
        <span class="logo-title">ОТЫРАР</span>
        <span class="logo-sub">Мемлекеттік музей-қорығы</span>
      </div>
    </a>
    <nav class="main-nav" id="main-nav">
      <ul>
        <li><a href="${p.home}">${t.home}</a></li>
        <li>
          <a href="${p.news}">${t.news} <span class="arr">▾</span></a>
          <ul class="dropdown">
            <li><a href="${p.news}">${lang==='kk'?'Музей жаңалықтары':lang==='ru'?'Новости музея':'Museum News'}</a></li>
            <li><a href="https://www.gov.kz/memleket/entities/mam" target="_blank">${lang==='kk'?'Министрлік жаңалықтары':lang==='ru'?'Новости министерства':'Ministry News'}</a></li>
          </ul>
        </li>
        <li>
          <a href="${p.about}">${t.about} <span class="arr">▾</span></a>
          <ul class="dropdown">
            <li><a href="${p.about}#history">${t.museum_history}</a></li>
            <li><a href="${p.about}#structure">${t.structure}</a></li>
            <li><a href="${p.about}#rules">${t.rules}</a></li>
            <li><a href="${p.about}#charter">${t.charter}</a></li>
            <li><a href="${p.about}#plan">${t.plan}</a></li>
            <li><a href="${p.documents}">${t.documents}</a></li>
          </ul>
        </li>
        <li>
          <a href="${p.heritage}">${t.heritage} <span class="arr">▾</span></a>
          <ul class="dropdown">
            <li><a href="${p.heritage}#otrar">${t.otrar}</a></li>
            <li><a href="${p.heritage}#arystanbab">${t.arystanbab}</a></li>
            <li><a href="${p.heritage}#ancient">${t.ancient}</a></li>
            <li><a href="${p.heritage}#oksyz">${t.oksyz}</a></li>
          </ul>
        </li>
        <li><a href="${p.science}">${t.science}</a></li>
        <li><a href="${p.media}">${t.media}</a></li>
        <li>
          <a href="${p.director}">${t.director} <span class="arr">▾</span></a>
          <ul class="dropdown">
            <li><a href="${p.director}#bio">${t.biography}</a></li>
            <li><a href="${p.director}#qa">${t.qa}</a></li>
          </ul>
        </li>
        <li><a href="https://m.ticketon.kz/event/ortahasyrlyk-otyrar-madeniet-arystanbab" target="_blank" class="btn-ticket">${t.ticket}</a></li>
      </ul>
    </nav>
    <button class="burger" id="burger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
}

function buildFooter(lang) {
  const t = MUSEUM_LANGS[lang];
  const paths = {
    kk: { home: '../kk/index.html', news: '../kk/news.html', about: '../kk/about.html', heritage: '../kk/heritage.html', media: '../kk/media.html', contact: '../kk/contact.html' },
    ru: { home: '../ru/index.html', news: '../ru/news.html', about: '../ru/about.html', heritage: '../ru/heritage.html', media: '../ru/media.html', contact: '../ru/contact.html' },
    en: { home: '../en/index.html', news: '../en/news.html', about: '../en/about.html', heritage: '../en/heritage.html', media: '../en/media.html', contact: '../en/contact.html' },
  };
  const p = paths[lang];
  return `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="logo-title">ОТЫРАР</div>
      <p>${lang==='kk'?'«Отырар» мемлекеттік археологиялық музей-қорығы – Ұлы Жібек жолының тарихын сақтаушы.':lang==='ru'?'«Отрарский» государственный археологический музей-заповедник — хранитель истории Великого Шёлкового пути.':'The Otrar State Archaeological Museum-Reserve — guardian of the Great Silk Road heritage.'}</p>
    </div>
    <div class="footer-col">
      <h4>${lang==='kk'?'Навигация':lang==='ru'?'Навигация':'Navigation'}</h4>
      <ul>
        <li><a href="${p.home}">${t.home}</a></li>
        <li><a href="${p.news}">${t.news}</a></li>
        <li><a href="${p.about}">${t.about}</a></li>
        <li><a href="${p.heritage}">${t.heritage}</a></li>
        <li><a href="${p.media}">${t.media}</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>${lang==='kk'?'Байланыс':lang==='ru'?'Контакты':'Contact'}</h4>
      <ul>
        <li><a>📍 ${t.address}</a></li>
        <li><a href="tel:+77254421150">📞 ${t.phone}</a></li>
        <li><a href="mailto:Otrar_muzey@mail.ru">✉ Otrar_muzey@mail.ru</a></li>
        <li><a>🕐 ${t.worktime}</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>${lang==='kk'?'Тіл':lang==='ru'?'Язык':'Language'}</h4>
      <ul>
        <li><a href="../kk/index.html">🇰🇿 Қазақша</a></li>
        <li><a href="../ru/index.html">🇷🇺 Русский</a></li>
        <li><a href="../en/index.html">🇬🇧 English</a></li>
      </ul>
      <div style="margin-top:20px">
        <h4>${lang==='kk'?'Әлеуметтік желілер':lang==='ru'?'Соц. сети':'Social'}</h4>
        <div style="display:flex;gap:12px;margin-top:8px">
          <a href="https://facebook.com" target="_blank" style="font-size:24px">📘</a>
          <a href="https://instagram.com" target="_blank" style="font-size:24px">📷</a>
          <a href="https://youtube.com" target="_blank" style="font-size:24px">▶</a>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>${t.rights}</p>
    <p><a href="../admin/index.html" style="color:#5a4a3a;font-size:12px">${lang==='kk'?'Әкімші панелі':lang==='ru'?'Панель администратора':'Admin Panel'}</a></p>
  </div>
</footer>`;
}

// Auto-inject into pages that use data-lang
document.addEventListener('DOMContentLoaded', () => {
  const lang = document.documentElement.getAttribute('lang') || 'kk';
  const headerEl = document.getElementById('site-header-placeholder');
  const footerEl = document.getElementById('site-footer-placeholder');
  if (headerEl) headerEl.innerHTML = buildHeader(lang);
  if (footerEl) footerEl.innerHTML = buildFooter(lang);

  // Mobile burger (needs re-attach after inject)
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('main-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      document.body.classList.toggle('mobile-nav-open');
    });
  }

  applyPublicCmsBindings(lang);
});
