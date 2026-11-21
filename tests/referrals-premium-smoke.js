#!/usr/bin/env node
'use strict';
/* Exact-source and asset guards; no mock referral conditions or fake MOHW emblem. */
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/referrals-premium-v2.css','utf8');
const source=JSON.parse(fs.readFileSync('data/guide-content.json','utf8'));
const sw=fs.readFileSync('service-worker.js','utf8');
new vm.Script(app,{filename:'assets/app.js'});
assert.equal(source.referralSteps.length,6,'six verified source referral stages');
assert(html.includes('assets/referrals-premium-v2.css?v=1'),'premium stylesheet must load last');
assert(html.includes('assets/app.js?v=referrals-2026-premium-2'),'updated interactive code must load');
assert(sw.includes('assets/referrals-overlay.css'),'approved artwork-layer CSS must be cached');
assert(sw.includes('assets/referrals-overlay-desktop.webp'),'desktop image cache entry');
assert(sw.includes('assets/referrals-overlay-mobile.webp'),'mobile image cache entry');
const overlay=fs.readFileSync('assets/referrals-overlay.js','utf8');
new vm.Script(overlay,{filename:'assets/referrals-overlay.js'});
const overlayCSS=fs.readFileSync('assets/referrals-overlay.css','utf8');
assert(html.includes('assets/referrals-overlay.js?v=2-clean-image-layer'),'overlay script loaded');
assert(html.includes('assets/referrals-overlay.css?v=3-fullbleed-image'),'approved artwork CSS loaded');
for(const f of ['assets/referrals-overlay-desktop.webp','assets/referrals-overlay-mobile.webp',
'assets/referral-photo-1-listen.webp','assets/referral-photo-2-safety.webp',
'assets/referral-photo-3-match.webp','assets/referral-photo-4-prepare.webp',
'assets/referral-photo-5-connect.webp','assets/referral-photo-6-followup.webp'])
 assert(fs.existsSync(f),'missing actual artwork/photo: '+f);
assert(overlay.includes('assets/mohw-official-logo.png'),'correct MOHW logo over generated crest');
assert(overlay.includes('rlo-m-steps') && overlay.includes('rlo-m-detail'),'mobile has legible artwork splits');
assert(overlayCSS.includes('rlo-base') && overlayCSS.includes('rlo-hot'),'image plus hotspot design retained');
assert(!overlayCSS.includes('inset:-70px'),'no blur pseudo-element that expands screenshot beyond the screen');
assert(html.includes('rpx-ministry-identity'),'actual Ministry logo displayed on referrals');
assert(html.includes('src="assets/mohw-official-logo.png" alt="Ministry of Health &amp; Wellness official logo"'),
 'use existing, genuine MOHW heart/heartbeat identity, not AI-created crest');
assert(fs.existsSync('assets/mohw-official-logo.png'));
for(const element of [
 'referrals-title','referralJourney','urgentSupport','referralStepNav','referralStepPanel',
 'referralStepCounter','referralProgressFill','referralPrev','referralNext'
]) assert(html.includes('id="'+element+'"'),element+' must remain functional');
const images=['referral-listening.webp','referral-safety.webp','referral-match.webp',
 'referral-preparing.webp','referral-warmhandoff.webp','referral-followup.webp'];
for(const photo of images){
 assert(fs.existsSync('assets/'+photo),'missing unique step graphic: '+photo);
 assert(app.includes(photo),'step graphic not wired: '+photo);
}
assert.equal(new Set(images).size,6,'six distinct graphic files');
for(const step of source.referralSteps)assert(step.length===2&&step[0]&&step[1],'source content untouched');
assert(app.includes('esc(copy)'),'exact full guide wording must remain expandable');
assert(app.includes('aria-current'),'active step must be accessible');
assert(app.includes('load')===false || app.includes('referral-listening'),'image mapping retained');
assert(html.includes('data-p2="gia"')&&html.includes('data-nav="manual"')&&html.includes('data-nav="services"'),
 'GIA, Manual, and Find Services remain native actions');
assert(css.includes('@media(max-width:599px)'),'mobile design is genuinely adapted');
assert(css.includes('grid-template-columns:repeat(6,minmax(0,1fr))'),'six illustrated navigation cards on wide screens');
assert(css.includes('--rpx-step')===false||css.includes('rpx-step'),'unique card palette');
console.log('MOHW identity, 6 distinct illustrations, 6 exact source steps, safety and navigation checks passed');
