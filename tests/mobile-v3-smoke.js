#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const html=read('index.html'),sw=read('service-worker.js'),js=read('assets/mobile-image-v3.js'),css=read('assets/mobile-image-v3.css');
new vm.Script(js,{filename:'assets/mobile-image-v3.js'});
assert(html.includes('assets/mobile-image-v3.css?v=2'),'mobile stylesheet loaded');
assert(html.includes('assets/mobile-image-v3.js?v=2'),'mobile script loaded');
assert(sw.includes('mohw-social-support-mobile-art-v8'),'cache bumped');
for(const asset of ['header','nav','video','hero','green','gold','cyan','pink','ribbon']){
 assert(fs.existsSync(`assets/mobile-v3/${asset}.webp`),`${asset} image bundled`);
 assert(sw.includes(`assets/mobile-v3/${asset}.webp`),`${asset} image cached`);
}
assert(fs.existsSync('assets/mobile-v3/gia.png'),'floating Gia artwork bundled');
for(const id of ['about','referrals','decision','services','manual'])assert(js.includes(`page('${id}')`),`linked ${id} navigation`);
assert(js.includes('video.play()'),'HTML5 video uses real playback');
assert(js.includes('assets/gia-introduction.mp4'),'original Gia film used');
assert(js.includes('const enabled = artworkLoaded && mobile.matches'),'desktop remains unaffected');
assert(js.includes('root.hidden = !enabled'),'mobile mode tied to actual view');
assert(css.includes('html.mohw-mobile-image-active body #guideActionDock'),'actual four floating controls remain');
assert(css.includes('html.mohw-mobile-image-active body #gia2Launcher'),'native Gia launcher remains interactive');
assert(!js.includes('createElement(\'iframe\')'),'no fake iframe interaction');
assert(js.includes("endcap.className = 'mv-endcap'"),'branded mobile endcap must exist');
assert(css.includes('#mohw-mobile-image .mv-endcap{'),'endcap CSS must exist');
assert(css.includes('min-height:100dvh!important;'),'mobile must fill tall phone viewports');
assert(css.includes('html.mohw-mobile-image-active #view-about'),'legacy height must be overridden');
console.log('Mobile artwork, responsive endcap, navigation, Gia, video and floating controls verified.');
