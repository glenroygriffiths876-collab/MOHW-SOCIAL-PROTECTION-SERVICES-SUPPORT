#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {chromium}=require('playwright-core');
const BASE='http://127.0.0.1:8765/';
const OUT='/tmp/mohw-responsive-shots/decision-overlay';
fs.mkdirSync(OUT,{recursive:true});
const sizes=[['small-phone',320,568],['standard-phone',390,844],['large-phone',430,932],['tablet-portrait',768,1024],['tablet-landscape',1024,768],['samsung-tablet',1280,800],['desktop',1440,900],['full-hd',1920,1080]];
const scenarios=['Someone who wants/needs mental health support','A Parent or Student','A Senior (60+)','Looking for Skills Training and Work','A Person with a Disability','In a Crisis (Fire, Death)','An Entrepreneur/Farmer/ Backyard Gardening','A Patient Needing Tests','A Patient Needing Treatment','Affected by Substance Misuse','Experiencing Abuse, Domestic Violence, or GBV','Affected by Disaster or Fire','A Pregnant Adolescent or Adolescent Mother or Vulnerable Chidren'];
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
for(const [name,w,h] of sizes){
const mobile=w<900;
const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:w<=430,hasTouch:w<900});
const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.setDefaultTimeout(15000);
await page.goto(BASE,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.MOHWDecisionOverlay?.count===13,null,{timeout:18000});
await page.evaluate(()=>document.querySelector('#mainNav button[data-nav="decision"]').click());
await page.waitForFunction(()=>document.documentElement.classList.contains('dgo-active'));
const art=mobile?'.dgo-mobile':'.dgo-desktop';
const basics=await page.evaluate(mobile=>{
const a=document.querySelector('#decision-image-overlay '+(mobile?'.dgo-mobile':'.dgo-desktop'));
const logo=a.querySelector('.dgo-logo img');const r=a.getBoundingClientRect();
return{visible:getComputedStyle(a).display!=='none',src:a.querySelector('.dgo-base').getAttribute('src'),
 width:r.width,viewport:innerWidth,noOverflow:document.documentElement.scrollWidth<=innerWidth+3,
 oldHidden:getComputedStyle(document.querySelector('#view-decision .page-hero')).display==='none',
 logo:logo.getAttribute('src'),logoLoaded:logo.complete&&logo.naturalWidth>50,
 nativeHeaderHidden:getComputedStyle(document.querySelector('.site-header')).display==='none',
 mobileHeight:document.documentElement.scrollHeight,screenHeight:innerHeight,artTop:r.top,artBottom:r.bottom};
},mobile);
assert.equal(basics.visible,true,name+': premium screenshot visible');
assert.equal(basics.noOverflow,true,name+': no horizontal overflow');
assert.equal(basics.oldHidden,true,name+': no duplicate CSS decision page');
assert.equal(basics.nativeHeaderHidden,true,name+': only the new image-matched navbar is visible');
const ribbon=await page.evaluate(mobile=>{
 const frame=document.querySelector('#decision-image-overlay '+(mobile?'.dgo-mobile':'.dgo-desktop'));
 const nav=frame.querySelector('.dgo-nav-ribbon');
 const buttons=[...nav.querySelectorAll('.dgo-nav-button')];
 const search=frame.querySelector('.dgo-search-matte');
 const base=frame.getBoundingClientRect(),r=nav.getBoundingClientRect();
 return {count:buttons.length,icons:buttons.filter(b=>!!b.querySelector('svg')).length,
  labels:buttons.map(b=>b.getAttribute('aria-label')),active:buttons.find(b=>b.classList.contains('is-active'))?.getAttribute('aria-label'),
  searchHidden:!!search&&getComputedStyle(search).display!=='none',
  inside:r.left>=base.left-2&&r.right<=base.right+2,
  background:getComputedStyle(nav).backgroundImage};
},mobile);
assert.equal(ribbon.count,6,name+': all six referral-matched navigation buttons');
assert.equal(ribbon.icons,6,name+': all navigation icons visible');
assert.equal(ribbon.active,'Decision Guide',name+': correct page highlighted');
assert.equal(ribbon.searchHidden,true,name+': painted search band replaced');
assert.equal(ribbon.inside,true,name+': navigation remains inside viewport');
assert.match(ribbon.background,/gradient/,name+': glossy navy ribbon');
assert.equal(basics.logo,'assets/mohw-official-logo.png',name+': official MOHW logo');
assert.equal(basics.logoLoaded,true,name+': MOHW logo image decoded');
assert.ok(basics.width>0&&basics.width<=w+2,name+': artwork fits landscape/portrait viewport without clipping');
if(mobile) assert.equal(basics.src,'assets/decision-overlay-mobile.webp');
else assert.equal(basics.src,'assets/decision-overlay-desktop.webp');
assert.ok(basics.mobileHeight<=basics.screenHeight+5,name+': page fits without scrolling');
console.log('DECISION_FRAME_FIT',name,JSON.stringify({top:basics.artTop,bottom:basics.artBottom,screen:basics.screenHeight,width:basics.width}));
assert.ok(basics.artTop>=-2&&basics.artBottom<=basics.screenHeight+2,name+': image stays vertically within viewport');
const all=[];
for(let i=0;i<scenarios.length;i++){
  const s=scenarios[i];
  await page.evaluate(s=>window.MOHWDecisionOverlay.select(s),s)
  await page.waitForFunction(s=>document.querySelector('.dgo-'+(innerWidth<900?'mobile':'desktop')+' .dgo-results h2')?.getAttribute('aria-label')===s,s);
  const info=await page.evaluate(mobile=>{
    const root=document.querySelector('#decision-image-overlay '+(mobile?'.dgo-mobile':'.dgo-desktop'));
    const im=root.querySelector('.dgo-photo img');
    return{photo:im.getAttribute('src'),label:root.querySelector('.dgo-results h2').textContent,
      fullLabel:root.querySelector('.dgo-results h2').getAttribute('aria-label'),
      routes:root.querySelectorAll('.dgo-more .dgo-route').length,
      overflow:document.documentElement.scrollWidth>innerWidth+3,
      height:document.documentElement.scrollHeight,
      photoLoaded:im.complete&&im.naturalWidth>100};
  },mobile);
  if(!info.photoLoaded)await page.waitForFunction(mobile=>{const im=document.querySelector('.dgo-'+(mobile?'mobile':'desktop')+' .dgo-photo img');return im.complete&&im.naturalWidth>100},mobile);
  assert.equal(info.fullLabel,s,name+': complete source title remains accessible '+i);
  assert.ok(info.label.length>0,name+': mobile-friendly display label '+i);
  assert.ok(info.routes>=1&&info.routes<=2,name+': options paginated without scrolling for situation '+i);
  assert.equal(info.overflow,false,name+': no overflow scenario '+i);
  all.push(info.photo);
  if((i===0||i===8||i===12)&&['standard-phone','samsung-tablet','desktop'].includes(name))
    await page.screenshot({path:path.join(OUT,name+'-situation-'+(i+1)+'.png'),fullPage:true,animations:'disabled'});
}
assert.equal(new Set(all).size,13,name+': all 13 illustrated situation scenes are distinct');
if(mobile){
  await page.evaluate(s=>window.MOHWDecisionOverlay.select(s),scenarios[1]);
  const modalButton=page.locator('#decision-image-overlay .dgo-mobile .dgo-more .dgo-route').first();
  await modalButton.click();await page.waitForFunction(()=>document.querySelector('.dgo-dialog')?.open);
  const text=await page.locator('.dgo-dialog #dgo-dialog-options').textContent();
  assert.ok(text.length>5 && (text.includes('PATH') || text.includes('Rehabilitation') || text.includes('STW')),name+': exact route wording preserved');
  assert.ok((await page.locator('.dgo-dialog-provider').textContent()).includes('Named provider'),name+': exact provider in modal');
  await page.locator('.dgo-dialog [data-close]').click();
  await page.locator('#decision-image-overlay .dgo-mobile .dgo-emergency .dgo-hit').click();
  await page.waitForFunction(()=>document.querySelector('.dgo-dialog')?.open);
  assert.ok((await page.locator('#dgo-dialog-options').textContent()).includes('Do not wait for a directory search'));
  await page.locator('.dgo-dialog [data-close]').click();
  assert.equal(await page.locator('#decision-image-overlay .dgo-mobile .dgo-search input').count(),0,name+': search removed');
  assert.equal(await page.locator('#decision-image-overlay .dgo-mobile .dgo-reset').count(),0,name+': reset removed');
  const deck=page.locator('.dgo-mobile .dgo-deck-inner');
   assert.equal(await deck.isVisible(),true,name+': 3D activity deck is visible');
   await deck.locator('.dgo-deck-all').click();
   assert.equal(await page.locator('.dgo-picker-dialog').evaluate(el=>el.open),true,name+': paged situation gallery opens');
   assert.equal(await page.locator('.dgo-picker-grid .dgo-picker-item').count(),4,name+': four choices, no long dropdown');
   await page.locator('.dgo-picker-foot [data-pager="1"]').click();
   assert.equal(await page.locator('.dgo-picker-page').textContent(),'2 / 4',name+': gallery changes pages');
   await page.locator('.dgo-picker-close').click();
  await page.locator('#decision-image-overlay .dgo-mobile .dgo-gia .dgo-hit').click();
  await page.waitForFunction(()=>document.querySelector('#gia2Dialog')?.open===true);
  await page.locator('#gia2Close').click();
}
assert.equal(errs.length,0,name+': JS errors: '+errs.join('; '));
console.log('DECISION_OVERLAY_VIEWPORT',name,'13 situations / 26 source options / image layers / logo / navigation passed');
if(name==='standard-phone'){
 await page.locator('.dgo-mobile .dgo-footer-0 .dgo-hit').click();
 await page.waitForFunction(()=>document.querySelector('#view-services.active')!==null);
 await page.evaluate(()=>document.querySelector('#mainNav [data-nav="decision"]').click());
 await page.waitForFunction(()=>document.querySelector('#view-decision.active')!==null);
}
await page.close();
}
console.log('DECISION_OVERLAY_ALL_PASSED',sizes.length,'sizes x 13 scenarios plus real native actions');
}finally{await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});