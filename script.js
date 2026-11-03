/* Lavage Auto Zagora Pro – script.js */
const WA_NUMBER = '212619297770'; // numéro WhatsApp international

const MESSAGES = {
  fr: {
    general: 'Bonjour, je souhaite avoir des informations sur vos services de lavage auto.',
    service: s => `Bonjour, je souhaite réserver le service : ${s}.`
  },
  ar: {
    general: 'مرحبا، أرغب في الحصول على معلومات حول خدمات غسيل السيارات.',
    service: s => `مرحبا، أرغب في حجز الخدمة التالية: ${s}.`
  }
};

/* Textes de boutons sans attribut data-ar : français -> arabe */
const UI = {
  'Réserver': 'احجز',
  'Réserver sur WhatsApp': 'احجز عبر واتساب',
  'Écrire sur WhatsApp': 'راسلنا عبر واتساب',
  'WhatsApp': 'واتساب'
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Mémorise le texte français d'origine */
const translatable = $$('[data-ar], .wa-btn span:not([class*="svg"])');
translatable.forEach(el => { el.dataset.fr = el.innerHTML; });

function waLink(el, lang) {
  let text;
  if (el.dataset.wa === 'service') {
    const card = el.closest('[data-service]');
    const name = lang === 'ar' ? card.dataset.serviceAr : card.dataset.service;
    text = MESSAGES[lang].service(name);
  } else {
    text = MESSAGES[lang].general;
  }
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* Les prix ne sont JAMAIS traduits ni modifiés : on garde leur texte d'origine et on le restaure si besoin */
const prices = $$('.price');
prices.forEach(el => { el.dataset.val = el.textContent; });

/* Libellés accessibles du lecteur vidéo (FR / AR) */
function updateVideoLabels() {
  const ar = document.documentElement.lang === 'ar';
  const v = document.getElementById('promo');
  const L = ar
    ? { play: 'تشغيل', pause: 'إيقاف مؤقت', seek: 'تقدم الفيديو', mute: 'كتم الصوت', unmute: 'تشغيل الصوت', vol: 'مستوى الصوت', speed: 'سرعة التشغيل', full: 'ملء الشاشة' }
    : { play: 'Lecture', pause: 'Pause', seek: 'Progression de la vidéo', mute: 'Couper le son', unmute: 'Activer le son', vol: 'Volume', speed: 'Vitesse de lecture', full: 'Plein écran' };
  const set = (id, t) => { const e = document.getElementById(id); if (e) e.setAttribute('aria-label', t); };
  const playLabel = v && !v.paused ? L.pause : L.play;
  set('vc-play', playLabel); set('vc-big', L.play);
  set('vc-seek', L.seek); set('vc-vol', L.vol); set('vc-speed', L.speed); set('vc-full', L.full);
  set('vc-mute', v && (v.muted || v.volume === 0) ? L.unmute : L.mute);
}

function setLang(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';

  translatable.forEach(el => {
    if (lang === 'ar') {
      el.innerHTML = el.dataset.ar || UI[el.dataset.fr.trim()] || el.dataset.fr;
    } else {
      el.innerHTML = el.dataset.fr;
    }
  });

  prices.forEach(el => { if (el.textContent !== el.dataset.val) el.textContent = el.dataset.val; });
  $$('[data-wa]').forEach(a => { a.href = waLink(a, lang); });
  updateVideoLabels();
  $('#lang').textContent = lang === 'ar' ? 'Français' : 'عربي';
  document.title = lang === 'ar' ? 'لافاج أوطو زاگورة برو – تمارة' : 'Lavage Auto Zagora Pro – Témara';
  try { localStorage.setItem('zp-lang', lang); } catch (e) {}
}

/* Langue initiale : préférence enregistrée, sinon français */
let saved = 'fr';
try { saved = localStorage.getItem('zp-lang') || 'fr'; } catch (e) {}
setLang(saved === 'ar' ? 'ar' : 'fr');

$('#lang').addEventListener('click', () => {
  setLang(document.documentElement.lang === 'ar' ? 'fr' : 'ar');
});

/* Menu mobile */
const burger = $('#burger'), menu = $('#menu');
function closeMenu() { menu.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
$$('#menu a').forEach(a => a.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (innerWidth > 960) closeMenu(); });

/* Avant / Après : Voir plus / Voir moins */
const baBox = $('#ba-extra'), baMore = $('#ba-more'), baLess = $('#ba-less');
function setBA(open) {
  baBox.classList.toggle('open', open);
  baBox.setAttribute('aria-hidden', String(!open));
  baMore.hidden = open;
  baLess.hidden = !open;
  baMore.setAttribute('aria-expanded', String(open));
  if (!open) $('#avant-apres').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
baMore.addEventListener('click', () => setBA(true));
baLess.addEventListener('click', () => setBA(false));

/* Vidéo : le placeholder disparaît dès que le fichier MP4 est chargé */
const vBox = $('#video-box'), vid = $('#promo');
const videoReady = () => vBox.classList.add('ready');
vid.addEventListener('loadedmetadata', videoReady);
if (vid.readyState >= 1) videoReady();

/* Lecteur vidéo personnalisé (contrôles visibles noir/rouge). Sans JS : contrôles natifs. */
(function () {
  const bar = $('#vc'); if (!bar) return;
  vid.removeAttribute('controls'); bar.hidden = false; vBox.classList.add('custom');
  const play = $('#vc-play'), big = $('#vc-big'), seek = $('#vc-seek'), vol = $('#vc-vol'),
        cur = $('#vc-cur'), dur = $('#vc-dur'), mute = $('#vc-mute'), speed = $('#vc-speed'), full = $('#vc-full');
  const ICON = {
    play: 'M8 5v14l11-7z', pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
    vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z',
    muted: 'M3 9v6h4l5 5V4L7 9H3zm13.6 3l2.4-2.4-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4 2.4 2.4-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4z'
  };
  const setIcon = (btn, d) => { btn.querySelector('path').setAttribute('d', d); };
  const fmt = s => { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const fill = (el, pct) => el.style.setProperty('--p', pct + '%');
  const toggle = () => { vid.paused ? vid.play().catch(() => {}) : vid.pause(); };

  play.addEventListener('click', toggle);
  big.addEventListener('click', toggle);
  vid.addEventListener('click', toggle);
  vid.addEventListener('play', () => { vBox.classList.add('playing'); setIcon(play, ICON.pause); updateVideoLabels(); });
  vid.addEventListener('pause', () => { vBox.classList.remove('playing'); setIcon(play, ICON.play); updateVideoLabels(); });
  vid.addEventListener('ended', () => { vBox.classList.remove('playing'); setIcon(play, ICON.play); });

  vid.addEventListener('loadedmetadata', () => { dur.textContent = fmt(vid.duration); });
  vid.addEventListener('durationchange', () => { dur.textContent = fmt(vid.duration); });
  vid.addEventListener('timeupdate', () => {
    cur.textContent = fmt(vid.currentTime);
    const p = vid.duration ? (vid.currentTime / vid.duration) * 100 : 0;
    seek.value = p; fill(seek, p);
  });
  seek.addEventListener('input', () => {
    if (vid.duration) vid.currentTime = (seek.value / 100) * vid.duration;
    fill(seek, seek.value);
  });

  function syncVol() {
    const m = vid.muted || vid.volume === 0;
    setIcon(mute, m ? ICON.muted : ICON.vol);
    vol.value = m ? 0 : vid.volume; fill(vol, vol.value * 100);
    updateVideoLabels();
  }
  mute.addEventListener('click', () => { vid.muted = !vid.muted; if (!vid.muted && vid.volume === 0) vid.volume = 0.5; });
  vol.addEventListener('input', () => { vid.volume = +vol.value; vid.muted = vid.volume === 0; });
  vid.addEventListener('volumechange', syncVol);
  fill(vol, 100);

  const SPEEDS = [1, 1.25, 1.5, 2, 0.75];
  speed.addEventListener('click', () => {
    const i = (SPEEDS.indexOf(vid.playbackRate) + 1) % SPEEDS.length;
    vid.playbackRate = SPEEDS[i]; speed.textContent = SPEEDS[i] + '×';
  });

  full.addEventListener('click', () => {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else if (vBox.requestFullscreen) { vBox.requestFullscreen().catch(() => {}); }
    else if (vid.webkitEnterFullscreen) { vid.webkitEnterFullscreen(); } /* iPhone */
  });
  updateVideoLabels();
})();

/* Images manquantes : on masque l'icône cassée, le placeholder reste visible */
$$('img').forEach(img => {
  const fail = () => img.classList.add('missing');
  img.addEventListener('error', fail);
  if (img.complete && img.naturalWidth === 0) fail();
});

/* Animations d'apparition */
const items = $$('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
} else {
  items.forEach(el => el.classList.add('in'));
}

/* Lien actif dans le menu */
const links = $$('#menu a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));
