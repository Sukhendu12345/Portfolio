/* ============================================================
   ADMIN PANEL LOGIC
   ============================================================ */

let state = loadPortfolioData();
let isDirty = false;

/* ---------- path helpers ---------- */
function getByPath(obj, path){
  return path.split('.').reduce((o,k)=> (o == null ? undefined : o[isNaN(k) ? k : Number(k)]), obj);
}
function setByPath(obj, path, value){
  const keys = path.split('.');
  let o = obj;
  for (let i=0; i<keys.length-1; i++){
    const k = isNaN(keys[i]) ? keys[i] : Number(keys[i]);
    o = o[k];
  }
  const last = keys[keys.length-1];
  o[isNaN(last) ? last : Number(last)] = value;
}

function esc(str){
  if (str === undefined || str === null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ---------- dirty state / toast ---------- */
function markDirty(){
  isDirty = true;
  document.getElementById('dirty-dot').classList.add('show');
}
function clearDirty(){
  isDirty = false;
  document.getElementById('dirty-dot').classList.remove('show');
}
function toast(msg){
  const t = document.getElementById('admin-toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.remove('show'), 2600);
}

/* ============================================================
   FIELD BUILDERS (return HTML strings)
   ============================================================ */
function fieldText(label, path, value, opts={}){
  const type = opts.type || 'text';
  return `<div class="field">
    <label>${esc(label)}</label>
    <input type="${type}" data-path="${esc(path)}" ${opts.dataType ? `data-type="${opts.dataType}"` : ''} value="${esc(value)}" placeholder="${esc(opts.placeholder||'')}">
    ${opts.hint ? `<div class="hint">${esc(opts.hint)}</div>` : ''}
  </div>`;
}

function fieldTextarea(label, path, value, opts={}){
  return `<div class="field">
    <label>${esc(label)}</label>
    <textarea data-path="${esc(path)}" ${opts.type ? `data-type="${opts.type}"` : ''} placeholder="${esc(opts.placeholder||'')}">${esc(value)}</textarea>
    ${opts.hint ? `<div class="hint">${esc(opts.hint)}</div>` : ''}
  </div>`;
}

function fieldNumber(label, path, value, opts={}){
  return `<div class="field">
    <label>${esc(label)}</label>
    <input type="number" data-path="${esc(path)}" data-type="number" value="${esc(value)}" min="${opts.min ?? 0}" max="${opts.max ?? 100}">
  </div>`;
}

function fieldSelect(label, path, value, options){
  return `<div class="field">
    <label>${esc(label)}</label>
    <select data-path="${esc(path)}">
      ${options.map(o => `<option value="${esc(o.value)}" ${o.value===value?'selected':''}>${esc(o.label)}</option>`).join('')}
    </select>
  </div>`;
}

function fieldColor(label, path, value){
  return `<div class="field">
    <label>${esc(label)}</label>
    <div class="color-field">
      <input type="color" data-path="${esc(path)}" data-colorsync="1" value="${esc(value)}">
      <input type="text" data-path="${esc(path)}" data-colorsync="1" value="${esc(value)}">
    </div>
  </div>`;
}

function fieldImage(label, path, value, opts={}){
  const previewId = 'imgprev_' + path.replace(/[.\[\]]/g, '_');
  return `<div class="field">
    <label>${esc(label)}</label>
    <div class="image-field-preview" id="${previewId}">
      ${value ? `<img src="${esc(value)}" alt="">` : `<span>প্রিভিউ নেই</span>`}
    </div>
    <div class="image-field-actions">
      <input type="text" data-path="${esc(path)}" data-imgpreview="${previewId}" placeholder="ছবির URL দিন (https://...)" value="${esc(value)}" style="flex:1;">
    </div>
    <div class="image-field-actions">
      <input type="file" accept="image/*" data-imgupload="${esc(path)}" data-imgpreview="${previewId}">
      <button class="btn-admin btn-admin--sm btn-admin--ghost" type="button" data-action="clear-image" data-path="${esc(path)}" data-imgpreview="${previewId}">মুছুন</button>
    </div>
    <div class="hint">ছবির লিংক (URL) দিন, অথবা ফাইল আপলোড করুন। ছোট ছবি (৫০০KB এর কম) ব্যবহার করুন — আপলোড করা ছবি ব্রাউজার স্টোরেজে সেভ হয়।</div>
  </div>`;
}

function repRemoveBtn(path){
  return `<button class="btn-admin btn-admin--sm btn-admin--danger" type="button" data-action="remove-item" data-path="${esc(path)}">✕ মুছুন</button>`;
}
function repAddBtn(path, label){
  return `<button class="btn-admin btn-admin--primary" type="button" data-action="add-item" data-path="${esc(path)}">+ ${esc(label)}</button>`;
}

const SOCIAL_PLATFORMS = [
  { value:'github', label:'GitHub' },
  { value:'linkedin', label:'LinkedIn' },
  { value:'twitter', label:'Twitter / X' },
  { value:'facebook', label:'Facebook' },
  { value:'instagram', label:'Instagram' },
  { value:'youtube', label:'YouTube' },
  { value:'email', label:'ইমেইল' },
  { value:'link', label:'অন্য লিংক / ওয়েবসাইট' }
];

const SERVICE_ICON_OPTIONS = [
  { value:'code', label:'কোড </>' },
  { value:'smartphone', label:'মোবাইল অ্যাপ' },
  { value:'cpu', label:'ইলেকট্রনিক্স / সিপিইউ' },
  { value:'globe', label:'গ্লোব / ওয়েব' },
  { value:'camera', label:'ক্যামেরা / ফটো' },
  { value:'pen', label:'ডিজাইন / পেন' }
];

function renderSocialCard(arrPath, i, s){
  const path = `${arrPath}.${i}`;
  return `<div class="rep-card">
    <div class="rep-card-head"><span class="rep-title">লিংক #${i+1}</span>${repRemoveBtn(path)}</div>
    <div class="field-row">
      ${fieldSelect('প্ল্যাটফর্ম', `${path}.platform`, s.platform, SOCIAL_PLATFORMS)}
      ${fieldText('লেবেল', `${path}.label`, s.label)}
    </div>
    ${fieldText('URL', `${path}.url`, s.url)}
  </div>`;
}

/* ============================================================
   ADD-ITEM TEMPLATES
   ============================================================ */
const ADD_TEMPLATES = {
  'hero.socials': () => ({ platform:'link', label:'Website', url:'https://' }),
  'contact.socials': () => ({ platform:'link', label:'Website', url:'https://' }),
  'about.stats': () => ({ value:'0', label:'New Stat' }),
  'skills': () => ({ category:'New Category', items:[{ name:'New Skill', level:50 }] }),
  'projects': () => ({ title:'New Project', description:'', image:'', tags:[], demoUrl:'', codeUrl:'' }),
  'experience': () => ({ role:'', org:'', duration:'', description:'' }),
  'education': () => ({ degree:'', institution:'', duration:'', description:'' }),
  'services': () => ({ icon:'code', title:'New Service', description:'' })
};

/* ============================================================
   PANEL RENDERERS
   ============================================================ */
function renderSitePanel(){
  const m = state.meta, th = state.theme, nav = state.nav, footer = state.footer;
  document.getElementById('panel-site').innerHTML = `
    <h2>সাইট সেটিংস ও থিম</h2>
    <p class="panel-desc">ওয়েবসাইটের নাম, থিম কালার এবং ফুটার টেক্সট পরিবর্তন করুন। কালার পরিবর্তন সাথে সাথে পুরো সাইটে প্রভাব ফেলবে।</p>
    ${fieldText('সাইটের টাইটেল (ব্রাউজার ট্যাবে দেখাবে)', 'meta.siteTitle', m.siteTitle)}
    ${fieldText('নেভবার লোগো টেক্সট', 'nav.logoText', nav.logoText, { hint:'উদাহরণ: আপনার নামের শর্ট ফর্ম, যেমন "AS"' })}
    <hr class="admin-divider">
    <h3 style="font-family:var(--font-display); margin-bottom:14px;">থিম কালার</h3>
    <div class="field-row">
      ${fieldColor('প্রাইমারি (Primary)', 'theme.primary', th.primary)}
      ${fieldColor('সায়ান (Cyan)', 'theme.cyan', th.cyan)}
    </div>
    <div class="field-row">
      ${fieldColor('পিংক (Pink)', 'theme.pink', th.pink)}
      ${fieldColor('অ্যাম্বার (Amber)', 'theme.amber', th.amber)}
    </div>
    ${fieldColor('ব্যাকগ্রাউন্ড (Background)', 'theme.bg', th.bg)}
    <hr class="admin-divider">
    ${fieldText('ফুটার টেক্সট', 'footer.text', footer.text)}
  `;
}

function renderHeroPanel(){
  const h = state.hero;
  document.getElementById('panel-hero').innerHTML = `
    <h2>হিরো সেকশন</h2>
    <p class="panel-desc">ওয়েবসাইট খোলার সাথে সাথে সবার প্রথমে যা দেখা যায়।</p>
    ${fieldText('Eyebrow টেক্সট (নামের উপরের ছোট লাইন)', 'hero.eyebrow', h.eyebrow)}
    ${fieldText('আপনার নাম', 'hero.name', h.name)}
    ${fieldText('পদবী / রোল', 'hero.role', h.role)}
    ${fieldTextarea('ট্যাগলাইন', 'hero.tagline', h.tagline)}
    <div class="field-row">
      ${fieldText('প্রাইমারি বাটনের টেক্সট', 'hero.ctaPrimaryText', h.ctaPrimaryText)}
      ${fieldText('প্রাইমারি বাটনের লিংক', 'hero.ctaPrimaryLink', h.ctaPrimaryLink, { hint:'যেমন #projects বা https://...' })}
    </div>
    <div class="field-row">
      ${fieldText('সেকেন্ডারি বাটনের টেক্সট', 'hero.ctaSecondaryText', h.ctaSecondaryText)}
      ${fieldText('সেকেন্ডারি বাটনের লিংক', 'hero.ctaSecondaryLink', h.ctaSecondaryLink)}
    </div>
    ${fieldImage('প্রোফাইল ছবি', 'hero.profileImage', h.profileImage)}
    ${fieldText('Resume / CV লিংক (ঐচ্ছিক)', 'hero.resumeUrl', h.resumeUrl, { hint:'Google Drive / PDF লিংক দিলে "Download CV" বাটন দেখাবে' })}
    <hr class="admin-divider">
    <h3 style="font-family:var(--font-display); margin-bottom:14px;">সোশ্যাল লিংক</h3>
    <div class="rep-list">
      ${(h.socials||[]).map((s,i)=>renderSocialCard('hero.socials', i, s)).join('')}
    </div>
    ${repAddBtn('hero.socials','সোশ্যাল লিংক যুক্ত করুন')}
  `;
}

function renderAboutPanel(){
  const a = state.about;
  document.getElementById('panel-about').innerHTML = `
    <h2>আমার পরিচিতি (About)</h2>
    <p class="panel-desc">নিজের সম্পর্কে লিখুন এবং পরিসংখ্যান (stats) যুক্ত করুন।</p>
    ${fieldText('Eyebrow টেক্সট', 'about.eyebrow', a.eyebrow)}
    ${fieldText('হেডিং', 'about.heading', a.heading)}
    ${fieldTextarea('বায়ো — প্রতিটি প্যারাগ্রাফ নতুন লাইনে লিখুন', 'about.paragraphs', (a.paragraphs||[]).join('\n'), { type:'lines', hint:'প্রতিটি লাইন আলাদা প্যারাগ্রাফ হিসেবে দেখাবে' })}
    ${fieldImage('আমার ছবি', 'about.image', a.image)}
    <hr class="admin-divider">
    <h3 style="font-family:var(--font-display); margin-bottom:14px;">স্ট্যাটস (Stats)</h3>
    <div class="rep-list">
      ${(a.stats||[]).map((s,i)=>`
        <div class="rep-card">
          <div class="rep-card-head"><span class="rep-title">স্ট্যাট #${i+1}</span>${repRemoveBtn(`about.stats.${i}`)}</div>
          <div class="field-row">
            ${fieldText('ভ্যালু', `about.stats.${i}.value`, s.value, { hint:'যেমন: 3+, 100%, 10' })}
            ${fieldText('লেবেল', `about.stats.${i}.label`, s.label)}
          </div>
        </div>
      `).join('')}
    </div>
    ${repAddBtn('about.stats','স্ট্যাট যুক্ত করুন')}
  `;
}

function renderSkillsPanel(){
  const skills = state.skills || [];
  document.getElementById('panel-skills').innerHTML = `
    <h2>স্কিল</h2>
    <p class="panel-desc">স্কিল ক্যাটাগরি তৈরি করুন এবং প্রতিটি স্কিলের লেভেল (০-১০০) সেট করুন।</p>
    <div class="rep-list">
      ${skills.map((cat,ci)=>`
        <div class="rep-card">
          <div class="rep-card-head"><span class="rep-title">ক্যাটাগরি #${ci+1}</span>${repRemoveBtn(`skills.${ci}`)}</div>
          ${fieldText('ক্যাটাগরির নাম', `skills.${ci}.category`, cat.category)}
          <div class="rep-sub">
            ${(cat.items||[]).map((item,ii)=>`
              <div class="field-row" style="align-items:flex-end;">
                ${fieldText('স্কিলের নাম', `skills.${ci}.items.${ii}.name`, item.name)}
                ${fieldNumber('লেভেল %', `skills.${ci}.items.${ii}.level`, item.level, { min:0, max:100 })}
                <div class="field" style="flex:0 0 auto;">${repRemoveBtn(`skills.${ci}.items.${ii}`)}</div>
              </div>
            `).join('')}
            ${repAddBtn(`skills.${ci}.items`,'স্কিল যুক্ত করুন')}
          </div>
        </div>
      `).join('')}
    </div>
    ${repAddBtn('skills','নতুন ক্যাটাগরি যুক্ত করুন')}
  `;
}

function renderProjectsPanel(){
  const projects = state.projects || [];
  document.getElementById('panel-projects').innerHTML = `
    <h2>প্রজেক্ট</h2>
    <p class="panel-desc">আপনার তৈরি প্রজেক্টগুলো এখানে যুক্ত করুন।</p>
    <div class="rep-list">
      ${projects.map((p,i)=>`
        <div class="rep-card">
          <div class="rep-card-head"><span class="rep-title">প্রজেক্ট #${i+1}</span>${repRemoveBtn(`projects.${i}`)}</div>
          ${fieldText('টাইটেল', `projects.${i}.title`, p.title)}
          ${fieldTextarea('বর্ণনা', `projects.${i}.description`, p.description)}
          ${fieldImage('স্ক্রিনশট / ছবি', `projects.${i}.image`, p.image)}
          ${fieldText('ট্যাগ (কমা দিয়ে আলাদা করুন)', `projects.${i}.tags`, (p.tags||[]).join(', '), { dataType:'csv', hint:'যেমন: Flutter, Firebase, API' })}
          <div class="field-row">
            ${fieldText('Live Demo লিংক', `projects.${i}.demoUrl`, p.demoUrl)}
            ${fieldText('Source Code লিংক', `projects.${i}.codeUrl`, p.codeUrl)}
          </div>
        </div>
      `).join('')}
    </div>
    ${repAddBtn('projects','নতুন প্রজেক্ট যুক্ত করুন')}
  `;
}

function renderExperiencePanel(){
  const exp = state.experience || [], edu = state.education || [];
  document.getElementById('panel-experience').innerHTML = `
    <h2>অভিজ্ঞতা ও শিক্ষা</h2>
    <p class="panel-desc">কর্ম অভিজ্ঞতা এবং শিক্ষাগত যোগ্যতা যুক্ত করুন — এটি টাইমলাইন হিসেবে দেখাবে।</p>
    <h3 style="font-family:var(--font-display); margin-bottom:14px;">অভিজ্ঞতা (Experience)</h3>
    <div class="rep-list">
      ${exp.map((e,i)=>`
        <div class="rep-card">
          <div class="rep-card-head"><span class="rep-title">#${i+1}</span>${repRemoveBtn(`experience.${i}`)}</div>
          <div class="field-row">
            ${fieldText('পদবী / রোল', `experience.${i}.role`, e.role)}
            ${fieldText('সময়কাল', `experience.${i}.duration`, e.duration, { hint:'যেমন: 2024 – Present' })}
          </div>
          ${fieldText('প্রতিষ্ঠানের নাম', `experience.${i}.org`, e.org)}
          ${fieldTextarea('বর্ণনা', `experience.${i}.description`, e.description)}
        </div>
      `).join('')}
    </div>
    ${repAddBtn('experience','অভিজ্ঞতা যুক্ত করুন')}
    <hr class="admin-divider">
    <h3 style="font-family:var(--font-display); margin-bottom:14px;">শিক্ষা (Education)</h3>
    <div class="rep-list">
      ${edu.map((e,i)=>`
        <div class="rep-card">
          <div class="rep-card-head"><span class="rep-title">#${i+1}</span>${repRemoveBtn(`education.${i}`)}</div>
          <div class="field-row">
            ${fieldText('ডিগ্রি / কোর্স', `education.${i}.degree`, e.degree)}
            ${fieldText('সময়কাল', `education.${i}.duration`, e.duration)}
          </div>
          ${fieldText('প্রতিষ্ঠানের নাম', `education.${i}.institution`, e.institution)}
          ${fieldTextarea('বর্ণনা', `education.${i}.description`, e.description)}
        </div>
      `).join('')}
    </div>
    ${repAddBtn('education','শিক্ষা যুক্ত করুন')}
  `;
}

function renderServicesPanel(){
  const services = state.services || [];
  document.getElementById('panel-services').innerHTML = `
    <h2>সার্ভিস</h2>
    <p class="panel-desc">আপনি কী কী কাজ করেন তা এখানে দেখান। সব মুছে দিলে সাইটে এই সেকশন দেখাবে না।</p>
    <div class="rep-list">
      ${services.map((s,i)=>`
        <div class="rep-card">
          <div class="rep-card-head"><span class="rep-title">#${i+1}</span>${repRemoveBtn(`services.${i}`)}</div>
          <div class="field-row">
            ${fieldSelect('আইকন', `services.${i}.icon`, s.icon, SERVICE_ICON_OPTIONS)}
            ${fieldText('টাইটেল', `services.${i}.title`, s.title)}
          </div>
          ${fieldTextarea('বর্ণনা', `services.${i}.description`, s.description)}
        </div>
      `).join('')}
    </div>
    ${repAddBtn('services','সার্ভিস যুক্ত করুন')}
  `;
}

function renderContactPanel(){
  const c = state.contact;
  document.getElementById('panel-contact').innerHTML = `
    <h2>যোগাযোগ</h2>
    <p class="panel-desc">কন্টাক্ট সেকশনের তথ্য ও সোশ্যাল লিংক।</p>
    ${fieldText('Eyebrow', 'contact.eyebrow', c.eyebrow)}
    ${fieldText('হেডিং', 'contact.heading', c.heading)}
    ${fieldTextarea('বর্ণনা', 'contact.description', c.description)}
    <div class="field-row">
      ${fieldText('ইমেইল', 'contact.email', c.email, { type:'email' })}
      ${fieldText('ফোন নম্বর', 'contact.phone', c.phone)}
    </div>
    ${fieldText('লোকেশন', 'contact.location', c.location)}
    <hr class="admin-divider">
    <h3 style="font-family:var(--font-display); margin-bottom:14px;">সোশ্যাল লিংক</h3>
    <div class="rep-list">
      ${(c.socials||[]).map((s,i)=>renderSocialCard('contact.socials', i, s)).join('')}
    </div>
    ${repAddBtn('contact.socials','সোশ্যাল লিংক যুক্ত করুন')}
  `;
}

function renderDataPanel(){
  document.getElementById('panel-data').innerHTML = `
    <h2>ডেটা ম্যানেজমেন্ট</h2>
    <p class="panel-desc">আপনার সব কন্টেন্ট JSON ফাইলে এক্সপোর্ট/ইম্পোর্ট করুন।</p>
    <div class="help-box">
      <b>মনে রাখবেন:</b> এই অ্যাডমিন প্যানেলের সব তথ্য আপনার ব্রাউজারের লোকাল স্টোরেজে সেভ হয়। ওয়েবসাইট অন্য কোথাও হোস্ট করার আগে এখানে এডিট করে <b>"Export"</b> করে নিন, তারপর সেই JSON ফাইলটি হোস্টেড সাইটের অ্যাডমিন প্যানেলে <b>"Import"</b> করুন — যাতে দুই জায়গায় একই কন্টেন্ট থাকে।
    </div>
    <div class="field">
      <button class="btn-admin btn-admin--primary" type="button" id="export-btn">⬇ JSON এক্সপোর্ট করুন</button>
    </div>
    <div class="field">
      <label>JSON ইম্পোর্ট করুন</label>
      <input type="file" accept="application/json" id="import-file">
    </div>
    <hr class="admin-divider">
    <div class="danger-zone">
      <h3>সব ডিফল্টে রিসেট করুন</h3>
      <p>আপনার সব এডিট করা কন্টেন্ট মুছে গিয়ে শুরুর ডেমো কন্টেন্টে ফিরে যাবে। এটি ফিরিয়ে আনা যাবে না — আগে এক্সপোর্ট করে নিন।</p>
      <button class="btn-admin btn-admin--danger" type="button" id="reset-btn">⚠ ডিফল্টে রিসেট করুন</button>
    </div>
  `;
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-file').addEventListener('change', importData);
  document.getElementById('reset-btn').addEventListener('click', resetData);
}

function renderSecurityPanel(){
  document.getElementById('panel-security').innerHTML = `
    <h2>পাসওয়ার্ড পরিবর্তন</h2>
    <p class="panel-desc">অ্যাডমিন প্যানেলে লগইন করার পাসওয়ার্ড পরিবর্তন করুন।</p>
    <div class="field">
      <label>বর্তমান পাসওয়ার্ড</label>
      <input type="password" id="pw-current">
    </div>
    <div class="field">
      <label>নতুন পাসওয়ার্ড</label>
      <input type="password" id="pw-new">
    </div>
    <div class="field">
      <label>নতুন পাসওয়ার্ড আবার লিখুন</label>
      <input type="password" id="pw-confirm">
    </div>
    <div class="login-error" id="pw-error"></div>
    <button class="btn-admin btn-admin--primary" type="button" id="pw-save-btn">পাসওয়ার্ড পরিবর্তন করুন</button>
    <div class="help-box" style="margin-top:20px;">
      এই পাসওয়ার্ড আপনার ব্রাউজারে সেভ থাকে। অন্য ডিভাইস/ব্রাউজারে অ্যাডমিন প্যানেল খুললে ডিফল্ট পাসওয়ার্ড (<b>admin123</b>) কাজ করবে, যদি না আপনি সেখানেও পরিবর্তন করেন।
    </div>
  `;
  document.getElementById('pw-save-btn').addEventListener('click', () => {
    const cur = document.getElementById('pw-current').value;
    const next = document.getElementById('pw-new').value;
    const confirmPw = document.getElementById('pw-confirm').value;
    const errEl = document.getElementById('pw-error');
    errEl.textContent = '';
    if (cur !== getAdminPassword()){
      errEl.textContent = 'বর্তমান পাসওয়ার্ড সঠিক নয়।';
      return;
    }
    if (next.length < 4){
      errEl.textContent = 'নতুন পাসওয়ার্ড কমপক্ষে ৪ ক্যারেক্টার হতে হবে।';
      return;
    }
    if (next !== confirmPw){
      errEl.textContent = 'নতুন পাসওয়ার্ড দুটি মিলছে না।';
      return;
    }
    setAdminPassword(next);
    document.getElementById('pw-current').value = '';
    document.getElementById('pw-new').value = '';
    document.getElementById('pw-confirm').value = '';
    toast('পাসওয়ার্ড পরিবর্তন হয়েছে।');
  });
}

/* ============================================================
   DATA ACTIONS: export / import / reset
   ============================================================ */
function exportData(){
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio-data.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('ডেটা এক্সপোর্ট হয়েছে।');
}

function importData(e){
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), parsed);
      markDirty();
      renderAllPanels();
      toast('ডেটা ইম্পোর্ট হয়েছে — এখন "সেভ করুন" চাপুন।');
    } catch(err){
      toast('ভুল JSON ফাইল! আবার চেষ্টা করুন।');
    }
  };
  reader.readAsText(file);
}

