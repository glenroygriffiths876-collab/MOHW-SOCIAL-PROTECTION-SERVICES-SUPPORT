import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({reducedMotion:'reduce'});
const widths=[320,375,390,768,1024,1440];
const base='http://127.0.0.1:8765/';
const errors=[];
try{
 for(const w of widths){
  const page=await context.newPage({viewport:{width:w,height:w<700?800:850}});
  const consoleErrors=[];
  page.on('pageerror',e=>consoleErrors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#view-about.active');
  await page.waitForTimeout(700);
  const layout=await page.evaluate(()=>({
   viewport:window.innerWidth,
   scrollWidth:document.documentElement.scrollWidth,
   tileCount:document.querySelectorAll('#view-about .p2-tile').length,
   homeArt:document.querySelector('img[src="assets/about-community.webp"]')?.naturalWidth||0,
   source:document.querySelector('#gia-welcome-video source')?.getAttribute('src')
  }));
  assert.equal(layout.tileCount,4,'All four working navigation tiles must remain');
  assert.equal(layout.source,'assets/media/GIA_MOHW_Social_Support_QR_Fixed.mp4');
  assert(layout.homeArt>0,'Original home illustration must load');
  if(layout.scrollWidth>layout.viewport+3) errors.push(w+'px horizontal overflow '+layout.scrollWidth+'/'+layout.viewport);
  await page.screenshot({path:'visual-preview/home-'+w+'.png',fullPage:true});
  if(w===390||w===1440){
   await page.locator('#mainNav button[data-nav="referrals"]').click({force:true});
   await page.waitForSelector('#view-referrals.active');
   await page.waitForFunction(()=>document.querySelectorAll('#premium-referral-diagram button').length===6);
   await page.screenshot({path:'visual-preview/referrals-'+w+'.png',fullPage:true});
   const labels=await page.locator('#premium-referral-diagram button').allTextContents();
   assert.equal(labels.length,6,'Referral path must use all six actual steps');
   await page.locator('#mainNav button[data-nav="services"]').click({force:true});
   await page.waitForSelector('#view-services.active');
   await page.screenshot({path:'visual-preview/services-'+w+'.png',fullPage:true});
  }
  if(consoleErrors.length)errors.push(w+'px page errors: '+consoleErrors.join('; '));
  await page.close();
 }
}finally{
 await browser.close();
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log('Visual smoke checks passed for 320, 375, 390, 768, 1024, 1440px; referral and service interactions passed.');
