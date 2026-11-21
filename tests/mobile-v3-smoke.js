#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const html=read('index.html'),sw=read('service-worker.js'),js=read('assets/mobile-image-v3.js'),css=read('assets/mobile-image-v3.css');
new vm.Script(js,{filename:'assets/mobile-image-v3.js'});
assert(html.includes('assets/mobile-image-v3.css?v=4-natural-scroll'),'mobile stylesheet loaded');
assert(html.includes('assets/mobile-image-v3.js?v=5-footer-actions'),'mobile script loaded');
assert(sw.includes('mohw-social-support-referrals-v12'),'cache bumped');
for(const asset of ['header','nav','video','hero','green','gold','cyan','pink','ribbon']){
 assert(fs.existsSync(`assets/mobile-v3/${asset}.webp`),`${asset} image bundled`);
 assert(sw.includes(`assets/mobile-v3/${asset}.webp`),`${asset} image cached`);
}
assert(fs.existsSync('assets/mobile-v3/gia.png'),'floating Gia artwork bundled');
for(const id of ['about','referrals','decision','services','manual'])assert(js.includes(`page('${id}')`),`linked ${id} navigation`);
assert(js.includes('video.play()'),'HTML5 video uses real playback');
assert(js.includes('assets/gia-introduction.mp4'),'original Gia film used');
assert(js.includes('const enabled=artworkLoaded && mobile.matches'),'desktop remains unaffected');
assert(js.includes('root.hidden=!enabled'),'mobile mode tied to actual view');
assert(css.includes('.mv-bottom-action-space #guideActionDock'),'native guide tools sit inside the footer');
assert(css.includes('.mv-bottom-action-space #gia2Launcher'),'native Gia launcher sits inside footer');
assert(!js.includes('createElement(\'iframe\')'),'no fake iframe interaction');
assert(!js.includes("endcap.className = 'mv-endcap'"),'unneeded bottom endcap removed');
assert(js.includes("button.classList.add('mv-manual-clean')"),'clean manual card uses live typography');
assert(css.includes('#mohw-mobile-image .mv-manual-book'),'retains only original book art');
assert(css.includes('#gia2Launcher::after'),'duplicate GIA label is suppressed');
assert(css.includes('max-height:none!important'),'mobile homepage must not be trapped at a single viewport');
assert(css.includes('overflow-y:auto!important'),'short mobile screens must scroll naturally');
assert(js.includes('moveActions(enabled)'),'native guide controls must move into the in-flow footer');

const balanceCss=read('assets/home-dock-rebalance.css');
assert(css.includes('justify-content:center!important'),'Gia film should be centered on mobile');
assert(css.includes('grid-template-columns:none!important'),'Home utilities should use one horizontal row');
assert(js.includes("root.append(actionSpace)"),'Homepage reserves real space for the action row');
console.log('Single-screen mobile home, no cropped Gia, single label, video and navigation verified.');
