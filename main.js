/* ============================================================
   MAIN SITE RENDERER
   Reads data via loadPortfolioData() (see data.js) and injects
   it into the DOM. Re-run renderSite() any time data changes
   (e.g. live preview from the admin panel).
   ============================================================ */

const ICONS = {
  github: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.95 3.2 9.15 7.66 10.64.56.1.76-.24.76-.54v-1.9c-3.12.68-3.78-1.5-3.78-1.5-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.4-1.22.72-1.5-2.49-.28-5.11-1.25-5.11-5.55 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.11 1.16a10.8 10.8 0 0 1 5.66 0c2.16-1.46 3.11-1.16 3.11-1.16.61 1.54.23 2.68.11 2.96.72.78 1.16 1.78 1.16 3 0 4.31-2.63 5.27-5.13 5.54.41.36.77 1.05.77 2.12v3.15c0 .3.2.65.76.54A11.27 11.27 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
  email: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2 4h20a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2.4V18h18V6.4l-8.4 6.3a1 1 0 0 1-1.2 0L3 6.4zm.8-.4 7.2 5.4L18.2 6H3.8z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.06 2.2.27 3.03 1.1.84.83 1.05 1.86 1.1 3.03.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.06 1.17-.27 2.2-1.1 3.03-.83.84-1.86 1.05-3.03 1.1-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.06-2.2-.27-3.03-1.1-.84-.83-1.05-1.86-1.1-3.03C2.96 14.6 2.95 14.2 2.95 11s0-3.6.07-4.85c.06-1.17.27-2.2 1.1-3.03.83-.84 1.86-1.05 3.03-1.1C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.52 0-4.76.07-.96.04-1.48.21-1.83.35a3.3 3.3 0 0 0-1.21.78 3.3 3.3 0 0 0-.78 1.21c-.14.35-.3.87-.35 1.83C3 9.28 3 9.65 3 12s0 3.15.07 4.39c.04.96.21 1.48.35 1.83a3.3 3.3 0 0 0 .78 1.21 3.3 3.3 0 0 0 1.21.78c.35.14.87.3 1.83.35 1.24.06 1.61.07 4.76.07s3.52 0 4.76-.07c.96-.04 1.48-.21 1.83-.35a3.3 3.3 0 0 0 1.21-.78 3.3 3.3 0 0 0 .78-1.21c.14-.35.3-.87.35-1.83.06-1.24.07-1.61.07-4.39s0-3.52-.07-4.76c-.04-.96-.21-1.48-.35-1.83a3.3 3.3 0 0 0-.78-1.21 3.3 3.3 0 0 0-1.21-.78c-.35-.14-.87-.3-1.83-.35C15.52 4 15.15 4 12 4zm0 3.05A4.95 4.95 0 1 1 7.05 12 4.95 4.95 0 0 1 12 7.05zm0 1.8a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3zm5.4-2.9a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37c-.83.5-1.75.85-2.72 1.04A4.27 4.27 0 0 0 11.7 9.2c0 .4.05.8.13 1.18A12.1 12.1 0 0 1 2.9 5.1a4.26 4.26 0 0 0 1.32 5.7 4.27 4.27 0 0 1-1.93-.53 4.27 4.27 0 0 0 3.42 4.24 4.3 4.3 0 0 1-1.92.07 4.28 4.28 0 0 0 3.98 2.97 8.6 8.6 0 0 1-5.32 1.83A8.7 8.7 0 0 1 1 18.42 12.07 12.07 0 0 0 7.55 20.4c7.86 0 12.16-6.51 12.16-12.16 0-.18 0-.37-.01-.55A8.7 8.7 0 0 0 22.46 6z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-7H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.88h-2.34v7A10 10 0 0 0 22 12z"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 0 0 0 6h3v2h-3a5 5 0 0 1-5-5zm6-1h4v2h-4v-2zm5.1-4h3a5 5 0 0 1 0 10h-3v-2h3a3 3 0 0 0 0-6h-3V7z"/></svg>'
};

const SERVICE_ICONS = {
  code: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 4 2 12 8 20"/><polyline points="16 4 22 12 16 20"/></svg>',
  smartphone: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  pen: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>'
};