function resetData(){
  if (!confirm('আপনি কি নিশ্চিত? সব কন্টেন্ট ডিফল্ট অবস্থায় ফিরে যাবে।')) return;
  state = JSON.parse(JSON.stringify(DEFAULT_DATA));
  markDirty();
  renderAllPanels();
  toast('ডিফল্টে রিসেট হয়েছে — এখন "সেভ করুন" চাপুন।');
}

/* ============================================================
   GENERIC EVENT DELEGATION (input / click / file upload)
   Attached once per panel; survives innerHTML re-renders
   because listeners live on the panel container itself.
   ============================================================ */
const PANEL_RENDERERS = {
  site: renderSitePanel,
  hero: renderHeroPanel,
  about: renderAboutPanel,
  skills: renderSkillsPanel,
  projects: renderProjectsPanel,
  experience: renderExperiencePanel,
  services: renderServicesPanel,
  contact: renderContactPanel,
  data: renderDataPanel,
  security: renderSecurityPanel
};

function updateImagePreview(previewId, value){
  const el = document.getElementById(previewId);
  if (!el) return;
  el.innerHTML = value ? `<img src="${esc(value)}" alt="">` : '<span>প্রিভিউ নেই</span>';
}

function setupPanelEvents(panelId, renderFn){
  const panel = document.getElementById(panelId);

  panel.addEventListener('input', e => {
    const t = e.target;
    if (!t.dataset.path) return;

    let value = t.value;
    if (t.dataset.type === 'number') value = Number(value);
    else if (t.dataset.type === 'lines') value = value.split('\n').map(s=>s.trim()).filter(Boolean);
    else if (t.dataset.type === 'csv') value = value.split(',').map(s=>s.trim()).filter(Boolean);

    setByPath(state, t.dataset.path, value);
    markDirty();

    if (t.dataset.colorsync){
      const group = t.closest('.color-field');
      group.querySelectorAll('[data-colorsync]').forEach(other => {
        if (other !== t) other.value = t.value;
      });
    }
    if (t.dataset.imgpreview){
      updateImagePreview(t.dataset.imgpreview, t.value);
    }
  });

  panel.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('input[type=file][data-imgupload]')){
      const file = t.files[0];
      if (!file) return;
      if (file.size > 600 * 1024){
        toast('ছবিটি বড় (৬০০KB এর বেশি) — ছোট ছবি ব্যবহার করার চেষ্টা করুন।');
      }
      const reader = new FileReader();
      reader.onload = () => {
        setByPath(state, t.dataset.imgupload, reader.result);
        markDirty();
        updateImagePreview(t.dataset.imgpreview, reader.result);
        const textInput = panel.querySelector(`input[type="text"][data-path="${t.dataset.imgupload}"]`);
        if (textInput) textInput.value = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });

  panel.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const path = btn.dataset.path;

    if (action === 'add-item'){
      let template;
      if (ADD_TEMPLATES[path]) template = ADD_TEMPLATES[path]();
      else if (/\.items$/.test(path)) template = { name:'New Skill', level:50 };
      else template = {};
      const arr = getByPath(state, path);
      arr.push(JSON.parse(JSON.stringify(template)));
      markDirty();
      renderFn();
    } else if (action === 'remove-item'){
      if (!confirm('আপনি কি নিশ্চিত মুছে ফেলতে চান?')) return;
      const lastDot = path.lastIndexOf('.');
      const arrPath = path.slice(0, lastDot);
      const idx = Number(path.slice(lastDot+1));
      getByPath(state, arrPath).splice(idx, 1);
      markDirty();
      renderFn();
    } else if (action === 'clear-image'){
      setByPath(state, path, '');
      markDirty();
      updateImagePreview(btn.dataset.imgpreview, '');
      const textInput = panel.querySelector(`input[type="text"][data-path="${path}"]`);
      if (textInput) textInput.value = '';
    }
  });
}

