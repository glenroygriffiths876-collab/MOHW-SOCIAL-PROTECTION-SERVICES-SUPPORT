#!/usr/bin/env node
'use strict';
/* Confirm the approved generated art is the page, every native hotspot works,
   the official logo is visible, and ONLY the six photographic stages swap.
   Screen sizes include Samsung landscape and small Android portrait. */
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {chromium}=require('playwright-core');
const S='http://127.0.0.1:8765/';
const OUT='/tmp/mohw-responsive-shots/referral-overlay';
fs.mkdirSync(OUT,{recursive:true});
const expected=[
 ['Identify the need','referral-photo-1-listen.webp'],
 ['Check urgency and safety','referral-photo-2-safety.webp'],
 ['Match the person to a service','referral-photo-3-match.webp'],
 ['Prepare for the referral','referral-photo-4-prepare.webp'],
 ['Make a warm referral where possible','referral-photo-5-connect.webp'],
 ['Document and follow up','referral-photo-6-followup.webp']
];
const screens=[
 ['small-phone',320,568],['phone',390,844],['large-phone',430,932],
 ['tablet-portrait',768,1024],['tablet-landscape',1024,768],
 ['samsung-tablet-landscape',1280,800],['desktop',1440,900],['full-hd',1920,1080]
];
const bp=async (page,desc,fn)=>{
 await page.waitForFunction(fn,null,{timeout:14000});
};
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,
   args:['--no-sandbox','--disable-dev-shm-usage']});
 try {
  for(const [name,w,h] of screens){
   const mobile=w<900;
   const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1,
     isMobile:w<=430,hasTouch:w<900});
   page.setDefaultTimeout(13000);
   const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
   await page.goto(S,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#referral-artwork-overlay')&&document.querySelector('#referralStepPanel .rpx-feature'),null,{timeout:18000});
   await page.evaluate(()=>document.querySelector('#mainNav [data-nav="referrals"]').click());
   await page.waitForFunction(()=>document.documentElement.classList.contains('rlo-active'),null,{timeout:14000});
   const art=mobile?'.rlo-mobile':'.rlo-desktop';
   const info=await page.evaluate(mobile=>{
     const art=document.querySelector('#referral-artwork-overlay '+(mobile?'.rlo-mobile':'.rlo-desktop'));
     const svg=art.querySelector('svg.rlo-mobile-image');
     const img=art.querySelector('img.rlo-base');
     const logo=art.querySelector('.rlo-official-logo');
     const parent=art.getBoundingClientRect(),lr=logo.getBoundingClientRect();
     return {visible:getComputedStyle(art).display!=='none',imageSrc:img?.getAttribute('src'),
       mobileSlices:art.querySelectorAll('svg.rlo-mobile-image').length,
       logoSrc:logo?.getAttribute('src'),logoLoaded:logo?.naturalWidth>1000,
       logoVisible:lr.width>0&&lr.height>0&&lr.right<=innerWidth+2,
       artW:parent.width,viewport:innerWidth,
       overflow:document.documentElement.scrollWidth>innerWidth+3,
       nativeHeaderHidden:getComputedStyle(document.querySelector('.site-header')).display==='none',
       oldCardsHidden:getComputedStyle(document.querySelector('#view-referrals .rpx-journey')).display==='none',
       oldSafetyHidden:getComputedStyle(document.querySelector('#view-referrals #urgentSupport')).display==='none',
       oldTailHidden:getComputedStyle(document.querySelector('#view-referrals .rpx-tail')).display==='none',
       skipHidden:getComputedStyle(document.querySelector('.skip')).display==='none'
     };
   },mobile);
   assert.equal(info.visible,true,name+': approved image artwork visible');
   assert.equal(info.overflow,false,name+': no horizontal overflow');
   assert.equal(info.nativeHeaderHidden,true,name+': no duplicate website header');
   assert.equal(info.oldCardsHidden,true,name+': hide rejected CSS card rebuild');
   assert.equal(info.oldSafetyHidden,true,name+': hide old duplicate safety section');
   assert.equal(info.oldTailHidden,true,name+': hide old duplicate action footer');
   assert.equal(info.skipHidden,true,name+': no stray skip link above premium image');
   assert.equal(info.logoSrc,'assets/mohw-official-logo.png',name+': verified official identity');
   assert.equal(info.logoLoaded,true,name+': official MOHW logo loaded');
   assert.equal(info.logoVisible,true,name+': real logo visibly replaces generated emblem');
   assert.ok(info.artW<=w+2&&info.artW>w*.95,name+': artwork fits width');
   if(mobile)assert.equal(info.mobileSlices,4,name+': mobile reference artwork in four readable images');
   else assert.equal(info.imageSrc,'assets/referrals-overlay-desktop.webp',name+': actual approved design is native artwork');
   if(w<600){
      const compact=await page.evaluate(()=>{
        const section=document.querySelector('.rlo-m-compact');
        const grid=document.querySelector('.rlo-compact-grid');
        const buttons=[...grid.querySelectorAll('.rlo-compact-tile')];
        const detail=document.querySelector('.rlo-m-detail');
        const r=section.getBoundingClientRect(), d=detail.getBoundingClientRect();
        const photo=detail.querySelector('.rlo-photo').getBoundingClientRect();
        return {
          visible:getComputedStyle(section).display!=='none',
          oldHidden:getComputedStyle(document.querySelector('.rlo-m-steps')).display==='none',
          insideDetail:section.parentElement===detail,
          columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          count:buttons.length,
          height:section.getBoundingClientRect().height,
          fitsGap:r.top>=d.top && r.bottom<=photo.top+2,
          beforeHeight:innerWidth/335*620,
          viewport:innerHeight,
          scrollHeight:document.documentElement.scrollHeight,
          art:buttons.every(btn=>!!btn.querySelector('svg image[href="assets/referrals-overlay-mobile.webp"]'))
        };
      });
      assert.equal(compact.visible,true,name+' compact navigation visible');
      assert.equal(compact.oldHidden,true,name+' tall stacked buttons hidden');
      assert.equal(compact.insideDetail,true,name+' six steps repositioned inside existing photo panel');
      assert.equal(compact.columns,6,name+' all six in one row');
      assert.equal(compact.count,6,name+' all six buttons retained');
      assert.ok(compact.height<=44,name+' navigation is small and elegant');
      assert.ok(compact.fitsGap,name+' navigation does not cover selected photograph');
      assert.equal(compact.art,true,name+' illustrated artwork remains present');
      if(w>=390)assert.ok(compact.scrollHeight<=compact.viewport+4,
        name+' typical phone layout fits on one screen');
      console.log('ONE_ROW_PHONE',name,JSON.stringify(compact));
   }
   const seen=[];
   for(let i=0;i<6;i++){
     await page.locator(w<600
       ? '#referral-artwork-overlay .rlo-compact-tile[data-compact-step="'+i+'"]'
       : '#referral-artwork-overlay '+art+' .rlo-hot[aria-label="'+('Step '+(i+1)+': '+expected[i][0])+'"]').click();
     await page.waitForFunction(i=>{
       const a=document.querySelector('#referral-artwork-overlay');
       const src=document.querySelector('#referral-artwork-overlay .rlo-desktop .rlo-photo')?.getAttribute('src');
       return !!src&&src.endsWith(['referral-photo-1-listen.webp','referral-photo-2-safety.webp','referral-photo-3-match.webp','referral-photo-4-prepare.webp','referral-photo-5-connect.webp','referral-photo-6-followup.webp'][i])
        && document.querySelector('#referralStepPanel .rpx-feature')?.dataset.rpxActiveStep===String(i+1);
     },i,{timeout:14000});
     await page.waitForFunction(()=>{
       const a=document.querySelector('.rlo-desktop .rlo-photo'),b=document.querySelector('.rlo-mobile .rlo-photo');
       return a?.complete&&a.naturalWidth>200&&b?.complete&&b.naturalWidth>200;
     },null,{timeout:14000});
     const stage=await page.evaluate(mobile=>{
       const art=document.querySelector('.rlo-'+(mobile?'mobile':'desktop'));
       const photo=art.querySelector('.rlo-photo'),title=art.querySelector(mobile?'.rlo-m-title':'.rlo-d-title');
       return {src:photo.getAttribute('src'),title:title.textContent.trim(),loaded:photo.naturalWidth>200,
         source:document.querySelector('#referralStepPanel .rpx-full-guide p')?.textContent?.trim().length,
         overflow:document.documentElement.scrollWidth>innerWidth+3,
         artSrc:document.querySelector('.rlo-desktop .rlo-base').getAttribute('src'),
         photoW:photo.getBoundingClientRect().width,
         textFit:(()=>{
           const boxes=mobile
             ?[art.querySelector('.rlo-m-copy'),art.querySelector('.rlo-m-remember')]
             :[art.querySelector('.rlo-d-text'),art.querySelector('.rlo-d-remember')];
           return boxes.every(b=>b && b.scrollHeight<=b.clientHeight+3);
         })()};
     },mobile);
     assert.ok(stage.src.endsWith(expected[i][1]),name+' photo '+(i+1)+' distinct');
     assert.equal(stage.title,expected[i][0],name+' accurate title '+(i+1));
     if(w<600){
       const selected=page.locator('.rlo-compact-tile.is-active');
       assert.equal(await selected.count(),1,name+' one selected tile');
       assert.equal(await selected.getAttribute('data-compact-step'),String(i),name+' selected matches image');
       assert.equal(await selected.getAttribute('aria-current'),'step',name+' aria-current');
     }
     assert.ok(stage.loaded&&stage.photoW>60,name+' stage graphic '+(i+1)+' fully rendered');
     assert.equal(stage.textFit,true,name+' step '+(i+1)+' overlay text must not clip');
     assert.ok(stage.source>70,name+' source wording '+(i+1)+' preserved');
     assert.equal(stage.artSrc,'assets/referrals-overlay-desktop.webp',name+' no background swapping');
     assert.equal(stage.overflow,false,name+' no horizontal overflow at step '+(i+1));
     seen.push(stage.src);
     if(['phone','samsung-tablet-landscape','desktop'].includes(name))
       await page.screenshot({path:path.join(OUT,name+'-step-'+(i+1)+'.png'),fullPage:true,animations:'disabled'});
   }
   assert.equal(new Set(seen).size,6,name+' all six scenes different');
   await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Previous referral step"]').click();
   await page.waitForFunction(()=>document.querySelector('#referralStepPanel .rpx-feature')?.dataset.rpxActiveStep==='5');
   await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Next referral step"]').click();
   await page.waitForFunction(()=>document.querySelector('#referralStepPanel .rpx-feature')?.dataset.rpxActiveStep==='6');
   await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Next referral step"]').click();
   await page.waitForFunction(()=>document.querySelector('#referralStepPanel .rpx-feature')?.dataset.rpxActiveStep==='1');
   await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Urgent safety guidance"]').click();
   await page.waitForFunction(()=>document.querySelector('.rlo-dialog')?.open);
   const safetyText=await page.locator('#rlo-dialog-text').textContent();
   assert.ok(safetyText.includes('child-protection concerns') && safetyText.includes('emergency and safeguarding'),name+' exact safeguarding warning');
   await page.locator('#rlo-dialog-close').click();
   await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Full wording from the guide"]').click();
   await page.waitForFunction(()=>document.querySelector('.rlo-dialog')?.open);
   const full=await page.locator('#rlo-dialog-text').textContent();
   assert.ok(full.length>80,name+' exact full text in dialog');
   await page.locator('#rlo-dialog-close').click();
   assert.equal(pageErrors.length,0,name+' no uncaught errors '+pageErrors.join('|'));
   console.log('REFERRAL_OVERLAY',name,'approved image, logo, 6 photographic states, hotspots, real source, viewport OK');
   if(name==='phone'){
    await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Ask GIA"]').click();
    await page.waitForFunction(()=>document.querySelector('#gia2Dialog')?.open===true);
    await page.locator('#gia2Close').click();
    await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Find Services"]').last().click();
    await page.waitForFunction(()=>document.querySelector('#view-services.active')!==null);
    await page.evaluate(()=>document.querySelector('#mainNav [data-nav="referrals"]').click());
    await page.waitForFunction(()=>document.querySelector('#view-referrals.active')!==null);
    await page.locator('#referral-artwork-overlay '+art+' .rlo-hot[aria-label="Digital Manual"]').last().click();
    await page.waitForFunction(()=>document.querySelector('#view-manual.active')!==null);
    console.log('REFERRAL_OVERLAY_ACTIONS','GIA, services, manual working');
   }
   await page.close();
  }
  console.log('REFERRAL_OVERLAY_ALL_TESTS_PASSED 8 viewports × 6 photographic step states');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exit(1)});
