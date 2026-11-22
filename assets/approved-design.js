/* APPROVED DESIGN PREVIEW, independent branch. Existing programme/decision/GIA/manual logic stays active. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const views=['about','services','referrals','decision','manual','programmes','categories','contacts'];
const names={about:'Home',services:'Find services',referrals:'Referrals',decision:'Decision guide',manual:'Digital manual',programmes:'Programmes',categories:'Categories',contacts:'Contacts'};
const coords={'Hanover':[18.44,-78.15],'St. James':[18.47,-77.92],'Westmoreland':[18.22,-78.13],'Trelawny':[18.49,-77.65],'St. Elizabeth':[18.04,-77.83],'Manchester':[18.04,-77.50],'Clarendon':[17.97,-77.24],'St. Ann':[18.43,-77.20],'St. Mary':[18.36,-76.89],'Portland':[18.18,-76.45],'St. Thomas':[17.88,-76.41],'St. Catherine':[17.99,-76.96],'St. Andrew':[18.02,-76.80],'Kingston':[17.97,-76.79]};
const kindNames={mlss:'Benefits & NIS',nht:'Housing',drugServ:'Medication',healthDept:'Health department'};
let offices=[],map=null,markers=null,parish='all',kind='all',search='',expanded=false;
const path={
 accessibility:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="6" r="1.2"/><path d="M5 10h14m-7 0v7m0 0-4 4m4-4 4 4"/>',
 play:'<path d="M8 5v14l11-7Z" fill="currentColor" stroke="none"/>',
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/>',
 pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 home:'<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 close:'<path d="m5 5 14 14m0-14L5 19"/>',
 download:'<path d="M12 2v15m0 0-5-5m5 5 5-5M4 19v3h16v-3"/>',
 feedback:'<path d="M5 4h14a2 2 0 0 1 2 2v11H9l-6 4V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10m-10 4h6"/>',
 share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5m-8 8 8 4"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 book:'<path d="M12 6C8 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'
};
const svg=(name,cls='')=>'<svg class="'+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(path[name]||path.arrow)+'</svg>';
const threeD={
 pin:'<svg viewBox="0 0 180 150" class="ad-3d-icon" aria-hidden="true"><defs><linearGradient id="gpin" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff39c"/><stop offset=".4" stop-color="#ffc113"/><stop offset="1" stop-color="#eb8c00"/></linearGradient><filter id="dpin"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity=".3"/></filter></defs><g filter="url(#dpin)"><path d="M12 100 58 86 102 92 160 75l-12 46-45 14-43-10-48 15Z" fill="#f6f5ff" stroke="#b6bdd5" stroke-width="3"/><path d="m18 106 41-12 2 28-42 13m49-37 33 6-2 24-33-7m42-14 43-16-9 28-36 13" fill="#9ee1a9"/><path d="M88 9c-30 0-47 21-47 45 0 27 47 68 47 68s47-41 47-68c0-24-17-45-47-45Z" fill="url(#gpin)" stroke="#ec9900" stroke-width="3"/><circle cx="88" cy="52" r="19" fill="#f5f3ff" stroke="#d89c00" stroke-width="3"/><path d="M69 28q10-12 24-11" fill="none" stroke="#fff5ad" stroke-width="6" stroke-linecap="round"/></g></svg>',
 referral:'<svg viewBox="0 0 180 150" class="ad-3d-icon" aria-hidden="true"><defs><linearGradient id="paperR" x1="0" y1="0" x2="1" y2="1"><stop stop-color="white"/><stop offset="1" stop-color="#cdd0da"/></linearGradient><linearGradient id="personR" x1="0" x2=".9" y1="0" y2="1"><stop stop-color="#fff48a"/><stop offset=".5" stop-color="#ffcc06"/><stop offset="1" stop-color="#e98f00"/></linearGradient><filter id="dref"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity=".27"/></filter></defs><g filter="url(#dref)"><rect x="24" y="16" width="100" height="116" rx="12" transform="rotate(7 74 74)" fill="url(#paperR)" stroke="#c1c2cf" stroke-width="3"/><path d="M45 45h58M48 60h45M50 76h40M49 92h40" stroke="#9ba0b0" stroke-width="7" stroke-linecap="round"/><path d="m24 117 29-2v-13l32 19-32 20v-13l-29 4Z" fill="#16c45c" stroke="#069548" stroke-width="2"/><circle cx="132" cy="76" r="19" fill="url(#personR)" stroke="#d69d00" stroke-width="2"/><path d="M98 136v-11c0-20 12-32 34-32s35 12 35 32v11Z" fill="url(#personR)" stroke="#df9900" stroke-width="2"/></g></svg>',
 decision:'<svg viewBox="0 0 180 150" class="ad-3d-icon" aria-hidden="true"><defs><linearGradient id="poleD" x1="0" x2="1"><stop stop-color="#92989b"/><stop offset=".5" stop-color="#fafafa"/><stop offset="1" stop-color="#7f868c"/></linearGradient><linearGradient id="grnD" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a7ffa4"/><stop offset=".45" stop-color="#1dcf58"/><stop offset="1" stop-color="#0c8b33"/></linearGradient><linearGradient id="ylwD" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff5a1"/><stop offset=".5" stop-color="#ffd01d"/><stop offset="1" stop-color="#d48b00"/></linearGradient><linearGradient id="prpD" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e5bcff"/><stop offset=".5" stop-color="#b563f9"/><stop offset="1" stop-color="#8738ba"/></linearGradient><filter id="dd"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-opacity=".26"/></filter></defs><g filter="url(#dd)"><rect x="85" y="8" width="18" height="137" rx="6" fill="url(#poleD)"/><path d="M30 28h100l25 18-25 19H30q-8 0-8-8V36q0-8 8-8Z" fill="url(#grnD)" stroke="#128c39" stroke-width="2"/><path d="M52 70h92q8 0 8 8v16q0 7-8 8H52L17 86Z" fill="url(#ylwD)" stroke="#cf9000" stroke-width="2"/><path d="M31 105h103l26 19-26 19H31q-7 0-7-9v-20q0-9 7-9Z" fill="url(#prpD)" stroke="#7b2ab2" stroke-width="2"/></g></svg>',
 manual:'<svg viewBox="0 0 180 150" class="ad-3d-icon" aria-hidden="true"><defs><linearGradient id="pageM" x1="0" y1="0" x2="1" y2="1"><stop stop-color="white"/><stop offset="1" stop-color="#bcbeca"/></linearGradient><linearGradient id="coverM" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#ff67b5"/><stop offset=".6" stop-color="#e50078"/><stop offset="1" stop-color="#990058"/></linearGradient><filter id="dm"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity=".3"/></filter></defs><g filter="url(#dm)"><path d="M12 44Q53 30 90 46q41-17 78-2v88q-41-15-78 3-37-19-78-3Z" fill="url(#coverM)" stroke="#ba0068" stroke-width="3"/><path d="M18 35q38-12 72 6 35-19 72-6v82q-35-13-72 6-35-20-72-6Z" fill="url(#pageM)" stroke="#d9d6e2" stroke-width="2"/><path d="M90 40v83" stroke="#b2b4be" stroke-width="3"/><g stroke="#aaaebd" stroke-width="5" stroke-linecap="round"><path d="M34 55q20-6 41 5M34 71q20-6 41 5M34 87q20-6 41 5M34 103q20-6 41 5M105 59q19-11 39-5M105 76q19-11 39-5M105 92q19-11 39-5M105 108q19-11 39-5"/></g></g></svg>'
};
function nav(view){if(!views.includes(view))return;const b=$('#mainNav button[data-nav="'+view+'"]');if(b)b.click();else if(typeof window.showView==='function')window.showView(view);else{$('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+view));location.hash=view;}$('#ad-menu').hidden=true;window.scrollTo({top:0,behavior:'instant'});state();if(view==='services')setTimeout(loadMap,140);}
function action(type){if(type==='gia'){if(window.MOHWGIA?.open)window.MOHWGIA.open();else $('#gia2Launcher')?.click();return;}
 if(type==='access'){$('[data-p2="access"]')?.click();return;}
 if(type==='video'){const d=$('#ad-video-dialog');if(!d.open)d.showModal();const v=$('#ad-video');v?.play()?.catch(()=>{});return;}
 if(type==='download'){nav('manual');return;}
 const native=$('#guideActionDock [data-action="'+(type==='report'?'issue':type)+'"]');native?.click();
}
function mountHeader(){
 const h=document.createElement('header');h.className='ad-header';h.id='ad-header';
 h.innerHTML='<div class="ad-header-line"><a class="ad-brand" href="#about" data-ad-nav="about"><img src="assets/mohw-official-logo.png" alt="Ministry of Health & Wellness" class="ad-logo"><i aria-hidden="true"></i><span class="ad-wordmark">MOHW<strong>Social Support</strong></span></a><nav class="ad-desktop-nav" aria-label="Main pages">'+[['about','Home'],['services','Find Services'],['referrals','Referrals'],['decision','Decision Guide'],['manual','Manual']].map(([k,t])=>'<button type="button" data-ad-nav="'+k+'">'+t+'</button>').join('')+'</nav><div class="ad-header-buttons"><button type="button" class="ad-access" data-ad-action="access" aria-label="Accessibility and listening">'+svg('accessibility')+'</button><button class="ad-menu-button" type="button" data-ad-menu aria-label="More sections" aria-expanded="false">'+svg('menu')+'</button></div></div><nav id="ad-menu" class="ad-menu" aria-label="All guide sections" hidden>'+views.map(k=>'<button type="button" data-ad-nav="'+k+'">'+names[k]+' →</button>').join('')+'</nav>';
 document.querySelector('.topline').before(h);
 const back=document.createElement('nav');back.className='ad-backbar';back.id='ad-backbar';back.hidden=true;back.innerHTML='<button data-ad-nav="about" type="button">‹ Home</button><strong id="ad-page-name">Guide</strong><button type="button" data-ad-menu aria-label="Browse pages">'+svg('menu')+'</button>';
 $('#main').before(back);
}
function mountHome(){
 const v=$('#view-about');const el=document.createElement('section');el.id='ad-home';el.className='ad-home';
 el.innerHTML='<div class="ad-home-wrap"><section class="ad-hero" aria-label="Meet GIA">'+
 '<img class="ad-hero-photo" src="assets/about-community.webp" alt="Jamaican family at a welcoming community support service">'+
 '<div class="ad-hero-shade"></div><div class="ad-hero-copy"><span>Meet</span><strong>GIA</strong><button type="button" data-ad-action="video" class="ad-watch">'+svg('play')+' Watch welcome video</button></div>'+
 '<img class="ad-gia-portrait" src="assets/gia-avatar.jpg" alt="GIA, virtual guide">'+
 '<div class="ad-hero-ribbon" aria-hidden="true"><i></i><i></i><i></i></div></section>'+
 '<figure class="ad-home-community"><img src="assets/about-community.webp" alt="Community members connecting with social support in Jamaica" loading="lazy"></figure>'+ 
 '<div class="ad-home-intro"><h1>Find the support you need.</h1><span class="ad-underline" aria-hidden="true"></span></div>'+
 '<div class="ad-home-tiles" role="navigation" aria-label="Choose what to do">'+
 '<button type="button" class="ad-home-tile ad-lavender" data-ad-nav="services">'+threeD.pin+'<strong>Find a service</strong></button>'+
 '<button type="button" class="ad-home-tile ad-cream" data-ad-nav="referrals">'+threeD.referral+'<strong>Make a referral</strong></button>'+
 '<button type="button" class="ad-home-tile ad-blue" data-ad-nav="decision">'+threeD.decision+'<strong>Help me choose</strong></button>'+
 '<button type="button" class="ad-home-tile ad-rose" data-ad-nav="manual">'+threeD.manual+'<strong>Read the manual</strong></button>'+
 '</div><div class="ad-more"><button type="button" data-ad-nav="programmes">Programme directory ↗</button><button type="button" data-ad-nav="categories">Categories ↗</button><button type="button" data-ad-nav="contacts">Agency contacts ↗</button></div>'+
 '<p class="ad-home-note">Stakeholder design preview. Agency information and eligibility requirements must be confirmed before use.</p></div>';
 v.prepend(el);
}
function mountDock(){
 const d=document.createElement('nav');d.id='ad-action-dock';d.className='ad-action-dock';d.setAttribute('aria-label','Guide quick actions');
 d.innerHTML='<button type="button" data-ad-action="download">'+svg('download')+'<span>Download</span></button>'+
 '<button type="button" data-ad-action="feedback">'+svg('feedback')+'<span>Give feedback</span></button>'+
 '<button type="button" data-ad-action="share">'+svg('share')+'<span>Share</span></button>'+
 '<button type="button" data-ad-action="gia" class="ad-gia-action"><img src="assets/gia-avatar.jpg" alt=""><span>Ask GIA</span></button>';
 document.body.append(d);
 const modal=document.createElement('dialog');modal.id='ad-video-dialog';modal.className='ad-video-dialog';modal.setAttribute('aria-label','GIA welcome video');
 modal.innerHTML='<div class="ad-video-top"><strong>Meet GIA</strong><button type="button" data-ad-video-close aria-label="Close video">'+svg('close')+'</button></div><video id="ad-video" playsinline controls preload="metadata" poster="assets/mobile-v3/video.webp"><source src="assets/gia-introduction.mp4" type="video/mp4">Video is unavailable in this browser.</video><p>GIA welcomes you to the Social Protection Services Support Guide for Jamaica.</p>';
 document.body.append(modal);modal.addEventListener('close',()=>$('#ad-video')?.pause());
}
function state(){
 const id=location.hash.slice(1)||'about';const active=views.includes(id)?id:'about';
 document.documentElement.dataset.adPage=active;
 const dock=$('#ad-action-dock');
 const dockParent=active==='about'?$('#ad-home .ad-home-wrap'):$('#view-'+active);
 if(dock&&dockParent&&dock.parentNode!==dockParent)dockParent.append(dock);
 if($('#ad-backbar')){$('#ad-backbar').hidden=active==='about';$('#ad-page-name').textContent=names[active];}
 $$('[data-ad-nav]').forEach(b=>b.classList.toggle('active',b.dataset.adNav===active));
 if(active==='services')setTimeout(loadMap,150);
 if(active==='decision')setTimeout(decisionSelect,80);
}
function mountMap(){
 const main=$('#view-services .page-content');if(!main)return;
 const e=document.createElement('section');e.className='ad-directory';e.id='ad-directory';
 e.innerHTML='<div class="ad-map-heading"><span>Explore Jamaica</span><h2>Find support across the island.</h2><p>Browse listed offices by parish or service type. Open directions for a specific address.</p></div>'+
 '<div class="ad-map-tabs" role="group" aria-label="List or map"><button class="selected" data-ad-map-mode="map" aria-pressed="true" type="button">'+svg('map')+' Map</button><button type="button" data-ad-map-mode="list" aria-pressed="false">'+svg('list')+' List</button></div>'+
 '<div class="ad-filters"><label>Parish<select id="ad-parish"><option value="all">All parishes</option></select></label><label>Service<select id="ad-kind"><option value="all">All services</option><option value="mlss">Benefits & NIS</option><option value="nht">Housing</option><option value="drugServ">Medication</option><option value="healthDept">Health department</option></select></label></div>'+
 '<label class="ad-filter-search">'+svg('search')+'<input id="ad-search" type="search" placeholder="Search agency, parish or address" aria-label="Search office directory"></label>'+
 '<div id="ad-map-panel"><div id="ad-map" aria-label="Interactive Jamaica parish map"></div><div id="ad-map-fallback" hidden>Map tiles are unavailable. Please use the searchable office list. <a href="https://www.openstreetmap.org/#map=8/18.13/-77.30" target="_blank" rel="noopener noreferrer">Open OpenStreetMap</a></div><p>Map markers show approximate parish areas, not verified office entrances. © OpenStreetMap contributors.</p></div>'+
 '<div class="ad-offices-header"><h3 id="ad-offices-title">Listed offices</h3><span role="status" aria-live="polite" id="ad-office-count">Loading…</span></div>'+
 '<div id="ad-office-list" class="ad-office-list"></div><button type="button" id="ad-more-offices" hidden>Show more offices ↓</button>'+
 '<div class="ad-directory-links"><button data-ad-nav="programmes" type="button">Programmes →</button><button data-ad-nav="categories" type="button">Categories →</button><button data-ad-nav="contacts" type="button">Contacts →</button></div>'+
 '<p class="ad-directory-note">The working guide does not confirm office GPS coordinates, availability or opening hours. Check contact details and location directly with the agency before travelling.</p>';
 main.prepend(e);
 fetch('data/gia-parishes.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
  Object.keys(data.parishes||{}).sort().forEach(p=>{if(!coords[p])return;$('#ad-parish').add(new Option(p,p));const entry=data.parishes[p];for(const k of Object.keys(kindNames)){const v=entry[k];if(v?.name&&v?.address)offices.push({parish:p,kind:k,name:v.name,address:v.address,phone:v.phone||''});}});
  renderOffices();if($('#view-services').classList.contains('active'))loadMap();
 }).catch(()=>{$('#ad-office-count').textContent='Office directory unavailable';$('#ad-office-list').innerHTML='<p>Try the Agency Contacts directory or reload the page.</p>';});
}
const filtered=()=>offices.filter(o=>(parish==='all'||parish===o.parish)&&(kind==='all'||kind===o.kind)&&(!search||[o.parish,o.name,o.address,kindNames[o.kind]].join(' ').toLowerCase().includes(search.toLowerCase())));
const mapUrl=o=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(o.address);
function renderOffices(){
 const list=filtered();$('#ad-office-count').textContent=list.length+' '+(list.length===1?'office':'offices');
 $('#ad-offices-title').textContent=parish==='all'?'Offices across Jamaica':parish+' office listings';
 $('#ad-office-list').innerHTML=list.length?list.slice(0,expanded?list.length:4).map(o=>'<article class="ad-office"><span class="ad-office-type">'+esc(o.parish)+' • '+esc(kindNames[o.kind])+'</span><h4>'+esc(o.name)+'</h4><p>'+svg('pin')+esc(o.address)+'</p><div class="ad-office-buttons">'+(o.phone?'<a href="tel:'+esc(o.phone.replace(/[^\d+]/g,''))+'">'+esc(o.phone)+'</a>':'')+'<a target="_blank" rel="noopener noreferrer" href="'+esc(mapUrl(o))+'">Directions ↗</a><button type="button" data-ad-zoom="'+esc(o.parish)+'">View parish</button></div><small>Confirm office services and hours directly.</small></article>').join(''):'<p class="ad-empty">No matching offices. Clear a filter or search another parish.</p>';
 $('#ad-more-offices').hidden=expanded||list.length<=4;$('#ad-more-offices').textContent='Show all '+list.length+' offices ↓';
 refreshPins(list);
}
function refreshPins(list){
 if(!map||!markers)return;markers.clearLayers();
 const counts={};list.forEach(o=>{counts[o.parish]=(counts[o.parish]||0)+1});
 for(const p of Object.keys(counts)){const point=coords[p];if(!point)continue;
  const marker=L.marker(point,{icon:L.divIcon({className:'ad-pin-marker',html:'<span>'+svg('pin')+'</span>',iconAnchor:[22,46],iconSize:[44,50]})});
  marker.bindPopup('<div class="ad-map-popup"><b>'+esc(p)+'</b><span>'+counts[p]+' listed offices</span><p>Approximate parish area</p><button type="button" data-ad-pop-parish="'+esc(p)+'">View listings →</button></div>');marker.addTo(markers);
 }
}
function loadMap(){
 if(!$('#view-services')?.classList.contains('active')||$('#ad-map-panel')?.hidden)return;
 if(map){setTimeout(()=>map.invalidateSize(),140);return;}
 if(typeof L==='undefined'){$('#ad-map').hidden=true;$('#ad-map-fallback').hidden=false;return;}
 try{map=L.map('ad-map',{scrollWheelZoom:false,minZoom:7,maxZoom:18}).setView([18.12,-77.30],8);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
 markers=L.layerGroup().addTo(map);refreshPins(filtered());setTimeout(()=>map.invalidateSize(),250);}
 catch(e){console.warn(e);$('#ad-map').hidden=true;$('#ad-map-fallback').hidden=false;}
}
function focusParish(p){if(p!=='all'&&!coords[p])return;parish=p;$('#ad-parish').value=p;expanded=false;renderOffices();if(map){if(p==='all')map.setView([18.12,-77.30],8);else map.flyTo(coords[p],10,{duration:.6});}if(p!=='all')window.MOHWGIA?.setParish?.(p);}
function decisionSelect(){
 const native=$('#decisionSituations');if(!native||$('#ad-decision-select'))return;const b=$$('button',native);if(!b.length)return;
 const wrap=document.createElement('label');wrap.className='ad-decision-chooser';wrap.innerHTML='<span>Select a situation</span><select id="ad-decision-select" aria-label="Select a situation"><option value="">Choose a situation</option>'+b.map((v,i)=>'<option value="'+i+'">'+esc(v.textContent.trim().replace(/\s+/g,' '))+'</option>').join('')+'</select>';native.before(wrap);native.classList.add('ad-hide-decision');
 $('#ad-decision-select').addEventListener('change',e=>{const n=Number(e.target.value);if(e.target.value!==''&&b[n])b[n].click();});
}
function listen(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-ad-nav]');if(b){e.preventDefault();nav(b.dataset.adNav);return;}
  const a=e.target.closest('[data-ad-action]');if(a){e.preventDefault();action(a.dataset.adAction);return;}
  const m=e.target.closest('[data-ad-menu]');if(m){$('#ad-menu').hidden=!$('#ad-menu').hidden;$$('[data-ad-menu]').forEach(z=>z.setAttribute('aria-expanded',String(!$('#ad-menu').hidden)));return;}
  const mode=e.target.closest('[data-ad-map-mode]');if(mode){let show=mode.dataset.adMapMode==='map';$('#ad-map-panel').hidden=!show;$$('[data-ad-map-mode]').forEach(b=>{b.classList.toggle('selected',b===mode);b.setAttribute('aria-pressed',String(b===mode));});if(show)loadMap();return;}
  const pin=e.target.closest('[data-ad-pop-parish]');if(pin){focusParish(pin.dataset.adPopParish);$('#ad-offices-title')?.scrollIntoView({block:'nearest'});return;}
  const zoom=e.target.closest('[data-ad-zoom]');if(zoom){$('#ad-map-panel').hidden=false;$$('[data-ad-map-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.adMapMode==='map'));loadMap();focusParish(zoom.dataset.adZoom);$('#ad-map-panel').scrollIntoView({block:'start',behavior:'smooth'});return;}
  if(e.target.closest('#ad-more-offices')){expanded=true;renderOffices();return;}
  if(e.target.closest('[data-ad-video-close]')){$('#ad-video-dialog')?.close();}
 });
 $('#ad-video-dialog')?.addEventListener('click',e=>{if(e.target===$('#ad-video-dialog'))e.target.close();});
 $('#ad-video-dialog')?.addEventListener('close',()=>$('#ad-video')?.pause());
 $('#ad-parish')?.addEventListener('change',e=>focusParish(e.target.value));
 $('#ad-kind')?.addEventListener('change',e=>{kind=e.target.value;expanded=false;renderOffices();});
 $('#ad-search')?.addEventListener('input',e=>{search=e.target.value.trim();expanded=false;renderOffices();});
 window.addEventListener('hashchange',state);
 window.addEventListener('resize',()=>{if(map&&$('#view-services')?.classList.contains('active'))map.invalidateSize();});
 const v=$('#view-services');if(v)new MutationObserver(()=>{if(v.classList.contains('active'))loadMap();}).observe(v,{attributes:true,attributeFilter:['class']});
}
function start(){document.documentElement.classList.add('ad-preview');document.body.classList.add('ad-preview');
 views.filter(x=>x!=='about').forEach(x=>$('#view-'+x)?.classList.add('ad-inner-page'));mountHeader();mountHome();mountDock();mountMap();listen();state();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();