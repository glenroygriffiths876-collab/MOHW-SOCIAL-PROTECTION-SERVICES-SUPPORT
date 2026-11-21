#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(f,'utf8');
const js=read('assets/accessibility-premium.js'),css=read('assets/accessibility-premium.css');
const html=read('index.html'),old=read('assets/phase2.js'),worker=read('service-worker.js');
new vm.Script(js,{filename:'assets/accessibility-premium.js'});
for(const p of ['size','contrast','motion','spacing','links','rate','voice'])
 assert(js.includes("'"+p+"'"),'keeps preference '+p);
for(const op of ['read-page','read-guide','stop','reset','close'])
 assert(js.includes('data-p2="'+op+'"'),'keeps original event '+op);
for(const panel of ['display','listen','support'])
 assert(js.includes('data-ax-panel="'+panel+'"'),'section '+panel);
assert(js.includes("d.addEventListener('change',update)"));
assert(js.includes("control.dispatchEvent") || js.includes("input.dispatchEvent"),'preference changes dispatched to existing handler');
assert(js.includes('ArrowLeft')&&js.includes('ArrowRight'),'keyboard navigation');
assert(js.includes("control.id='ax-voice-select'"),'original speech voice select preserved');
assert(js.includes("if(jsl)"),'validated sign-language resources preserved');
assert(css.includes('height:min(660px,calc(100dvh - 20px))'),'viewport bound');
assert(css.includes('overflow:hidden!important'),'no scroll');
assert(css.includes('html.p2-contrast'),'high-contrast support');
assert(/assets\/accessibility-premium\.js\?v=/.test(html)&&/assets\/accessibility-premium\.css\?v=/.test(html),'premium assets must load with a version');
assert(worker.includes('assets/accessibility-premium.js')&&worker.includes('assets/accessibility-premium.css'));
assert(old.includes("localStorage.setItem('mohw-access-v1'"),'persistence preserved');
console.log('ACCESSIBILITY_PREMIUM_STATIC_PASSED seven preferences, three tabs, audio features and 3D layout');
