#!/usr/bin/env node
'use strict';
/* Browser checks for the isolated premium preview, not the live production site. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright-core');
const OUT='/tmp/mohw-preview-shots';
const BASE='http://127.0.0.1:8765/';
fs.mkdirSync(OUT,{recursive:true});
const screens=[
  {name:'small-phone',width:320,height:700},
  {name:'phone',width:390,height:844},
  {name:'tablet',width:768,height:1024},
  {name:'desktop',width:1440,height:900}
];
(async()=>{
  const exe=process.env.CHROME_BIN||'/usr/bin/chromium';
  const browser=await chromium.launch({headless:true,executablePath:exe,args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    for(const s of screens){
      const page=await browser.newPage({viewport:{width:s.width,height:s.height},deviceScaleFactor:1});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const resp=await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(resp.status(),200,'preview must serve successfully');
      await page.waitForSelector('#pv-home .pv-feature-grid button',{timeout:15000});
      await page.waitForFunction(()=>document.querySelectorAll('#pv-results .pv-office-card').length>0,null,{timeout:30000});
      assert.equal(await page.locator('#pv-home .pv-feature').count(),4,'four working home actions');
      assert.equal(await page.locator('#mainNav button').count(),6,'six primary navigation buttons');
      assert.equal(await page.locator('#pv-gia-video source').getAttribute('src'),'assets/gia-introduction.mp4');
      const links=await page.locator('#guideShareUrl').textContent();
      assert.ok(links.startsWith(BASE),'share/QR must point to the preview, not production: '+links);
      const doc=await page.evaluate(()=>({vw:innerWidth,sw:document.documentElement.scrollWidth}));
      assert.ok(doc.sw<=doc.vw+3,'horizontal overflow on '+s.name+': '+JSON.stringify(doc));
      await page.screenshot({path:OUT+'/'+s.name+'-home.png',fullPage:true});
      // Clicking the home tile must change the native routed view.
      await page.locator('#pv-home [data-pv-go="services"]').first().click();
      await page.waitForSelector('#view-services.active',{timeout:8000});
      assert.equal(await page.locator('#pv-parish option').count(),15,'14 parishes + all');
      assert.ok((await page.locator('#pv-dir-count').textContent()).includes('56 listings'),'source-linked office count');
      await page.locator('#pv-parish').selectOption('Hanover');
      assert.ok((await page.locator('#pv-result-count').textContent()).includes('4 matching'),'Hanover must have four listings');
      assert.ok((await page.locator('#pv-results').textContent()).includes('Noel Holmes Hospital'));
      await page.locator('#preview-search').fill('Noel Holmes');
      assert.ok((await page.locator('#pv-result-count').textContent()).includes('1 matching'),'combined search must work');
      const directions=await page.locator('#pv-results a[href^="https://www.google.com/maps/search/"]').first().getAttribute('href');
      assert.ok(directions.startsWith('https://www.google.com/maps/search/'),'actual Maps search link');
      await page.locator('#pv-view-list').click();
      assert.equal(await page.locator('#pv-map-wrapper').isHidden(),true,'list toggle hides map');
      await page.locator('#pv-view-map').click();
      assert.equal(await page.locator('#pv-map-wrapper').isHidden(),false,'map toggle shows map');
      assert.ok(await page.evaluate(()=>typeof L==='object'&&!!document.querySelector('.leaflet-container')),'real Leaflet map must initialise');
      await page.screenshot({path:OUT+'/'+s.name+'-map.png',fullPage:true});
      await page.locator('#mainNav button[data-nav="referrals"]').click();
      await page.waitForSelector('#view-referrals.active');
      assert.equal(await page.locator('#referralStepNav button').count(),6,'six original referral steps retained');
      // The native top navigation is intentionally hidden on the full-bleed approved referral artwork; use its visible real hotspot.
      await page.locator('#referral-artwork-overlay .rlo-hot[aria-label="Digital Manual"]:visible').first().click();
      await page.waitForSelector('#view-manual.active');
      assert.ok(await page.locator('#manual-reader').count(),'original manual reader retained');
      for(const id of ['programmes','categories','contacts']){
        await page.locator('.pv-subnav [data-nav="'+id+'"]').click();
        await page.waitForSelector('#view-'+id+'.active');
      }
      // Keep reported browser errors actionable: data or vendor resource warnings are separate.
      if(errors.length)throw Error(s.name+' JavaScript errors:\n'+errors.join('\n'));
      console.log('PASS '+s.name+' home, responsive, map, filters, routes, manual, programme pages');
      await page.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});