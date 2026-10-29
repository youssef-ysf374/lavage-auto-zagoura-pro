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