function applyTheme(theme){
  const root = document.documentElement;
  if (theme.primary) root.style.setProperty('--primary', theme.primary);
  if (theme.cyan) root.style.setProperty('--cyan', theme.cyan);
  if (theme.pink) root.style.setProperty('--pink', theme.pink);
  if (theme.amber) root.style.setProperty('--amber', theme.amber);
  if (theme.bg) root.style.setProperty('--bg', theme.bg);
}

function esc(str){
  if (str === undefined || str === null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function socialIcon(platform){
  return ICONS[platform] || ICONS.link;
}

function renderSite(data){
  applyTheme(data.theme);
  document.title = data.meta.siteTitle || 'Portfolio';

  renderNav(data);
  renderHero(data);
  renderAbout(data);
  renderSkills(data);
  renderProjects(data);
  renderTimeline(data);
  renderServices(data);
  renderContact(data);
  renderFooter(data);

  initSkillBarObserver();
  initMobileNav();
}

function renderNav(data){
  document.getElementById('nav-logo-text').textContent = data.nav.logoText || data.hero.name;
}

function renderHero(data){
  const h = data.hero;
  document.getElementById('hero-eyebrow').textContent = h.eyebrow;
  document.getElementById('hero-name').textContent = h.name;
  document.getElementById('hero-role').innerHTML = `${esc(h.role)}<span class="blink" aria-hidden="true"></span>`;
  document.getElementById('hero-tagline').textContent = h.tagline;

  const ctaPrimary = document.getElementById('hero-cta-primary');
  ctaPrimary.textContent = h.ctaPrimaryText;
  ctaPrimary.href = h.ctaPrimaryLink || '#projects';

  const ctaSecondary = document.getElementById('hero-cta-secondary');
  ctaSecondary.textContent = h.ctaSecondaryText;
  ctaSecondary.href = h.ctaSecondaryLink || '#contact';

  const ctaResume = document.getElementById('hero-cta-resume');
  if (h.resumeUrl){
    ctaResume.href = h.resumeUrl;
    ctaResume.style.display = '';
  } else {
    ctaResume.style.display = 'none';
  }

  const photoWrap = document.getElementById('hero-photo');
  photoWrap.innerHTML = h.profileImage
    ? `<img src="${esc(h.profileImage)}" alt="${esc(h.name)}">`
    : `<div class="hero-photo-fallback">${esc(initials(h.name))}</div>`;

  const socialsWrap = document.getElementById('hero-socials');
  socialsWrap.innerHTML = (h.socials || []).map(s => `
    <a class="social-icon" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">
      ${socialIcon(s.platform)}
    </a>
  `).join('');
}

function initials(name){
  if (!name) return '';
  return name.trim().split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
}

function renderAbout(data){
  const a = data.about;
  document.getElementById('about-eyebrow').textContent = a.eyebrow;
  document.getElementById('about-heading').textContent = a.heading;
  document.getElementById('about-text').innerHTML = (a.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('');

  const photo = document.getElementById('about-photo');
  photo.innerHTML = a.image
    ? `<img src="${esc(a.image)}" alt="${esc(a.heading)}">`
    : `<div class="about-photo-fallback">${esc(initials(data.hero.name))}</div>`;

  document.getElementById('about-stats').innerHTML = (a.stats || []).map(s => `
    <div class="stat-card">
      <div class="stat-value">${esc(s.value)}</div>
      <div class="stat-label">${esc(s.label)}</div>
    </div>
  `).join('');
}

function renderSkills(data){
  const wrap = document.getElementById('skills-grid');
  wrap.innerHTML = (data.skills || []).map(group => `
    <div class="skill-card">
      <h3>${esc(group.category)}</h3>
      ${(group.items || []).map(item => `
        <div class="skill-item">
          <div class="skill-item-top">
            <span>${esc(item.name)}</span>
            <span>${esc(item.level)}%</span>
          </div>
          <div class="skill-bar"><div class="skill-bar-fill" data-level="${esc(item.level)}"></div></div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderProjects(data){
  const wrap = document.getElementById('projects-grid');
  wrap.innerHTML = (data.projects || []).map(p => `
    <div class="project-card">
      <div class="project-thumb">
        ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}">` : `<span class="project-thumb-fallback">${esc(p.title)}</span>`}
      </div>
      <div class="project-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="project-tags">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="project-links">
          ${p.demoUrl ? `<a href="${esc(p.demoUrl)}" target="_blank" rel="noopener">Live Demo →</a>` : ''}
          ${p.codeUrl ? `<a href="${esc(p.codeUrl)}" target="_blank" rel="noopener">Source Code →</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function renderTimeline(data){
  const expWrap = document.getElementById('experience-list');
  expWrap.innerHTML = (data.experience || []).map(e => `
    <div class="timeline-item">
      <div class="timeline-role">${esc(e.role)}</div>
      <div class="timeline-org">${esc(e.org)}</div>
      <div class="timeline-duration">${esc(e.duration)}</div>
      <div class="timeline-desc">${esc(e.description)}</div>
    </div>
  `).join('');

  const eduWrap = document.getElementById('education-list');
  eduWrap.innerHTML = (data.education || []).map(e => `
    <div class="timeline-item">
      <div class="timeline-role">${esc(e.degree)}</div>
      <div class="timeline-org">${esc(e.institution)}</div>
      <div class="timeline-duration">${esc(e.duration)}</div>
      <div class="timeline-desc">${esc(e.description)}</div>
    </div>
  `).join('');
}

function renderServices(data){
  const wrap = document.getElementById('services-grid');
  const services = data.services || [];
  const section = document.getElementById('services');
  if (!services.length){ section.style.display = 'none'; return; }
  section.style.display = '';
  wrap.innerHTML = services.map(s => `
    <div class="service-card">
      <div class="service-icon">${SERVICE_ICONS[s.icon] || SERVICE_ICONS.code}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.description)}</p>
    </div>
  `).join('');
}

function renderContact(data){
  const c = data.contact;
  document.getElementById('contact-eyebrow').textContent = c.eyebrow;
  document.getElementById('contact-heading').textContent = c.heading;
  document.getElementById('contact-description').textContent = c.description;

  document.getElementById('contact-details').innerHTML = `
    ${c.email ? `<div class="contact-detail"><span class="ic">${ICONS.email}</span> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ''}
    ${c.phone ? `<div class="contact-detail"><span class="ic">${SERVICE_ICONS.smartphone}</span> ${esc(c.phone)}</div>` : ''}
    ${c.location ? `<div class="contact-detail"><span class="ic">${SERVICE_ICONS.globe}</span> ${esc(c.location)}</div>` : ''}
  `;

  document.getElementById('contact-socials').innerHTML = (c.socials || []).map(s => `
    <a class="social-icon" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">
      ${socialIcon(s.platform)}
    </a>
  `).join('');

  const form = document.getElementById('contact-form');
  form.action = c.email ? `mailto:${c.email}` : '#';
}

function renderFooter(data){
  const year = new Date().getFullYear();
  document.getElementById('footer-text').innerHTML = `© ${year} ${esc(data.hero.name)} — ${esc(data.footer.text)}`;
}

function initSkillBarObserver(){
  const bars = document.querySelectorAll('.skill-bar-fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const el = entry.target;
        el.style.width = el.dataset.level + '%';
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
}

function initMobileNav(){
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

function showPreviewBannerIfNeeded(){
  const params = new URLSearchParams(window.location.search);
  if (params.get('preview') === '1'){
    const banner = document.createElement('div');
    banner.className = 'preview-banner';
    banner.innerHTML = 'Preview mode — viewing unsaved changes <a href="admin.html">Back to Admin</a>';
    document.body.appendChild(banner);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const data = loadPortfolioData();
  renderSite(data);
  showPreviewBannerIfNeeded();

  // contact form: simple mailto fallback (no backend)
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value;
    const email = document.getElementById('cf-email').value;
    const message = document.getElementById('cf-message').value;
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
    const mailTarget = data.contact.email || '';
    window.location.href = `mailto:${mailTarget}?subject=${subject}&body=${body}`;
  });
});

// Live-preview support: if admin panel opens this page in an iframe and
// posts updated data, re-render immediately without reload.
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'PORTFOLIO_DATA_UPDATE'){
    renderSite(e.data.payload);
  }
});