function renderAllPanels(){
  Object.keys(PANEL_RENDERERS).forEach(key => PANEL_RENDERERS[key]());
}

/* ============================================================
   TAB SWITCHING
   ============================================================ */
function switchTab(tabId){
  document.querySelectorAll('.admin-sidebar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tabId}`));
}

/* ============================================================
   SAVE
   ============================================================ */
function saveAll(){
  savePortfolioData(state);
  clearDirty();
  toast('✓ সেভ হয়েছে! সাইটে গিয়ে দেখুন।');
}

/* ============================================================
   AUTH / LOGIN
   ============================================================ */
function showApp(){
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').classList.add('show');
  renderAllPanels();
}

function tryLogin(){
  const pwInput = document.getElementById('login-password');
  const err = document.getElementById('login-error');
  if (pwInput.value === getAdminPassword()){
    sessionStorage.setItem('portfolioAdminSession', '1');
    err.textContent = '';
    showApp();
  } else {
    err.textContent = 'পাসওয়ার্ড সঠিক নয়।';
    pwInput.value = '';
    pwInput.focus();
  }
}

function logout(){
  if (isDirty && !confirm('আপনার আনসেভড পরিবর্তন আছে। সেভ না করে লগআউট করতে চান?')) return;
  sessionStorage.removeItem('portfolioAdminSession');
  document.getElementById('admin-app').classList.remove('show');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-password').value = '';
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // wire panel events once
  Object.keys(PANEL_RENDERERS).forEach(key => setupPanelEvents(`panel-${key}`, PANEL_RENDERERS[key]));

  // sidebar tabs
  document.querySelectorAll('.admin-sidebar button').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // login
  document.getElementById('login-btn').addEventListener('click', tryLogin);
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') tryLogin();
  });

  // topbar actions
  document.getElementById('save-btn').addEventListener('click', saveAll);
  document.getElementById('logout-btn').addEventListener('click', logout);

  // warn before leaving with unsaved changes
  window.addEventListener('beforeunload', e => {
    if (isDirty){ e.preventDefault(); e.returnValue = ''; }
  });

  // auto-login if session active
  if (sessionStorage.getItem('portfolioAdminSession') === '1'){
    showApp();
  }
});
