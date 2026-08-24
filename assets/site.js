/* La Piazza — static site behaviour: preloader, nav, reveals, language, menu book */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preloader ---------- */
  var pre = d.getElementById('preloader');
  var bar = pre && pre.querySelector('.tricolor-bar i');
  var p = 0;
  var tick = setInterval(function () {
    p = Math.min(92, p + Math.random() * 16);
    if (bar) bar.style.width = p + '%';
  }, 180);
  function done() {
    clearInterval(tick);
    if (bar) bar.style.width = '100%';
    setTimeout(function () { if (pre) pre.classList.add('is-done'); }, 260);
  }
  window.addEventListener('load', function () { setTimeout(done, 350); });
  setTimeout(done, 4000);

  /* ---------- header on scroll ---------- */
  var nav = d.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-solid', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- overlay nav ---------- */
  var overlay = d.getElementById('overlay');
  var open = d.getElementById('navOpen');
  var close = d.getElementById('navClose');
  var links = overlay.querySelectorAll('.overlay__links a');
  Array.prototype.forEach.call(links, function (a, i) {
    a.style.transitionDelay = (0.08 + i * 0.055) + 's';
    a.addEventListener('click', hide);
  });
  function show() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    open.setAttribute('aria-expanded', 'true');
    d.body.style.overflow = 'hidden';
  }
  function hide() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    open.setAttribute('aria-expanded', 'false');
    d.body.style.overflow = '';
  }
  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

  /* ---------- scroll reveals ---------- */
  var rv = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(rv, function (el) { io.observe(el); });
    setTimeout(function () { Array.prototype.forEach.call(rv, function (el) { el.classList.add('is-in'); }); }, 6000);
  } else {
    Array.prototype.forEach.call(rv, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- image load / fail states ---------- */
  Array.prototype.forEach.call(d.querySelectorAll('.ph__img'), function (img) {
    function ok() { img.classList.add('is-in'); }
    function bad() { img.classList.add('is-missing'); }
    if (img.complete) { (img.naturalWidth ? ok : bad)(); }
    else { img.addEventListener('load', ok); img.addEventListener('error', bad); }
  });

  /* ---------- language ---------- */
  var lang = 'sr';
  var srBtn = d.getElementById('langSr');
  var enBtn = d.getElementById('langEn');
  function setLang(next) {
    lang = next;
    Array.prototype.forEach.call(d.querySelectorAll('[data-en]'), function (el) {
      if (!el.dataset.sr) el.dataset.sr = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.sr;
    });
    srBtn.classList.toggle('is-on', lang === 'sr');
    enBtn.classList.toggle('is-on', lang === 'en');
    d.documentElement.lang = lang === 'en' ? 'en' : 'sr';
    try { localStorage.setItem('lp-lang', lang); } catch (e) {}
    renderBook();
    renderStatus();
  }
  srBtn.addEventListener('click', function () { setLang('sr'); });
  enBtn.addEventListener('click', function () { setLang('en'); });

  /* ---------- open / closed status (Europe/Belgrade) ---------- */
  /* Pon–Sub 07:00–23:00 · Nedelja 12:00–23:00 */
  var HOURS = [[12, 23], [7, 23], [7, 23], [7, 23], [7, 23], [7, 23], [7, 23]]; // 0 = nedelja
  function localNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Belgrade', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var g = {};
      f.forEach(function (p) { g[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[g.weekday], min: parseInt(g.hour, 10) * 60 + parseInt(g.minute, 10) };
    } catch (e) {
      var n = new Date();
      return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() };
    }
  }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function statusNow() {
    var t = localNow();
    var h = HOURS[t.day];
    var open = t.min >= h[0] * 60 && t.min < h[1] * 60;
    if (open) {
      return { open: true, closesAt: two(h[1]) + ':00' };
    }
    // next opening: later today, or the following day
    if (t.min < h[0] * 60) return { open: false, opensAt: two(h[0]) + ':00', tomorrow: false };
    var nd = HOURS[(t.day + 1) % 7];
    return { open: false, opensAt: two(nd[0]) + ':00', tomorrow: true };
  }
  function renderStatus() {
    var s = statusNow();
    var en = lang === 'en';
    var main = s.open ? (en ? 'Open now' : 'Trenutno otvoreno') : (en ? 'Currently closed' : 'Trenutno zatvoreno');
    var note = s.open
      ? (en ? 'until ' + s.closesAt : 'do ' + s.closesAt)
      : (en ? (s.tomorrow ? 'opens tomorrow at ' + s.opensAt : 'opens at ' + s.opensAt)
            : (s.tomorrow ? 'otvaramo sutra u ' + s.opensAt : 'otvaramo u ' + s.opensAt));
    var wrap = d.getElementById('status');
    var txt = d.getElementById('statusText');
    var nt = d.getElementById('statusNote');
    if (wrap) wrap.classList.toggle('is-closed', !s.open);
    if (txt) txt.textContent = main;
    if (nt) nt.textContent = '· ' + note;
    var line = d.getElementById('statusLine');
    var lineTxt = d.getElementById('statusLineText');
    if (line) line.classList.toggle('is-closed', !s.open);
    if (lineTxt) lineTxt.textContent = main + ' · ' + note;
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* ---------- mobile ticker (duplicate the set for a seamless loop) ---------- */
  var track = d.getElementById('stripTrack');
  if (track) {
    var mqStrip = window.matchMedia('(max-width: 700px)');
    var cloned = false;
    function syncTicker() {
      if (mqStrip.matches && !cloned) {
        var items = Array.prototype.slice.call(track.children);
        items.forEach(function (el) {
          var c = el.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          c.removeAttribute('id');
          Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
          track.appendChild(c);
        });
        cloned = true;
      }
    }
    syncTicker();
    if (mqStrip.addEventListener) mqStrip.addEventListener('change', syncTicker);
    else mqStrip.addListener(syncTicker);
  }

  /* ---------- menu book ---------- */
  var CATS = [
    { t: 'Antipasti', n: { sr: 'Predjela', en: 'Starters' }, i: 5 },
    { t: 'Insalate', n: { sr: 'Salate', en: 'Salads' }, i: 4 },
    { t: 'Pizza', n: { sr: 'Iz peći', en: 'From the oven' }, i: 7 },
    { t: 'Pasta', n: { sr: 'Testenine', en: 'Pasta' }, i: 5 },
    { t: 'Gelato', n: { sr: 'Iz vitrine', en: 'From the case' }, i: 6 },
    { t: 'Caffè & Bar', n: { sr: 'Kafa i piće', en: 'Coffee & drinks' }, i: 6 }
  ];
  var book = d.getElementById('book');
  var spread = d.getElementById('spread');
  var pageL = d.getElementById('pageL');
  var pageR = d.getElementById('pageR');
  var leaf = d.getElementById('leaf');
  var leafFront = d.getElementById('leafFront');
  var leafBack = d.getElementById('leafBack');
  var label = d.getElementById('pageLabel');
  var index = 0, flipping = false, raf = null, timer = null;

  function single() { return window.matchMedia('(max-width: 700px)').matches; }
  function pageCount() { return CATS.length + 2; }
  function total() { return single() ? pageCount() : Math.ceil(pageCount() / 2); }

  function pageHTML(i) {
    var en = lang === 'en';
    if (i === 0) {
      return '<div class="mp mp--cover">' +
        '<span class="mp__k">Trg slobode, Inđija</span>' +
        '<span class="mp__t">Il Menù</span>' +
        '<span class="tricolor tricolor--dark tricolor--thick"></span>' +
        '<span class="mp__k">Pizzeria &amp; Gelateria</span></div>';
    }
    var c = CATS[i - 1];
    if (!c) {
      return '<div class="mp mp--end"><span class="mp__t">' +
        (en ? 'Real menu goes here' : 'Ovde ide pravi meni') + '</span><p>' +
        (en ? 'The structure is ready — categories, items and prices are replaced with the real ones.'
            : 'Struktura je spremna — kategorije, jela i cene zamenjuju se pravim podacima.') +
        '</p></div>';
    }
    var rows = '';
    for (var n = 1; n <= c.i; n++) {
      rows += '<div class="mp__row"><span>' + (en ? 'Item' : 'Jelo') + ' ' +
        (n < 10 ? '0' + n : n) + '</span><span class="mp__lead"></span><span class="mp__p">—</span></div>';
    }
    return '<div class="mp"><div class="mp__top"><span class="mp__t">' + c.t +
      '</span><span class="mp__note">' + (en ? c.n.en : c.n.sr) + '</span></div>' +
      '<div class="mp__hr"></div><div>' + rows + '</div>' +
      '<span class="mp__fine">' + (en ? 'Placeholder — to be replaced' : 'Placeholder — zamenjuje se') + '</span></div>';
  }

  function renderBook(idx) {
    var s = idx == null ? index : idx;
    if (single()) { pageL.innerHTML = ''; pageR.innerHTML = pageHTML(s); }
    else { pageL.innerHTML = s === 0 ? '' : pageHTML(s * 2 - 1); pageR.innerHTML = pageHTML(s * 2); }
    label.textContent = (lang === 'en' ? (single() ? 'Page ' : 'Spread ') : (single() ? 'Strana ' : 'List ')) +
      (s + 1) + ' / ' + total();
  }

  function turn(dir) {
    if (flipping) return;
    var next = index + dir;
    if (next < 0 || next > total() - 1) return;
    var mob = single();
    if (reduce) { index = next; renderBook(); return; }
    flipping = true;
    var a0 = dir > 0 ? 0 : -176, a1 = dir > 0 ? -176 : 0;
    leafFront.innerHTML = pageHTML(dir > 0 ? (mob ? index : index * 2) : (mob ? next : next * 2));
    leafBack.innerHTML = pageHTML(dir > 0 ? (mob ? next : next * 2 - 1) : (mob ? index : index * 2 - 1));
    leaf.style.willChange = 'transform';
    leaf.style.transform = 'rotateY(' + a0 + 'deg)';
    leaf.style.opacity = '1';
    void leaf.offsetWidth;
    var DUR = 720, t0 = null;
    function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function finish() {
      if (!flipping) return;
      flipping = false;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(timer);
      leaf.style.opacity = '0';
      leaf.style.willChange = 'auto';
      leaf.style.transform = 'rotateY(0deg)';
      index = next;
    }
    function step(ts) {
      if (!flipping) return;
      if (t0 === null) { t0 = ts; index = next; renderBook(next); }
      var q = Math.min(1, (ts - t0) / DUR);
      leaf.style.transform = 'rotateY(' + (a0 + (a1 - a0) * ease(q)) + 'deg)';
      if (q < 1) raf = requestAnimationFrame(step); else finish();
    }
    raf = requestAnimationFrame(step);
    timer = setTimeout(finish, DUR + 400);
  }

  d.getElementById('nextPage').addEventListener('click', function () { turn(1); });
  d.getElementById('prevPage').addEventListener('click', function () { turn(-1); });
  book.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
  var mq = window.matchMedia('(max-width: 700px)');
  var onMq = function () { if (index > total() - 1) index = 0; renderBook(); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);

  try {
    var saved = localStorage.getItem('lp-lang');
    if (saved === 'en') { setLang('en'); } else { renderBook(); }
  } catch (e) { renderBook(); }
})();
