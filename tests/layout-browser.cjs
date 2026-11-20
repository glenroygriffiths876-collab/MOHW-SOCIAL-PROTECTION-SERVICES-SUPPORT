#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const BASE='http://127.0.0.1:8765/';
async function run(){
 const browser=await chromium.launch({
  headless:true, executablePath:process.env.CHROME_BIN||undefined,
  args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']
 });
 try{
  for(const width of [360,390,768]){
   const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1,isMobile:width<500,hasTouch:width<500});
   await page.goto(BASE,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#mainNav')?.classList.contains('premium-nav-upgraded'),null,{timeout:12000});
   await page.waitForFunction(()=>document.querySelector('#guideActionDock'),null,{timeout:10000});
   await page.locator('#exact-mobile .em-navigation button[aria-label="Referrals"]').click();
   const layout=await page.evaluate(()=>{
    const nav=document.querySelector('#mainNav');
    const buttons=Array.from(nav.querySelectorAll(':scope>button'));
    const rs=buttons.map(x=>x.getBoundingClientRect().toJSON());
    const services=nav.querySelector('button[data-nav="services"]');
    const dock=document.querySelector('#guideActionDock');
    const gia=document.querySelector('#gia2Launcher');
    return {
     buttonCount:buttons.length,
     rowCounts:[rs.filter(r=>Math.abs(r.y-rs[0].y)<3).length,rs.filter(r=>Math.abs(r.y-rs[3].y)<3).length],
     columns:getComputedStyle(nav).gridTemplateColumns.split(' ').length,
     widths:rs.map(r=>r.width),
     servicesColor:getComputedStyle(services).color,
     servicesBackground:getComputedStyle(services).backgroundImage,
     dockButtons:dock.querySelectorAll('.guide-action').length,
     dockDisplay:getComputedStyle(dock).display,
     dockX:dock.getBoundingClientRect().x,
     dockWidth:dock.getBoundingClientRect().width,
     dockGrid:getComputedStyle(dock).gridTemplateColumns,
     giaDisplay:getComputedStyle(gia).display,
     giaRight:window.innerWidth-gia.getBoundingClientRect().right,
     horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2
    };
   });
   assert.equal(layout.buttonCount,6,'must render six native navigation options');
   assert.equal(layout.columns,3,'native nav must use three equally sized columns');
   assert.deepEqual(layout.rowCounts,[3,3],'nav buttons must form exactly two rows of three');
   assert.ok(Math.max(...layout.widths)-Math.min(...layout.widths)<3,'nav button widths must be equal');
   assert.match(layout.servicesBackground,/linear-gradient/,'Services must have navy gradient');
   assert.equal(layout.servicesColor,'rgb(255, 255, 255)','Services label must stay white');
   assert.equal(layout.dockButtons,4,'must have four genuine guide actions');
   assert.equal(layout.dockDisplay,'grid','guide actions must use grid');
   assert.ok(layout.dockX+layout.dockWidth<=width+3,'guide actions must fit to right');
   assert.notEqual(layout.giaDisplay,'none','floating Gia must be visible');
   assert.ok(layout.giaRight<45,'Gia must remain bottom right');
   assert.equal(layout.horizontalOverflow,false,'no horizontal page overflow');
   await page.locator('#guideActionDock [data-action="download"]').click();
   await page.waitForFunction(()=>document.querySelector('#view-manual')?.classList.contains('active'),null,{timeout:7000});
   await page.locator('#mainNav button[data-nav="about"]').click();
   await page.waitForFunction(()=>document.querySelector('#exact-mobile:not([hidden])'),null,{timeout:7000});
   const home=await page.evaluate(()=>({
    nativeDock:getComputedStyle(document.querySelector('#guideActionDock')).display,
    oldDock:getComputedStyle(document.querySelector('#exact-mobile-utilities')).display,
    videoFirst:[...document.querySelector('#exact-mobile').children].findIndex(x=>x.classList.contains('em-video-section')) <
         [...document.querySelector('#exact-mobile').children].findIndex(x=>x.classList.contains('em-navigation')),
    gia:getComputedStyle(document.querySelector('#gia2Launcher')).display
   }));
   assert.equal(home.nativeDock,'grid','home must use same native guide dock');
   assert.equal(home.oldDock,'none','home must not have duplicate guide dock');
   assert.equal(home.videoFirst,true,'Gia introduction must remain immediately after header');
   assert.notEqual(home.gia,'none');
   console.log('MOBILE',width,JSON.stringify({layout,home}));
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#mainNav')?.classList.contains('premium-nav-upgraded'));
  await page.locator('#exact-home .exact-hit[aria-label="Referrals"]').click();
  const desktop=await page.evaluate(()=>{
   const nav=document.querySelector('#mainNav'),buttons=[...nav.querySelectorAll(':scope>button')];
   return {cols:getComputedStyle(nav).gridTemplateColumns.split(' ').length,count:buttons.length,
     buttons:buttons.map(x=>{let r=x.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width}}),
     active:getComputedStyle(nav.querySelector('button[data-nav="referrals"]')).backgroundImage,
     horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2};
  });
  assert.equal(desktop.cols,6,'desktop native header must have six options');
  assert.equal(desktop.count,6);
  assert.equal(desktop.buttons.every(x=>Math.abs(x.y-desktop.buttons[0].y)<3),true,'desktop buttons must share a row');
  assert.equal(desktop.horizontalOverflow,false);
  await page.locator('#mainNav button[data-nav="about"]').click();
  await page.waitForFunction(()=>document.querySelector('#exact-home:not([hidden])'),null,{timeout:7000});
  const artwork=await page.evaluate(()=>{
   const img=document.querySelector('#exact-home .exact-art'),r=img.getBoundingClientRect();
   return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,ratio:r.width/r.height,viewport:innerWidth};
  });
  assert.equal(artwork.naturalWidth,1448);
  assert.equal(artwork.naturalHeight,1086);
  assert.ok(Math.abs(artwork.ratio-1448/1086)<.005,'desktop artwork is not distorted');
  console.log('DESKTOP',JSON.stringify({desktop,artwork}));
  await page.close();
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1)});
