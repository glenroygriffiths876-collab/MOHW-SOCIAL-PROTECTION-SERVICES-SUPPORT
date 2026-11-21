#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const source=JSON.parse(fs.readFileSync('data/guide-content.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/decision-image-overlay.js','utf8');
const css=fs.readFileSync('assets/decision-image-overlay.css','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');
new vm.Script(js,{filename:'decision-image-overlay.js'});
assert.equal(source.decision.length,26,'preserve all original 26 decision options');
assert.equal(new Set(source.decision.map(x=>x.situation)).size,13,'preserve 13 source situations');
for(const s of source.decision)assert(s.situation&&s.options&&s.provider,'never invent or omit a provider');
for(const f of ['assets/decision-overlay-desktop.webp','assets/decision-overlay-mobile.webp',
 'assets/mohw-official-logo.png','assets/mobile-v3/gia.png',
 'assets/referral-listening.webp','assets/about-community.webp','assets/referral-followup.webp',
 'assets/decision-options.webp','assets/referral-match.webp','assets/referral-safety.webp',
 'assets/services-community.webp','assets/contact-directory.webp','assets/services-explore.webp',
 'assets/decision-pathway.webp','assets/referral-warmhandoff.webp',
 'assets/referral-photo-2-safety.webp','assets/referral-preparing.webp'])
 assert(fs.existsSync(f),'image missing '+f);
assert(html.includes('assets/decision-image-overlay.css?v=4-referral-ribbon'),'must load image-layer CSS');
assert(html.includes('assets/decision-image-overlay.js?v=3-referral-ribbon'),'must load image-layer JS');
assert(sw.includes('decision-overlay-desktop.webp')&&sw.includes('decision-overlay-mobile.webp'),'cache artwork');
assert(js.includes("fetch('data/guide-content.json"),'render exact data, not invented labels');
assert(js.includes('state.more.append(b)'),'render all option buttons from source');
assert(js.includes('nativeBtn.click()'),'preserve original service modal action');
assert(js.includes('data-decision-directory'),'preserve source-linked agency directory action');
assert(js.includes('assets/mohw-official-logo.png'),'use actual MOHW image');
assert(css.includes('html.dgo-active'),'isolate new artwork to the Decision Guide');
assert(js.includes('dgo-premium-nav')&&css.includes('dgo-nav-button.is-active'),'Decision Guide uses Referrals-inspired icon-led active navigation');
assert(js.includes('dgo-search-matte')&&!js.includes('Search needs or agencies'),'Remove mobile search bar instead of leaving a decorative fake');
assert(!js.includes('state.searchInput')&&!js.includes('dgo-reset'),'Remove unused search and reset controls from illustrated guide');
console.log('DECISION_OVERLAY_STATIC_PASSED 13 situations, 26 options, two original artworks, official MOHW logo, real providers');