/* MOHW Social Support mobile home: exact approved visual assets + real UI controls.
 * Each artwork slice is decorative; navigation, search, film and floating controls
 * remain HTML controls backed by the existing application. No desktop changes. */
(() => {
  'use strict';
  const view = document.getElementById('view-about');
  if (!view || document.getElementById('mohw-mobile-image')) return;
  const base = 'assets/mobile-v3/';
  const film = 'assets/gia-introduction.mp4';
  const $ = (s, root = document) => root.querySelector(s);
  const mobile = window.matchMedia('(max-width: 899px)');
  let artworkLoaded = false;

  const root = document.createElement('section');
  root.id = 'mohw-mobile-image';
  root.hidden = true;
  root.setAttribute('aria-label', 'MOHW Social Support mobile home');
  const status = document.createElement('p');
  status.className = 'mv-sr';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const image = (name, className, eager = false) => {
    const img = document.createElement('img');
    img.src = base + name + '.webp';
    img.className = className || '';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';
    img.loading = eager ? 'eager' : 'lazy';
    return img;
  };
  const clickable = (name, action, className, extra = {}) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', name);
    button.title = name;
    for (const [key, value] of Object.entries(extra)) button.style[key] = value;
    button.addEventListener('click', () => {
      if (!action()) status.textContent = name + ' is temporarily unavailable.';
    });
    return button;
  };
  const page = (id) => {
    const native = $(`#mainNav [data-nav="${id}"]`) || $(`#exact-mobile [data-nav="${id}"]`);
    if (!native) return false;
    native.click();
    return true;
  };
  const accessibility = () => {
    const t = $('[data-p2="access"]');
    if (!t) return false;
    t.click();
    return true;
  };
  const search = () => {
    const s = $('#exact-mobile .em-search');
    if (!s) return false;
    s.click();
    return true;
  };
  function regionImage(name, className, eager) {
    const box = document.createElement('div');
    box.className = className;
    box.append(image(name, 'mv-art', eager));
    return box;
  }
  function hit(name, action, x, y, w, h) {
    return clickable(name, action, 'mv-hotspot', {
      left: x + '%', top: y + '%', width: w + '%', height: h + '%'
    });
  }

  const masthead = regionImage('header', 'mv-header mv-art-region', true);
  masthead.append(hit('Search the site', search, 73, 0, 17, 100));
  root.append(masthead);

  const nav = regionImage('nav', 'mv-navigation mv-art-region', true);
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Homepage navigation');
  [
    ['Home', () => page('about'), 6, 8, 29, 38],
    ['Referrals', () => page('referrals'), 36, 8, 29, 38],
    ['Decision Guide', () => page('decision'), 66, 8, 29, 38],
    ['Find Services', () => page('services'), 6, 51, 29, 39],
    ['Digital Manual', () => page('manual'), 36, 51, 29, 39],
    ['Accessibility and listening', accessibility, 66, 51, 29, 39]
  ].forEach(([label, fn, x, y, w, h]) => nav.append(hit(label, fn, x, y, w, h)));
  root.append(nav);

  const videoSection = document.createElement('section');
  videoSection.className = 'mv-film-section';
  videoSection.setAttribute('aria-label', 'Meet GIA introduction video');
  const frame = document.createElement('div');
  frame.className = 'mv-film-frame';
  const poster = image('video', 'mv-film-poster', true);
  const play = clickable('Play GIA introduction video', () => {
    const video = $('.mv-film-video', frame);
    if (!video.getAttribute('src')) video.src = film;
    frame.classList.add('mv-loading');
    play.disabled = true;
    play.setAttribute('aria-busy', 'true');
    const result = video.play();
    if (result?.catch) result.catch(() => showError());
    return true;
  }, 'mv-play');
  const video = document.createElement('video');
  video.className = 'mv-film-video';
  video.controls = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-label', 'GIA introduces MOHW Social Support');
  video.addEventListener('playing', () => {
    frame.classList.add('mv-playing');
    frame.classList.remove('mv-loading');
    play.disabled = false;
    play.removeAttribute('aria-busy');
  });
  video.addEventListener('ended', () => {
    frame.classList.remove('mv-playing', 'mv-loading');
    play.disabled = false;
    play.removeAttribute('aria-busy');
  });
  function showError() {
    frame.classList.remove('mv-playing', 'mv-loading');
    play.disabled = false;
    play.removeAttribute('aria-busy');
    video.pause();
    video.removeAttribute('src');
    video.load();
    status.textContent = 'The GIA video could not play. The floating GIA assistant is still available.';
  }
  video.addEventListener('error', () => { if (video.getAttribute('src')) showError(); });
  frame.append(poster, play, video);
  videoSection.append(frame);
  root.append(videoSection);

  const hero = regionImage('hero', 'mv-hero mv-art-region', true);
  const h1 = document.createElement('h1');
  h1.className = 'mv-sr';
  h1.textContent = 'Find the support you need';
  const p = document.createElement('p');
  p.className = 'mv-sr';
  p.textContent = 'A single place to find services, make referrals, get guidance and access the Social Protection Services Support Guide.';
  hero.append(h1, p);
  root.append(hero);

  const cards = document.createElement('nav');
  cards.className = 'mv-cards';
  cards.setAttribute('aria-label', 'Quick access to social support');
  [
    ['green', 'Find services', 'services'],
    ['gold', 'Make a referral', 'referrals'],
    ['cyan', 'Get help choosing', 'decision'],
    ['pink', 'Read the manual', 'manual']
  ].forEach(([asset, label, target]) => {
    const button = clickable(label, () => page(target), 'mv-card mv-card-' + asset);
    if (asset === 'pink') {
      // Render a real, clean card: no GIA artwork can intrude on the manual.
      button.classList.add('mv-manual-clean');
      const book = document.createElement('span');
      book.className = 'mv-manual-book';
      book.setAttribute('aria-hidden','true');
      const copy = document.createElement('span');
      copy.className = 'mv-manual-copy';
      const title = document.createElement('strong');
      title.textContent = 'Read the manual';
      const desc = document.createElement('small');
      desc.textContent = 'Access the Social Protection Services Support Guide.';
      copy.append(title, desc);
      const arrow = document.createElement('span');
      arrow.className = 'mv-manual-arrow';
      arrow.textContent = '›';
      arrow.setAttribute('aria-hidden','true');
      button.append(book,copy,arrow);
    } else button.append(image(asset,'mv-card-img',true));
    cards.append(button);
  });
  root.append(cards);
  const ribbon = regionImage('ribbon', 'mv-ribbon mv-art-region', false);
  root.append(ribbon);
  // Home is a self-contained, no-scroll dashboard. No artificial footer.
  root.append(status);
  view.prepend(root);

  // If a file is missing, leave the established native mobile layout available.
  const headerImage = $('.mv-header img', root);
  const sync = () => {
    const enabled = artworkLoaded && mobile.matches &&
      view.classList.contains('active') &&
      !document.documentElement.classList.contains('p2-contrast');
    root.hidden = !enabled;
    document.documentElement.classList.toggle('mohw-mobile-image-active', enabled);
    if (!enabled && !video.paused) video.pause();
  };
  const mo = new MutationObserver(sync);
  mo.observe(view, {attributes: true, attributeFilter: ['class']});
  mo.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
  mobile.addEventListener?.('change', sync);
  headerImage.addEventListener('load', () => { artworkLoaded = headerImage.naturalWidth === 1024; sync(); });
  headerImage.addEventListener('error', () => { artworkLoaded = false; sync(); });
  if (headerImage.complete && headerImage.naturalWidth) artworkLoaded = headerImage.naturalWidth === 1024;
  sync();
  window.__MOHW_MOBILE_VISUAL = {root, video, sync};
})();
