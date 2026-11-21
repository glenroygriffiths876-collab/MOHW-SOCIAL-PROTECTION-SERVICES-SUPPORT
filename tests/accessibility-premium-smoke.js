#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('service-worker.js','utf8');
const js=fs.readFileSync('assets/accessibility-premium.js','utf8');
const css=fs.readFileSync('assets/accessibility-premium.css','utf8');
new vm.Script(js,{filename:'accessibility-premium.js'});
assert(html.includes('assets/accessibility-premium.js?v=1-3d'));
assert(html.includes('assets/accessibility-premium.css?v=1-3d'));
assert(sw.includes('assets/accessibility-premium.js')&&sw.includes('assets/accessibility-premium.css'));
for(const action of ['read-page','read-guide','pause','resume','stop','reset','close','gia','welcome'])
 assert(js.includes("'"+action+"'"),'native accessibility action '+action);
for(const setting of ['contrast','motion','spacing','links'])
 assert(js.includes("'"+setting+"'"),'accessibility preference '+setting);
for(const pref of ['size','rate','voice'])assert(js.includes("'"+pref+"'"),'audio control '+pref);
assert(js.includes('role="tab"')&&js.includes('role="tabpanel"'),'four icon-led tabs are accessible');
assert(css.includes('overflow:hidden!important'),'premium dashboard is not a scrolling settings sheet');
assert(js.includes('append(jsl)'),'validated Jamaican Sign Language resources retained');
console.log('PREMIUM_ACCESSIBILITY_STATIC_PASSED original audio/actions/preferences retained');
