#!/usr/bin/env node
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT='http://127.0.0.1:8765/';
const DIR='/tmp/mohw-responsive-shots/referrals-v2';
fs.mkdirSync(DIR,{recursive:true});
const expectedImages=[
 'referral-listening.webp','referral-safety.webp','referral-match.webp',
 'referral-preparing.webp','referral-warmhandoff.webp','referral-followup.webp'
];
const expectedTitles=[
 'Identify the need','Check urgency and safety','Match the person to a service',
 'Prepare for the referral','Make a warm referral where possible','Document and follow up'
];
const sizes=[
 ['small-phone',320,568],['phone',390,844],['large-phone',430,932],
 ['tablet-portrait',768,1024],['tablet-landscape',1024,768],
 ['samsung-tablet-landscape',1280,800],['desktop',1440,900],['full-hd',1920,1080]
];
async function run(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,
   args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 for(const [name,w,h] of sizes){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1,hasTouch:w<900,isMobile:w<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);
  await page.goto(ROOT,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#mainNav [data-nav="referrals"]')&&window.MOHWGIA, null,{timeout:18000});
  await page.evaluate(()=>document.querySelector('#mainNav [data-nav="referrals"]').click());
  await page.waitForFunction(()=>document.querySelector('#view-referrals.active .rpx-step-tab.is-current')?.getAttribute('data-ref-step')==='0',{timeout:12000});
  const brand=await page.locator('#view-referrals .rpx-ministry-identity img').evaluate(img=>({
    path:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight
  }));
  assert.equal(brand.path,'assets/mohw-official-logo.png',name+' must show correct MOHW mark');
  assert.ok(brand.width>600,name+' high quality official logo should load');
  assert.equal(await page.locator('#view-referrals .rpx-step-tab').count(),6,name+' 6 live buttons');
  assert.equal(await page.locator('#view-referrals .rpx-step-tab .rpx-step-icon svg').count(),6,name+' six distinct icons');
  const checked=[];
  for(let i=0;i<6;i++){
    await page.locator('#view-referrals .rpx-step-tab[data-ref-step="'+i+'"]').click();
    await page.waitForFunction(i=>document.querySelector('#view-referrals .rpx-step-tab.is-current')?.dataset.refStep===String(i),i);
    // Images change dynamically; wait until the actual bitmap has decoded.
    await page.waitForFunction(()=>{
      const el=document.querySelector('#view-referrals .rpx-step-scene img');
      return Boolean(el && el.complete && el.naturalWidth>600);
    },null,{timeout:12000});
    const info=await page.evaluate(()=>{
      const img=document.querySelector('#view-referrals .rpx-step-scene img');
      const r=img.getBoundingClientRect();
      const nav=[...document.querySelectorAll('#view-referrals .rpx-step-tab')].map(e=>e.getBoundingClientRect());
      const panel=document.querySelector('#view-referrals .rpx-feature').getBoundingClientRect();
      return {
       img:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>600,
       title:document.querySelector('#activeReferralStepTitle').textContent.trim(),
       stage:document.querySelector('#referralStepCounter').textContent.trim(),
       progress:document.querySelector('.journey-progress-track').getAttribute('aria-valuenow'),
       navAligned:nav.every(n=>n.left>=-2&&n.right<=innerWidth+2&&n.width>70),
       noHorizOverflow:document.documentElement.scrollWidth<=innerWidth+3,
       panelWidth:panel.width, imageWidth:r.width,
       sourceLength:document.querySelector('.rpx-full-guide p').textContent.trim().length
      };
    });
    assert.ok(info.img.endsWith(expectedImages[i]),name+' step '+(i+1)+' unique scene matches');
    assert.equal(info.title,expectedTitles[i],name+' step '+(i+1)+' exact title');
    assert.ok(info.loaded,name+' step '+(i+1)+' actual graphic loads');
    assert.equal(info.progress,String(i+1),name+' step '+(i+1)+' progress correct');
    assert.ok(info.sourceLength>80,name+' step '+(i+1)+' full guide is preserved');
    assert.equal(info.noHorizOverflow,true,name+' step '+(i+1)+' no overflow');
    assert.equal(info.navAligned,true,name+' step '+(i+1)+' navigation stays on screen');
    assert.ok(info.imageWidth>100,name+' step '+(i+1)+' image is visible');
    checked.push(info.img);
    if(['phone','samsung-tablet-landscape','desktop'].includes(name)){
      await page.screenshot({path:path.join(DIR,name+'-step-'+(i+1)+'.png'),fullPage:true,animations:'disabled'});
    }
  }
  assert.equal(new Set(checked).size,6,name+' unique scene graphic for each of six steps');
  await page.locator('#referralPrev').click();
  assert.equal(await page.locator('.rpx-step-tab.is-current').getAttribute('data-ref-step'),'4',name+' Previous works');
  await page.locator('#referralNext').click();
  assert.equal(await page.locator('.rpx-step-tab.is-current').getAttribute('data-ref-step'),'5',name+' Next works');
  await page.locator('#referralNext').click();
  assert.equal(await page.locator('.rpx-step-tab.is-current').getAttribute('data-ref-step'),'0',name+' Restart works');
  await page.locator('#view-referrals .rpx-full-guide summary').click();
  assert.equal(await page.locator('#view-referrals .rpx-full-guide').evaluate(el=>el.open),true,name+' full guide expandable');
  const safety=(await page.locator('#urgentSupport').innerText());
  assert.ok(safety.includes('Urgent safety comes first') && safety.includes('emergency and safeguarding'),name+' safety content');
  const actions=await page.locator('#view-referrals .rpx-tail-actions button').count();
  assert.equal(actions,3,name+' 3 closing functional controls');
  assert.equal(errors.length,0,name+' uncaught JS errors '+errors.join(','));
  console.log('REFERRALS_VIEWPORT',name,'6 unique scenes; source, buttons, logo, progress, overflow verified');
  if(name==='phone'){
    await page.locator('#view-referrals .rpx-tail-actions [data-p2="gia"]').click();
    await page.waitForFunction(()=>document.querySelector('#gia2Dialog')?.open===true);
    await page.locator('#gia2Close').click();
    await page.locator('#view-referrals .rpx-tail-actions [data-nav="services"]').click();
    await page.waitForFunction(()=>document.querySelector('#view-services.active')!==null);
    await page.evaluate(()=>document.querySelector('#mainNav [data-nav="referrals"]').click());
    await page.waitForFunction(()=>document.querySelector('#view-referrals.active')!==null);
    await page.locator('#view-referrals .rpx-tail-actions [data-nav="manual"]').click();
    await page.waitForFunction(()=>document.querySelector('#view-manual.active')!==null);
    console.log('REFERRAL_ACTIONS','GIA, Find Services, Digital Manual working');
  }
  await page.close();
 }
 console.log('REFERRALS_PREMIUM_ALL_CHECKS_PASSED',sizes.length,'responsive sizes x 6 distinct illustrated stages');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1)});
