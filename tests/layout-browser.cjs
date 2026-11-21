#!/usr/bin/env node
'use strict';
/* Browser-level responsive and functionality checks. The original reference
   art is intentionally left untouched; tests validate sizing and usability. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
const BASE='http://127.0.0.1:8765/';
const OUT='/tmp/mohw-responsive-shots';
fs.mkdirSync(OUT,{recursive:true});
const screens=[
 {name:'phone-small',w:320,h:568},
 {name:'phone-standard',w:360,h:800},
 {name:'phone-large',w:390,h:844},
 {name:'phone-plus',w:430,h:932},
 {name:'tablet-small-portrait',w:600,h:960},
 {name:'tablet-portrait',w:768,h:1024},
 {name:'tablet-large-portrait',w:800,h:1280},
 {name:'tablet-landscape',w:1024,h:768},
 {name:'samsung-tablet-landscape',w:1280,h:800},
 {name:'desktop',w:1440,h:900},
 {name:'full-hd-desktop',w:1920,h:1080},
 {name:'short-landscape',w:1024,h:600}
];
const canonical='https://socialsupport.beginningconcepts.org/';
async function visibleHome(page,mobile){
 const selector=mobile?'#mohw-mobile-image:not([hidden])':'#exact-home:not([hidden])';
 await page.waitForFunction(selector=>{
   const e=document.querySelector(selector);
   return !!e && getComputedStyle(e).display!=='none' && e.getBoundingClientRect().width>10;
 },selector,{timeout:18000});
 await page.waitForFunction(()=>!!document.querySelector('#gia2Launcher')&&!!document.querySelector('#guideActionDock'),null,{timeout:14000});
}
async function state(page,mobile){
 return page.evaluate(mobile=>{
   const $=s=>document.querySelector(s);
   const rect=el=>{if(!el)return null;const b=el.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom,top:b.top,left:b.left}};
   const art=$(mobile?'#mohw-mobile-image':'#exact-home');
   const film=$(mobile?'#mohw-mobile-image .mv-film-frame':'#exact-home .exact-player');
   const dock=$('#guideActionDock'),gia=$('#gia2Launcher');
   const cards=mobile?[...document.querySelectorAll('#mohw-mobile-image .mv-card')]:[...document.querySelectorAll('#exact-home .exact-hit')].filter(x=>/Find services|Make a referral|Get help choosing|Read the manual/.test(x.getAttribute('aria-label')||''));
   const footer=$('#mohw-mobile-image .mv-bottom-action-space');
   return {
     viewport:{w:innerWidth,h:innerHeight},
     art:rect(art),film:rect(film),dock:rect(dock),gia:rect(gia),footer:rect(footer),
     dockStyle:getComputedStyle(dock).display,gaStyle:getComputedStyle(gia).display,
     dockParent:dock.parentElement?.className,giaParent:gia.parentElement?.className,
     dockButtons:dock.querySelectorAll('.guide-action').length,
     cards:cards.map(rect),
     nativeNavCount:$('#mainNav')?.querySelectorAll(':scope > button').length,
     scrollHeight:document.documentElement.scrollHeight,
     overflowX:document.documentElement.scrollWidth>innerWidth+2,
     position:getComputedStyle(art).position,
     bodyPadding:getComputedStyle(document.body).paddingBottom,
     stageRatio:rect(art).w/rect(art).h,
     videoSrc:$(mobile?'#mohw-mobile-image video':'#exact-home video')?.getAttribute('src')
   };
 },mobile);
}
function intersects(a,b){
 if(!a||!b)return false;
 return Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 &&
        Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
}
async function toolsWork(page){
 await page.locator('#guideActionDock [data-action="share"]').click();
 await page.waitForFunction(()=>document.querySelector('#guideShareDialog')?.open===true);
 assert.equal((await page.locator('#guideShareUrl').textContent()).trim(),canonical,'all shares must use custom domain');
 await page.locator('#guideShareDialog [data-close]').first().click();
 for(const action of ['issue','feedback']){
   await page.locator('#guideActionDock [data-action="'+action+'"]').click();
   await page.waitForFunction(()=>document.querySelector('#guideMessageDialog')?.open===true);
   await page.locator('#guideMessageDialog [data-close]').first().click();
 }
 await page.locator('#guideActionDock [data-action="download"]').click();
 await page.waitForFunction(()=>document.querySelector('#view-manual')?.classList.contains('active'),null,{timeout:8000});
 await page.locator('#mainNav button[data-nav="about"]').click();
 await visibleHome(page,true);
}
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,
   args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
 try{
  for(const sc of screens){
   const mobile=sc.w<900;
   const page=await browser.newPage({viewport:{width:sc.w,height:sc.h},deviceScaleFactor:1,
     isMobile:sc.w<=430,hasTouch:sc.w<=899});
   page.setDefaultTimeout(15000);
   const errs=[];
   page.on('pageerror',e=>errs.push(String(e)));
   await page.goto(BASE,{waitUntil:'domcontentloaded'});
   await visibleHome(page,mobile);
   const s=await state(page,mobile);
   assert.equal(s.overflowX,false,sc.name+': no horizontal overflow');
   assert.equal(s.dockButtons,4,sc.name+': retain four actual guide controls');
   assert.equal(s.nativeNavCount,6,sc.name+': preserve six native nav choices');
   assert.ok(s.art.w>0 && s.art.w<=sc.w+2,sc.name+': artwork fits device');
   assert.ok(s.film.w>60 && s.film.w<=sc.w+2,sc.name+': full film player');
   assert.equal(errs.length,0,sc.name+': no JavaScript errors: '+errs.join(','));
   if(mobile){
     assert.equal(s.dockParent,'mv-bottom-action-space',sc.name+': controls inside footer');
     assert.equal(s.giaParent,'mv-bottom-action-space',sc.name+': existing GIA in footer');
     assert.equal(s.dockStyle,'flex',sc.name+': actions form one horizontal row');
     assert.equal(s.gaStyle,'block',sc.name+': GIA visible');
     assert.equal(s.cards.length,4,sc.name+': four service cards');
     assert.ok(s.art.w>=sc.w*.92,sc.name+': mobile/tablet uses screen width');
     assert.ok(Math.abs((s.film.left+s.film.w/2)-(s.art.left+s.art.w/2))<4,
       sc.name+': center the GIA video');
     assert.ok(s.footer.top>=s.cards[3].bottom-2,sc.name+': footer follows cards');
     for(const item of [...s.cards,s.film]){
       assert.equal(intersects(s.dock,item),false,sc.name+': no utility overlay on a card/video');
       assert.equal(intersects(s.gia,item),false,sc.name+': no GIA overlay on a card/video');
     }
     assert.equal(intersects(s.dock,s.gia),false,sc.name+': tools clear of GIA');
     assert.ok(s.gia.right<=sc.w+2 && s.gia.left>=-2,sc.name+': GIA fits screen');
     if(sc.h<=600)assert.ok(s.scrollHeight>sc.h,sc.name+': short phone must be able to scroll');
   }else{
     assert.ok(Math.abs(s.stageRatio-1448/1086)<.01,sc.name+': original art not stretched');
     assert.ok(s.art.w>=Math.min(sc.w,1920)*.98,sc.name+': fill landscape width');
     assert.equal(s.cards.length,4,sc.name+': four artwork navigation controls');
     assert.ok(s.scrollHeight>=sc.h,sc.name+': natural desktop scrolling');
   }
   await page.screenshot({path:path.join(OUT,sc.name+'.png'),fullPage:true,animations:'disabled'});
   console.log('RESPONSIVE',sc.name,JSON.stringify(s));
   if(sc.name==='phone-large'){
      await toolsWork(page);
      await page.locator('#gia2Launcher').click();
      await page.waitForFunction(()=>document.querySelector('#gia2Dialog')?.open===true);
      await page.locator('#gia2Close').click();
      await page.locator('#mohw-mobile-image .mv-play').click();
      await page.waitForFunction(()=>document.querySelector('#mohw-mobile-image .mv-film-frame')?.classList.contains('mv-playing'),null,{timeout:20000});
      assert.equal((await page.locator('#mohw-mobile-image .mv-film-video').getAttribute('src')),'assets/gia-introduction.mp4');
      console.log('FUNCTIONAL_PHONE','share, report, feedback, manual, GIA, video OK');
   }
   if(sc.name==='tablet-portrait'){
      await page.setViewportSize({width:1024,height:768});
      await visibleHome(page,false);
      const rotated=await state(page,false);
      assert.equal(rotated.overflowX,false,'tablet rotate: no horizontal overflow');
      assert.ok(Math.abs(rotated.stageRatio-1448/1086)<.01,'tablet rotate: art natural ratio');
      assert.equal(documentAware(rotated),true,'tablet rotate: controls restored');
      await page.setViewportSize({width:768,height:1024});
      await visibleHome(page,true);
      const back=await state(page,true);
      assert.equal(back.dockParent,'mv-bottom-action-space','portrait return: actions stay in footer');
      assert.equal(back.giaParent,'mv-bottom-action-space','portrait return: GIA stays in footer');
      console.log('ROTATION','768x1024 -> 1024x768 -> 768x1024 OK');
   }
   if(sc.name==='tablet-landscape'){
     await page.locator('#exact-home .exact-hit[aria-label="Referrals"]').click();
     await page.waitForFunction(()=>document.querySelector('#view-referrals')?.classList.contains('active'),null,{timeout:8000});
     // Exact artwork intentionally hides the native nav; route via its original handler.
     await page.evaluate(()=>document.querySelector('#mainNav button[data-nav="about"]').click());
     await visibleHome(page,false);
   }
   await page.close();
  }

  // Exercise the actual non-home pages too. Their scroll behaviour, native
  // navigation, GIA dialog and four guide actions must survive the new home.
  const routeScreens=[
    {name:'phone-small',w:320,h:568},
    {name:'phone-large',w:390,h:844},
    {name:'tablet-portrait',w:768,h:1024},
    {name:'tablet-landscape',w:1024,h:768},
    {name:'desktop',w:1440,h:900}
  ];
  for(const sc of routeScreens){
    const page=await browser.newPage({viewport:{width:sc.w,height:sc.h},deviceScaleFactor:1,
      isMobile:sc.w<=430,hasTouch:sc.w<900});
    page.setDefaultTimeout(16000);
    await page.goto(BASE,{waitUntil:'domcontentloaded'});
    await visibleHome(page,sc.w<900);
    for(const target of ['referrals','decision','services','manual']){
      await page.evaluate(id=>{
        const nav=document.querySelector('#mainNav button[data-nav="'+id+'"]');
        if(!nav)throw Error('Missing page '+id);
        nav.click();
      },target);
      await page.waitForFunction(id=>document.querySelector('#view-'+id)?.classList.contains('active'),target,{timeout:9000});
      const r=await page.evaluate(()=>{
        const dock=document.querySelector('#guideActionDock');
        const gia=document.querySelector('#gia2Launcher');
        const a=document.querySelector('#main .view.active');
        const dr=dock.getBoundingClientRect(),gr=gia.getBoundingClientRect();
        return {
          innerWidth,innerHeight,
          overflow:document.documentElement.scrollWidth>innerWidth+2,
          viewWidth:a.getBoundingClientRect().width,
          dockVisible:getComputedStyle(dock).display!=='none',
          giaVisible:getComputedStyle(gia).display!=='none',
          dockOnBody:dock.parentElement===document.body,
          giaOnBody:gia.parentElement===document.body,
          dockInside:dr.left>=-3 && dr.right<=innerWidth+3,
          giaInside:gr.left>=-3 && gr.right<=innerWidth+3
        };
      });
      assert.equal(r.overflow,false,sc.name+' '+target+': no horizontal overflow');
      assert.ok(r.viewWidth<=sc.w+3,sc.name+' '+target+': section fits viewport');
      assert.equal(r.dockOnBody,true,sc.name+' '+target+': tools restored to document');
      assert.equal(r.giaOnBody,true,sc.name+' '+target+': GIA restored to document');
      if(target==='referrals'){
        assert.equal(r.dockVisible,false,sc.name+': no duplicate floating dock above the approved artwork');
        assert.equal(r.giaVisible,false,sc.name+': only one illustrated GIA launcher');
      }else{
        assert.ok(r.dockVisible && r.giaVisible && r.dockInside && r.giaInside,
          sc.name+' '+target+': action tools and GIA visible and within viewport');
      }
      if(target==='referrals' || target==='manual')
        await page.screenshot({path:path.join(OUT,'inner-'+sc.name+'-'+target+'.png'),fullPage:false,animations:'disabled'});
      console.log('INNER_PAGE',sc.name,target,JSON.stringify(r));
    }
    await page.locator('#gia2Launcher').click();
    await page.waitForFunction(()=>document.querySelector('#gia2Dialog')?.open===true);
    // Wait for GIA's 180ms entrance animation before checking final geometry.
    await page.waitForTimeout(350);
    const dialog=await page.evaluate(()=>{
      const r=document.querySelector('#gia2Dialog').getBoundingClientRect();
      return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,w:innerWidth,h:innerHeight};
    });
    console.log('GIA_DIALOG_GEOMETRY',sc.name,JSON.stringify(dialog));
    assert.ok(dialog.left>=-2 && dialog.top>=-2 && dialog.right<=dialog.w+2 &&
      dialog.bottom<=dialog.h+2,sc.name+': GIA chat fits inside the screen');
    await page.locator('#gia2Close').click();
    console.log('GIA_DIALOG',sc.name,JSON.stringify(dialog));
    await page.close();
  }
  console.log('ALL_RESPONSIVE_VIEWPORT_TESTS_PASSED',screens.length,'home viewports and',routeScreens.length*4,'interior page viewports; screenshots:',OUT);
 }finally{await browser.close();}
}
function documentAware(s){return s.dockParent==='BODY' || s.dockParent==='';}
main().catch(e=>{console.error(e);process.exit(1)});
