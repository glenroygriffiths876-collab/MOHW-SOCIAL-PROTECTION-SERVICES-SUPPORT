#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const BASE='http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const [name,width,height] of [['compact-phone',320,568],['phone',390,844],['phone-landscape',832,384],['tablet',768,1024],['desktop',1440,900]]){
   const page=await browser.newPage({viewport:{width,height},isMobile:width<=430,hasTouch:width<900});
   page.setDefaultTimeout(14000);
   await page.goto(BASE,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#p2-access-dialog')?.dataset.premium==='yes',null,{timeout:15000});
   await page.evaluate(()=>document.querySelector('[data-p2="access"]').click());
   await page.waitForFunction(()=>document.querySelector('#p2-access-dialog')?.open);
   const geometry=()=>page.evaluate(()=>{
    const d=document.getElementById('p2-access-dialog');
    const r=d.getBoundingClientRect(),p=d.querySelector('.ax-panel:not([hidden])');
    return {inside:r.top>=-2&&r.left>=-2&&r.bottom<=innerHeight+2&&r.right<=innerWidth+2,
      noScroll:d.scrollHeight<=d.clientHeight+3&&p.scrollHeight<=p.clientHeight+3,
      tabCount:d.querySelectorAll('[data-ax-tab]').length,panel:p.dataset.axPanel,
      visibleCards:p.querySelectorAll('button').length};
   });
   let g=await geometry();
   assert.equal(await page.locator('#p2-access-dialog .ax-footer').isVisible(),true,name+': footer Reset and Done stay visible');
   assert(g.inside&&g.noScroll&&g.tabCount===3&&g.panel==='display',name+': accessible, no-scroll display');
   await page.locator('#p2-access-dialog [data-ax-pref="size"][data-ax-value="large"]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('p2-large')),true,name+': text-size action retained');
   await page.evaluate(()=>{const c=document.querySelector('#p2-access-dialog [data-pref="links"]');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));});
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('p2-links')),true,name+': link underline action retained');
   await page.locator('#p2-access-dialog [data-ax-tab="listen"]').click();
   g=await geometry();assert(g.noScroll&&g.panel==='listen',name+': listen panel fits without scroll');
   await page.locator('#p2-access-dialog [data-ax-pref="rate"][data-ax-value="0.75"]').click();
   assert.equal(await page.locator('#p2-access-dialog [data-pref="rate"]').inputValue(),'0.75',name+': native voice speed updated');
   await page.locator('#p2-access-dialog [data-ax-tab="support"]').click();
   g=await geometry();assert(g.noScroll&&g.panel==='support',name+': support panel fits without scroll');
   console.log('ACCESSIBILITY_RESET_GEOMETRY',name,await page.evaluate(()=>{
     const d=document.querySelector('#p2-access-dialog'),f=d.querySelector('.ax-footer'),b=f.querySelector('[data-p2="reset"]');
     const rect=el=>{const a=el.getBoundingClientRect(),s=getComputedStyle(el);return {top:a.top,bottom:a.bottom,left:a.left,right:a.right,width:a.width,height:a.height,display:s.display,visibility:s.visibility,overflow:s.overflow}};
     return {open:d.open,dialog:rect(d),shell:rect(d.querySelector('.ax-shell')),footer:rect(f),reset:rect(b),active:d.querySelector('.ax-panel:not([hidden])')?.dataset.axPanel};
   }));
   await page.locator('#p2-access-dialog [data-p2="reset"]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('p2-large')),false,name+': reset size');
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('p2-links')),false,name+': reset links');
   await page.locator('#p2-access-dialog [data-p2="close"].ax-done').click();
   assert.equal(await page.locator('#p2-access-dialog').evaluate(e=>e.open),false,name+': close works');
   console.log('ACCESSIBILITY_PREMIUM_BROWSER_PASSED',name,width,height);
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
