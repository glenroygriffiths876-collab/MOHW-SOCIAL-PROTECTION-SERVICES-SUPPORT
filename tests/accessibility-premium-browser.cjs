#!/usr/bin/env node
'use strict';
const {chromium}=require('playwright-core'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const [width,height] of [[320,568],[360,640],[390,844],[768,1024],[1024,768],[1440,900]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:width<900,isMobile:width<=390});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.MOHWAccessibilityPremium?.dialog);
   await page.evaluate(()=>document.querySelector('[data-p2="access"]').click());
   await page.waitForFunction(()=>document.querySelector('#p2-access-dialog')?.open===true);
   const dialog=page.locator('#p2-access-dialog');
   const stats=await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,scroll:el.scrollHeight,client:el.clientHeight,ov:getComputedStyle(el).overflowY,tabs:el.querySelectorAll('[role=tab]').length}});
   assert(stats.left>=-2&&stats.right<=width+2&&stats.top>=-2&&stats.bottom<=height+2,'dialog fits '+width);
   assert.equal(stats.tabs,4,'four icon-led tabs on '+width);
   assert.equal(stats.ov,'hidden','no long scrolling accessibility menu');
   for(const tab of ['listen','display','comfort','communicate']){
    await dialog.locator('[data-a3-tab="'+tab+'"]').click();
    assert.equal(await dialog.locator('[data-a3-panel="'+tab+'"]').isVisible(),true,'tab '+tab);
   }
   await dialog.locator('[data-a3-tab="display"]').click();
   await dialog.locator('[data-a3-choice="size"][data-value="large"]').click();
   assert.equal(await dialog.locator('[data-pref="size"]').inputValue(),'large','text-size control works');
   await dialog.locator('[data-pref="contrast"]').check();
   assert.equal(await page.locator('html.p2-contrast').count(),1,'high-contrast mode works');
   await dialog.locator('[data-p2="reset"]').click();
   assert.equal(await dialog.locator('[data-pref="contrast"]').isChecked(),false,'reset works');
   await dialog.locator('[data-p2="close"]').last().click();
   assert.equal(await dialog.evaluate(el=>el.open),false,'dialog closes');
   assert.equal(errors.length,0,'no JS errors: '+errors.join('; '));
   console.log('PREMIUM_ACCESSIBILITY_VIEWPORT',width,height,JSON.stringify(stats));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});
