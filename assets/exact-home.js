/* MOHW Social Support: exact 1448x1086 artwork on desktop, cropped originals on mobile.
   All controls delegate to the application's existing navigation/tools. */
(() => {
  'use strict';
  const VIEW_W = 1448, VIEW_H = 1086;
  const ART = 'assets/mohw-homepage-exact.png';
  const FILM = 'assets/gia-introduction.mp4';
  const view = document.getElementById('view-about');
  if (!view) return;

  const state = { artworkReady: false, current: '' };
  const desktopQuery = window.matchMedia('(min-width: 900px)');
  const $ = (selector, root = document) => root.querySelector(selector);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const position = (node, x, y, width, height) => {
    node.style.left = `${x / VIEW_W * 100}%`;
    node.style.top = `${y / VIEW_H * 100}%`;
    node.style.width = `${width / VIEW_W * 100}%`;
    node.style.height = `${height / VIEW_H * 100}%`;
  };
  function route(id) {
    const button = $(`.site-header #mainNav [data-nav="${id}"]`) ||
      $(`#view-about .p2-start [data-nav="${id}"]`) ||
      $(`.pm-more [data-premium-nav="${id}"]`);
    if (!button) return false;
    button.click();
    return true;
  }
  function utility(kind) {
    const button = $(`#guideActionDock [data-action="${kind}"]`);
    if (!button) return false;
    button.click();
    return true;
  }
  const status = el('span', 'exact-sr');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  function activate(kind, id) {
    switch (kind) {
      case 'nav': return route(id);
      case 'contact': return route('contacts');
      case 'search': if (!searchDialog.open) searchDialog.showModal();$('#exact-query', searchDialog).focus();return true;
      case 'gia':
        if (window.MOHWGIA?.open) { window.MOHWGIA.open(); return true; }
        if ($('#gia2Launcher')) { $('#gia2Launcher').click(); return true; }
        return false;
      case 'access':
        if ($('[data-p2="access"]')) { $('[data-p2="access"]').click(); return true; }
        return false;
      case 'share': return utility('share');
      case 'report': return utility('issue');
      case 'message': return utility('feedback');
      default: return false;
    }
  }
  function actionButton(label, kind, id, className) {
    const button = el('button', className);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.addEventListener('click', () => {
      if (!activate(kind, id)) status.textContent = `${label} is temporarily unavailable.`;
    });
    return button;
  }

  // Real searchable form rather than a fake image hotspot.
  const searchDialog = el('dialog', 'exact-search');
  searchDialog.id = 'exact-search';
  searchDialog.setAttribute('aria-labelledby', 'exact-search-title');
  searchDialog.innerHTML = '<form id="exact-search-form"><div class="exact-dialog-top"><h2 id="exact-search-title">Find social support services</h2><button class="exact-close" type="button" aria-label="Close search">×</button></div><label for="exact-query">What service or programme do you need?</label><input id="exact-query" type="search" required placeholder="Search Jamaica’s support directory" autocomplete="off"><button type="submit" class="exact-submit">Find services →</button></form>';
  document.body.append(searchDialog);
  $('.exact-close', searchDialog).addEventListener('click', () => searchDialog.close());
  searchDialog.addEventListener('click', (e) => { if (e.target === searchDialog) searchDialog.close(); });
  $('#exact-search-form', searchDialog).addEventListener('submit', (e) => {
    e.preventDefault();
    const query = $('#exact-query', searchDialog).value.trim();
    if (!query) return;
    if (!route('services')) { status.textContent = 'Service directory unavailable.'; return; }
    searchDialog.close();
    const field = $('#serviceSearch');
    if (field) { field.value = query; field.dispatchEvent(new Event('input', { bubbles: true })); field.focus(); }
  });

  // The same approved six-option navy navigation is used in the home
  // experience and on all the other mobile pages. Original native navigation
  // handlers and the working accessibility trigger are retained.
  const iconSvg = (contents) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + contents + '</svg>';
  const NAV_ICONS = {
    house: iconSvg('<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/>'),
    referrals: iconSvg('<path d="M5 19 19 5M9 5h10v10"/>'),
    decision: iconSvg('<circle cx="12" cy="4" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 6v5M12 11 5 17M12 11l7 6"/>'),
    services: iconSvg('<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'),
    manual: iconSvg('<path d="M12 6C8 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>'),
    access: iconSvg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.5" r="1"/><path d="M7.5 11.5h9M12 11.5v6M9.7 19l2.3-3 2.3 3"/>')
  };
  const ACTION_ICONS = {
    share: iconSvg('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.3 10.7 7.4-4.3M8.3 13.3l7.4 4.3"/>'),
    report: iconSvg('<path d="M5 22V3m0 1c5-3 8 3 14 0v11c-6 3-9-3-14 0"/>'),
    message: iconSvg('<path d="M4 4h16v13H9l-5 4V4Z"/><path d="M8 9h8m-8 4h5"/>'),
    download: iconSvg('<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>')
  };
  const nativeNav = $('#mainNav');
  if (nativeNav && !nativeNav.classList.contains('premium-nav-upgraded')) {
    const definitions = [
      ['about', 'Home', 'house'],
      ['referrals', 'Referrals', 'referrals'],
      ['decision', 'Decision', 'decision'],
      ['services', 'Services', 'services'],
      ['manual', 'Manual', 'manual']
    ];
    for (const [id, label, symbol] of definitions) {
      const button = nativeNav.querySelector('button[data-nav="' + id + '"]');
      if (!button) continue;
      // Preserve the existing text/arrow for desktop views.
      const originalText = el('span', 'premium-nav-original');
      while (button.firstChild) originalText.appendChild(button.firstChild);
      const icon = el('span', 'premium-nav-icon');
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = NAV_ICONS[symbol];
      button.append(icon, originalText, el('span', 'premium-nav-short', label));
      button.setAttribute('aria-label', id === 'decision' ? 'Decision Guide' : id === 'services' ? 'Find Services' : id === 'manual' ? 'Digital Manual' : label);
    }
    const accessNav = actionButton('Accessibility & listening', 'access', '', 'premium-mobile-access');
    accessNav.id = 'premium-mobile-access';
    const icon = el('span', 'premium-nav-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = NAV_ICONS.access;
    accessNav.append(icon, el('span', 'premium-nav-short', 'Accessibility'));
    nativeNav.append(accessNav);
    nativeNav.classList.add('premium-nav-upgraded');
  }

  const desktop = el('div', 'exact-desktop');
  desktop.id = 'exact-home';
  desktop.setAttribute('role', 'region');
  desktop.setAttribute('aria-label', 'MOHW Social Support illustrated homepage');
  const original = el('img', 'exact-art');
  original.src = ART;
  original.alt = '';
  original.decoding = 'async';
  original.setAttribute('aria-hidden', 'true');
  desktop.append(original, status);
  const title = el('h1', 'exact-sr', 'Find the support you need');
  desktop.append(title);

  const zones = [
    ['Home', 'nav', 'about', 118, 112, 161, 59],
    ['Referrals', 'nav', 'referrals', 297, 111, 158, 60],
    ['Decision Guide', 'nav', 'decision', 462, 111, 208, 60],
    ['Find Services', 'nav', 'services', 673, 111, 182, 60],
    ['Digital Manual', 'nav', 'manual', 866, 111, 215, 60],
    ['Accessibility & listening', 'access', '', 1090, 111, 271, 60],
    ['Search the site', 'search', '', 1001, 23, 293, 59],
    ['Share guide', 'share', '', 16, 239, 100, 90],
    ['Report an issue', 'report', '', 16, 332, 100, 91],
    ['Send feedback', 'message', '', 16, 430, 100, 91],
    ['Download manual', 'nav', 'manual', 16, 528, 100, 91],
    ['Contact agencies', 'contact', '', 16, 623, 100, 91],
    ['Find services', 'nav', 'services', 110, 737, 269, 215],
    ['Make a referral', 'nav', 'referrals', 384, 737, 259, 215],
    ['Get help choosing', 'nav', 'decision', 650, 737, 270, 215],
    ['Read the manual', 'nav', 'manual', 925, 737, 280, 215],
    ['Ask GIA', 'gia', '', 1218, 697, 195, 294],
    ['MOHW Social Support home', 'nav', 'about', 33, 10, 730, 89]
  ];
  zones.forEach(([label, kind, id, x, y, width, height]) => {
    const button = actionButton(label, kind, id, 'exact-hit');
    position(button, x, y, width, height);
    desktop.append(button);
  });

  // Fit the playable footage precisely INSIDE the artwork's white rounded video bezel.
  // The source artwork is 1448 x 1086. These are source-image coordinates, not viewport pixels.
  const desktopFrame = el('div', 'exact-player');
  position(desktopFrame, 151, 444, 492, 257);
  const desktopPlay = el('button', 'exact-play');
  desktopPlay.type = 'button';
  desktopPlay.setAttribute('aria-label', 'Play GIA introduction video');
  const desktopFilm = el('video', 'exact-video');
  desktopFilm.controls = true;
  desktopFilm.playsInline = true;
  desktopFilm.preload = 'metadata';
  desktopFilm.setAttribute('aria-label', 'GIA introduction video with sound');
  desktopFilm.hidden = true;
  desktopFrame.append(desktopPlay, desktopFilm);
  desktop.append(desktopFrame);

  // Mobile: the SAME 1448x1086 artwork is shown in natural-ratio crops,
  // with real, large touch targets rather than shrinking the complete desktop image.
  const mobile = el('section', 'exact-mobile');
  mobile.id = 'exact-mobile';
  mobile.setAttribute('aria-label', 'MOHW Social Support mobile homepage');
  const header = el('header', 'em-header');
  const brand = el('div', 'em-brand');
  const logo = el('img', 'em-logo');
  logo.src = 'assets/mohw-official-logo.png';
  logo.alt = 'Ministry of Health & Wellness';
  const brandCopy = el('div', 'em-brand-copy');
  brandCopy.innerHTML = '<strong>MOHW <span>Social Support</span></strong><small>Services Support Guide · Jamaica</small>';
  brand.append(logo, brandCopy);
  const search = actionButton('Search the site', 'search', '', 'em-search');
  search.textContent = '⌕';
  header.append(brand, search);
  mobile.append(header);

  const nav = el('nav', 'em-navigation');
  nav.setAttribute('aria-label', 'Homepage navigation');
  [
    ['Home', 'nav', 'about', 'house'], ['Referrals', 'nav', 'referrals', 'referrals'],
    ['Decision', 'nav', 'decision', 'decision'], ['Services', 'nav', 'services', 'services'],
    ['Manual', 'nav', 'manual', 'manual'], ['Accessibility', 'access', '', 'access']
  ].forEach(([label, kind, id, symbol]) => {
    const button = actionButton(label, kind, id, 'em-nav-button');
    const icon = el('span', 'em-nav-symbol');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = NAV_ICONS[symbol];
    button.append(icon, el('span', 'em-nav-label', label));
    nav.append(button);
  });
  mobile.append(nav);

  const intro = el('section', 'em-intro');
  intro.innerHTML = '<span class="em-eyebrow">JAMAICA · SOCIAL PROTECTION</span><h1>Find the support<br><span>you need.</span></h1><p>A single place to find services, make referrals, get guidance and access the Social Protection Services Support Guide.</p>';
  mobile.append(intro);

  // The photograph is a non-distorted crop of the exact supplied image.
  const family = el('div', 'em-family');
  const familyImage = el('img', 'em-crop-image');
  familyImage.src = ART;
  familyImage.alt = 'Three generations of a smiling Jamaican family';
  familyImage.setAttribute('loading', 'lazy');
  familyImage.style.width = `${VIEW_W / 775 * 100}%`;
  familyImage.style.left = `${-670 / 775 * 100}%`;
  familyImage.style.top = `${-182 / 540 * 100}%`;
  family.append(familyImage);
  mobile.append(family);

  const meet = el('section', 'em-video-section');
  meet.innerHTML = '<div class="em-section-title"><h2>Meet <em>GIA</em></h2><p>Your virtual guide to MOHW Social Support</p></div>';
  const mobileFrame = el('div', 'em-video-frame');
  const mobilePoster = el('div', 'em-poster-crop');
  const posterImage = el('img', 'em-crop-image');
  posterImage.src = ART;
  posterImage.alt = '';
  posterImage.setAttribute('aria-hidden', 'true');
  posterImage.style.width = `${VIEW_W / 492 * 100}%`;
  posterImage.style.left = `${-151 / 492 * 100}%`;
  posterImage.style.top = `${-444 / 257 * 100}%`;
  mobilePoster.append(posterImage);
  const mobilePlay = el('button', 'em-play-video');
  mobilePlay.type = 'button';
  mobilePlay.setAttribute('aria-label', 'Play GIA introduction video');
  mobilePlay.innerHTML = '<span aria-hidden="true">▶</span><span class="exact-sr">Play video</span>';
  const mobileFilm = el('video', 'em-video');
  mobileFilm.controls = true;
  mobileFilm.playsInline = true;
  mobileFilm.preload = 'metadata';
  mobileFilm.setAttribute('aria-label', 'GIA introduction video with sound');
  mobileFilm.hidden = true;
  mobileFrame.append(mobilePoster, mobilePlay, mobileFilm);
  meet.append(mobileFrame);
  mobile.append(meet);

  const cardsTitle = el('h2', 'em-card-heading', 'How can we help?');
  mobile.append(cardsTitle);
  const cards = el('div', 'em-card-grid');
  [
    ['Find services', 'services', 109, 735, 273, 220],
    ['Make a referral', 'referrals', 383, 735, 269, 220],
    ['Get help choosing', 'decision', 645, 735, 284, 220],
    ['Read the manual', 'manual', 921, 735, 299, 220]
  ].forEach(([label, page, x, y, width, height]) => {
    const button = actionButton(label, 'nav', page, 'em-card');
    button.style.aspectRatio = `${width} / ${height}`;
    const crop = el('img', 'em-crop-image');
    crop.src = ART;
    crop.alt = '';
    crop.setAttribute('aria-hidden', 'true');
    crop.loading = 'lazy';
    crop.style.width = `${VIEW_W / width * 100}%`;
    crop.style.left = `${-x / width * 100}%`;
    crop.style.top = `${-y / height * 100}%`;
    button.append(crop);
    cards.append(button);
  });
  mobile.append(cards);

  const utilities = el('nav', 'em-utility');
  utilities.setAttribute('aria-label', 'Additional actions');
  [
    ['Share', 'share', '', 'share'], ['Report', 'report', '', 'report'],
    ['Message', 'message', '', 'message'], ['Download', 'nav', 'manual', 'download']
  ].forEach(([label, kind, id, symbol]) => {
    const button = actionButton(label, kind, id, 'em-util-button');
    const icon = el('span', 'em-util-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = ACTION_ICONS[symbol];
    button.append(icon, el('span', 'em-util-caption', label));
    utilities.append(button);
  });
  // The utility dock lives at body level so it stays fixed, even while the
  // illustrated homepage scrolls. It is shown only on the mobile homepage.
  utilities.id = 'exact-mobile-utilities';
  utilities.hidden = true;

  // Keep the original, full-featured #gia2Launcher floating bottom-right.
  // No duplicate mini-avatar is created inside the illustrated mobile page.
  const footerText = el('p', 'em-footer', 'MOHW Social Support · Jamaica · ');
  const contactLink = actionButton('Contact agencies', 'contact', '', 'em-contact-link');
  contactLink.textContent = 'Contact directory';
  footerText.append(contactLink);
  mobile.append(footerText);
  // GIA's introductory film is the FIRST feature directly under the MOHW banner.
  mobile.insertBefore(meet, nav);

  view.prepend(desktop, mobile);
  document.body.append(utilities);
  const allVideos = [[desktopFilm, desktopPlay, desktopFrame], [mobileFilm, mobilePlay, mobileFrame]];
  function playVideo(video, button, frame) {
    allVideos.forEach(([other]) => { if (other !== video) other.pause(); });
    $('.exact-media-error', frame)?.remove();
    // Keep the approved Gia illustration unobstructed while the video buffers.
    // The real player appears only after the browser renders moving video.
    if (!video.getAttribute('src')) video.src = FILM;
    video.classList.add('exact-video-pending');
    frame.classList.add('video-loading');
    video.hidden = false;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const requested = video.play();
    if (requested && typeof requested.catch === 'function')
      requested.catch(() => videoError(video, button, frame));
  }
  function videoError(video, button, frame) {
    video.pause();
    video.hidden = true;
    video.classList.remove('exact-video-pending');
    frame.classList.remove('video-loading');
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.hidden = false;
    video.removeAttribute('src');
    video.load();
    status.textContent = 'GIA video unavailable. The interactive assistant is still available.';
    if ($('.exact-media-error', frame)) return;
    const note = el('div', 'exact-media-error');
    note.setAttribute('role', 'status');
    note.append(el('span', '', 'Unable to play video'), actionButton('Ask GIA instead', 'gia', '', 'exact-ask-fallback'));
    frame.append(note);
  }
  allVideos.forEach(([video, button, frame]) => {
    button.addEventListener('click', () => playVideo(video, button, frame));
    video.addEventListener('playing', () => {
      video.classList.remove('exact-video-pending');
      frame.classList.remove('video-loading');
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.hidden = true;
    });
    video.addEventListener('error', () => { if (video.getAttribute('src')) videoError(video, button, frame); });
    video.addEventListener('ended', () => {
      video.hidden = true;
      video.classList.remove('exact-video-pending');
      frame.classList.remove('video-loading');
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.hidden = false;
    });
  });

  function sync() {
    const permitted = state.artworkReady && !document.documentElement.classList.contains('p2-contrast');
    const homepageActive = view.classList.contains('active');
    const mode = !permitted ? '' : desktopQuery.matches ? 'desktop' : 'mobile';
    desktop.hidden = mode !== 'desktop';
    mobile.hidden = mode !== 'mobile';
    utilities.hidden = !(mode === 'mobile' && homepageActive);
    view.classList.toggle('exact-home-enabled', !!mode);
    view.classList.toggle('exact-mode-desktop', mode === 'desktop');
    view.classList.toggle('exact-mode-mobile', mode === 'mobile');
    document.documentElement.classList.toggle('exact-home-visible', !!mode && homepageActive);
    if (!homepageActive || (state.current && state.current !== mode)) {
      allVideos.forEach(([video]) => video.pause());
    }
    state.current = mode;
  }
  const observer = new MutationObserver(sync);
  observer.observe(view, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  desktopQuery.addEventListener?.('change', sync);
  original.addEventListener('load', () => { state.artworkReady = original.naturalWidth === VIEW_W && original.naturalHeight === VIEW_H; sync(); });
  original.addEventListener('error', () => { state.artworkReady = false; sync(); console.warn('Exact MOHW homepage image unavailable; original homepage remains enabled.'); });
  if (original.complete && original.naturalWidth) { state.artworkReady = original.naturalWidth === VIEW_W && original.naturalHeight === VIEW_H; }
  sync();
})();
