/* MOHW Decision Guide: image-first, content-accurate, interactive layover.
   The painted artwork never moves when situations change. All wording comes
   from data/guide-content.json; original native functionality is retained. */
(()=>{
'use strict';
const view=document.getElementById('view-decision');
if(!view||document.getElementById('decision-image-overlay'))return;
const $=(s,r=document)=>r.querySelector(s);
const pct=(x,n)=>(100*x/n).toFixed(5)+'%';
const art={desktop:{w:1536,h:1024,src:'assets/decision-overlay-desktop.webp'},mobile:{w:896,h:1728,src:'assets/decision-overlay-mobile.webp'}};
const nav=[['Home','about','home'],['Referrals','referrals','referrals'],['Decision Guide','decision','decision'],['Find Services','services','services'],['Digital Manual','manual','manual'],['Accessibility & Listening','access','access']];
const images=[
 'assets/referral-listening.webp','assets/about-community.webp','assets/referral-followup.webp',
 'assets/decision-options.webp','assets/referral-match.webp','assets/referral-safety.webp',
 'assets/services-community.webp','assets/contact-directory.webp','assets/services-explore.webp',
 'assets/decision-pathway.webp','assets/referral-warmhandoff.webp','assets/referral-photo-2-safety.webp',
 'assets/referral-preparing.webp'
];
const displayNames=[
 'Mental health support','Parent or student','Senior (60+)','Skills training & work',
 'Disability support','Fire or bereavement','Enterprise, farming or gardening',
 'Medical tests','Medical treatment','Substance misuse','Abuse or domestic violence',
 'Disaster or fire','Adolescent mother or vulnerable children'
];
const safety='For immediate danger or a medical emergency, use approved emergency procedures and contact emergency services. Do not wait for a directory search.';
let source=[],situations=[],selected='',activeOption=0,routePage=0,pickerPage=0;
const root=document.createElement('div');root.id='decision-image-overlay';root.hidden=true;
root.setAttribute('role','region');root.setAttribute('aria-label','Decision Guide interactive illustration');
const screens={};
function appendArea(parent,cls,rectangle,dim=art[parent.dataset.device]){
 const el=document.createElement('div');el.className='dgo-area '+cls;
 const [x,y,w,h]=rectangle;Object.assign(el.style,{left:pct(x,dim.w),top:pct(y,dim.h),width:pct(w,dim.w),height:pct(h,dim.h)});
 parent.append(el);return el;
}
function makeScreen(device){
 const d=art[device];const frame=document.createElement('section');frame.className='dgo-art dgo-'+device;
 frame.dataset.device=device;frame.style.aspectRatio=d.w+'/'+d.h;
 const bg=document.createElement('img');bg.className='dgo-base';bg.src=d.src;bg.alt='';bg.setAttribute('aria-hidden','true');bg.decoding='async';frame.append(bg);
 root.append(frame);screens[device]={frame};return frame;
}
const desktop=makeScreen('desktop'),mobile=makeScreen('mobile');
function navAction(value){
 if(value==='access'){$('[data-p2="access"]')?.click();return}
 const b=$('#mainNav [data-nav="'+value+'"]');b?.click();
}
function promptGia(){const b=$('#gia2Launcher');if(b)b.click();else $('[data-p2="gia"]')?.click();}
function buttonArea(frame,cls,rect,title,action){
 const box=appendArea(frame,cls,rect);const b=document.createElement('button');b.type='button';b.className='dgo-hit';b.textContent=title;b.setAttribute('aria-label',title);
 b.addEventListener('click',action);box.append(b);return b;
}
function brandedLogo(frame,coords){const holder=appendArea(frame,'dgo-logo',coords);const image=document.createElement('img');image.src='assets/mohw-official-logo.png';image.alt='Ministry of Health & Wellness Jamaica official logo';holder.append(image)}
// The Referrals-inspired ribbon is a real interactive navigation element,
// rather than tiny text areas sitting over an outdated painted navbar.
const navIcons={
 home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z"/>',
 referrals:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 21v-2c0-4 3-6 6.5-6s6.5 2 6.5 6v2M16 14c3 0 5.5 2 5.5 5v2"/>',
 decision:'<circle cx="12" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><path d="M12 6v6M12 12 4 18M12 12l8 6"/>',
 services:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>',
 manual:'<path d="M12 6C8.5 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>',
 access:'<path d="M4 13v-2a8 8 0 0 1 16 0v2M4 12H2v7a3 3 0 0 0 3 3h2v-9H4Zm16 0h2v7a3 3 0 0 1-3 3h-2v-9h3Z"/>'
};
function buildNav(frame){
 const isMobile=frame.dataset.device==='mobile';
 const bounds=isMobile?[5,3,886,102]:[176,19,1230,101];
 const holder=appendArea(frame,'dgo-premium-nav',bounds);
 const bar=document.createElement('nav');
 bar.className='dgo-nav-ribbon';
 bar.setAttribute('aria-label','MOHW Social Support main navigation');
 nav.forEach(([label,target,symbol],index)=>{
  const control=document.createElement('button');control.type='button';
  control.className='dgo-nav-button'+(target==='decision'?' is-active':'');
  control.setAttribute('aria-label',label);
  if(target==='decision')control.setAttribute('aria-current','page');
  const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+navIcons[symbol]+'</svg>';
  const text=document.createElement('span');text.textContent=label;
  control.innerHTML=icon;control.append(text);
  control.addEventListener('click',()=>navAction(target));
  bar.append(control);
 });
 holder.append(bar);
}
function intro(frame,coords,small){
 const region=appendArea(frame,'dgo-hero-copy',coords);
 region.innerHTML='<h1>Decision <span>Guide</span></h1><p>Choose a situation to explore possible support and referral options.</p>';
}
function makeControls(frame,layout){
 const state=screens[layout];
 // Remove the entire Search needs/agencies field AND its painted illustration.
 // The remaining 13-situation selector is the single clear way to navigate.
 const matte=appendArea(frame,'dgo-search-matte',layout==='desktop'?[45,345,489,87]:[0,521,896,114]);
 matte.setAttribute('aria-hidden','true');
 const choices=appendArea(frame,'dgo-choices dgo-deck',layout==='desktop'?[49,433,480,411]:[57,630,780,117]);state.choices=choices;
 if(layout==='desktop'){
 const head=document.createElement('div');head.className='dgo-choices-label';head.textContent='CHOOSE A SITUATION';choices.append(head);
 const list=document.createElement('div');list.className='dgo-situation-list';list.setAttribute('role','group');list.setAttribute('aria-label','Choose a situation');choices.append(list);state.list=list;
 }else{
  const label=document.createElement('label');label.textContent='Select a situation';label.htmlFor='dgo-mobile-select';choices.append(label);
  const select=document.createElement('select');select.id='dgo-mobile-select';select.setAttribute('aria-label','Choose one of 13 situations');
  select.addEventListener('change',()=>choose(select.value));choices.append(select);state.select=select;
 }
 const deck=document.createElement('div');deck.className='dgo-deck-inner';
 deck.innerHTML='<div class="dgo-deck-kicker">YOUR SUPPORT EXPLORER</div><div class="dgo-deck-row"><button type="button" class="dgo-deck-prev" aria-label="Previous situation">‹</button><button type="button" class="dgo-deck-choice" aria-label="Choose a situation"><span class="dgo-deck-icon" aria-hidden="true">✦</span><span class="dgo-deck-copy"><strong>Choose a situation</strong><small>Explore 13 support categories</small></span></button><button type="button" class="dgo-deck-next" aria-label="Next situation">›</button></div><div class="dgo-deck-foot"><span class="dgo-deck-count">13 situations</span><button type="button" class="dgo-deck-all">View all ▦</button></div>';
 choices.append(deck);state.deck=deck;
 deck.querySelector('.dgo-deck-prev').addEventListener('click',()=>cycle(-1));
 deck.querySelector('.dgo-deck-next').addEventListener('click',()=>cycle(1));
 deck.querySelector('.dgo-deck-choice').addEventListener('click',openPicker);
 deck.querySelector('.dgo-deck-all').addEventListener('click',openPicker);
 const photo=appendArea(frame,'dgo-photo',layout==='desktop'?[588,448,390,335]:[60,754,345,246]);
 photo.innerHTML='<img src="assets/decision-pathway.webp" alt="Jamaican community-support guidance scene">';state.photo=photo.querySelector('img');
 const section=appendArea(frame,'dgo-results',layout==='desktop'?[994,430,471,139]:[426,745,407,257]);
 section.innerHTML='<div class="dgo-state" role="status">13 situations · 26 guide options</div><h2>Find a starting point</h2><p class="dgo-intro">Choose the situation that best matches the need. The agency confirms eligibility.</p><div class="dgo-options" role="list"></div>';
 state.summary=section;
 const resultList=appendArea(frame,'dgo-more',layout==='desktop'?[994,570,471,222]:[58,1010,778,270]);
 resultList.setAttribute('aria-label','Options and named providers from the guide');resultList.setAttribute('role','region');state.more=resultList;
 const footer=appendArea(frame,'dgo-caveat',layout==='desktop'?[588,797,571,52]:[55,1210,780,65]);
 footer.textContent='Possible starting points only. Confirm services, eligibility and requirements with the responsible agency.';
 const emergency=buttonArea(frame,'dgo-emergency',layout==='desktop'?[1171,817,291,35]:[55,1303,780,70],'! Urgent safety guidance',()=>showDialog('Urgent safety comes first',safety));
 state.emergency=emergency;
}
buildNav(desktop);
buildNav(mobile);
brandedLogo(desktop,[16,9,155,81]);brandedLogo(mobile,[18,115,269,75]);
intro(desktop,[83,151,591,155],false);intro(mobile,[69,383,749,119],true);
makeControls(desktop,'desktop');makeControls(mobile,'mobile');
const bottom=[['Find Services','services'],['Make a Referral','referrals'],['Read the Manual','manual']];
[[[371,901,251,78],[663,900,253,78],[952,899,254,78]],[[43,1430,257,93],[318,1430,257,93],[590,1430,257,93]]].forEach((coords,j)=>{
 const frame=j?mobile:desktop;
 coords.forEach((r,i)=>buttonArea(frame,'dgo-footer-action dgo-footer-'+i,r,bottom[i][0],()=>navAction(bottom[i][1])));
});
buttonArea(desktop,'dgo-gia',[1300,841,177,167],'Ask GIA',promptGia);
buttonArea(mobile,'dgo-gia',[635,1560,221,154],'Ask GIA',promptGia);
// The real existing GIA character is reused, not a second generated avatar.
for(const [device,coords] of [['desktop',[1311,847,140,145]],['mobile',[720,1530,138,134]]]){
 const frame=screens[device].frame;const portrait=appendArea(frame,'dgo-real-gia',coords);
 portrait.innerHTML='<img src="assets/mobile-v3/gia.png" alt="" aria-hidden="true">';
}

const activityIcons=[
 '🫶','🎓','👵','💼','♿','🤝','🌱','🩻','❤️','🌿','🛡️','⛈️','👶'
];
function cycle(delta){if(!situations.length)return;const i=situations.indexOf(selected);choose(situations[(i<0?(delta<0?0:-1):i+delta+situations.length)%situations.length]);}
function renderPicker(){
 const total=Math.max(1,Math.ceil(situations.length/4));pickerPage=Math.max(0,Math.min(total-1,pickerPage));
 const grid=picker.querySelector('.dgo-picker-grid');grid.replaceChildren();
 situations.slice(pickerPage*4,pickerPage*4+4).forEach(s=>{
  const i=situations.indexOf(s),b=document.createElement('button');b.type='button';b.className='dgo-picker-item';
  const mark=document.createElement('span');mark.className='dgo-picker-icon';mark.textContent=activityIcons[i]||'✦';mark.setAttribute('aria-hidden','true');
  const label=document.createElement('strong');label.textContent=displayNames[i]||s;
  b.append(mark,label);b.setAttribute('aria-label',s);b.addEventListener('click',()=>{picker.close();choose(s)});
  grid.append(b);
 });
 picker.querySelector('.dgo-picker-page').textContent=(pickerPage+1)+' / '+total;
 picker.querySelector('[data-pager="-1"]').disabled=pickerPage===0;
 picker.querySelector('[data-pager="1"]').disabled=pickerPage===total-1;
}
function openPicker(){if(!situations.length)return;const i=situations.indexOf(selected);pickerPage=i<0?0:Math.floor(i/4);renderPicker();if(!picker.open)picker.showModal();}
const picker=document.createElement('dialog');picker.className='dgo-picker-dialog';picker.setAttribute('aria-labelledby','dgo-picker-title');
picker.innerHTML='<div class="dgo-picker-header"><div><small>MOHW · JAMAICA</small><h2 id="dgo-picker-title">Choose a situation</h2></div><button type="button" class="dgo-picker-close" aria-label="Close">×</button></div><div class="dgo-picker-grid" aria-label="Situations"></div><div class="dgo-picker-foot"><button type="button" data-pager="-1">‹ Back</button><span class="dgo-picker-page" aria-live="polite"></span><button type="button" data-pager="1">Next ›</button></div>';
root.append(picker);
picker.querySelector('.dgo-picker-close').addEventListener('click',()=>picker.close());
picker.addEventListener('click',e=>{if(e.target===picker)picker.close()});
picker.querySelectorAll('[data-pager]').forEach(b=>b.addEventListener('click',()=>{pickerPage+=Number(b.dataset.pager);renderPicker()}));

const dialog=document.createElement('dialog');dialog.className='dgo-dialog';dialog.setAttribute('aria-labelledby','dgo-dialog-title');
dialog.innerHTML='<div class="dgo-dialog-top"><span>MOHW SOCIAL SUPPORT · JAMAICA</span><button type="button" data-close aria-label="Close guidance">×</button></div><h2 id="dgo-dialog-title"></h2><p id="dgo-dialog-options"></p><div class="dgo-dialog-provider"></div><div class="dgo-dialog-actions"><button type="button" data-directory>Browse agency listings</button><button type="button" data-service hidden>View service details</button><button type="button" data-manual>Read the manual</button></div><p class="dgo-dialog-note">Guide content is a starting point. The responsible agency confirms eligibility, availability and current requirements.</p>';
root.append(dialog);
dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog.querySelector('[data-manual]').addEventListener('click',()=>{dialog.close();navAction('manual')});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
let dialogRow=null;
function showDialog(title,body,provider='',row=null){
 dialogRow=row;dialog.querySelector('h2').textContent=title;dialog.querySelector('#dgo-dialog-options').textContent=body;
 dialog.querySelector('.dgo-dialog-provider').textContent=provider?'Named provider: '+provider:'';
 dialog.querySelector('[data-directory]').hidden=!provider;
 dialog.querySelector('[data-service]').hidden=true;
 if(!dialog.open)dialog.showModal();
 if(provider){
  // Preserve the live underlying service-details action when one is listed.
  const candidates=[...document.querySelectorAll('#decisionCards .decision-route-card')];
  const nativeRow=candidates.find(e=>e.querySelector('h3')?.textContent===body && e.querySelector('.provider span')?.textContent===provider);
  const nativeBtn=nativeRow?.querySelector('[data-decision-service]');
  if(nativeBtn){const open=dialog.querySelector('[data-service]');open.hidden=false;open.textContent=nativeBtn.textContent.trim();open.onclick=()=>{dialog.close();nativeBtn.click()};}
 }
}
dialog.querySelector('[data-directory]').addEventListener('click',()=>{
 if(!dialogRow)return;
 const provider=dialogRow.provider;dialog.close();
 const native=[...document.querySelectorAll('#decisionCards .decision-route-card')].find(e=>e.querySelector('h3')?.textContent===dialogRow.options&&e.querySelector('.provider span')?.textContent===provider);
 if(native?.querySelector('[data-decision-directory]'))native.querySelector('[data-decision-directory]').click();
 else{navAction('services');const search=$('#serviceSearch');if(search){search.value=provider;search.dispatchEvent(new Event('input',{bubbles:true}))}}
});
function choose(value){selected=value;routePage=0;for(const state of Object.values(screens))if(state.select)state.select.value=value;syncNative();render();}
function syncNative(){
 const nativeSearch=$('#decisionSearch');if(nativeSearch){nativeSearch.value='';nativeSearch.dispatchEvent(new Event('input',{bubbles:true}));}
 if(selected){const existing=[...document.querySelectorAll('#decisionSituations [data-decision-situation]')].find(b=>b.dataset.decisionSituation===selected);
  // Selection drives the original referral and agency-match engine.
  if(existing){existing.click();}}
 else $('#decisionReset')?.click();
}
function render(){
 // No search filter: every authentic situation remains available in the selector.
 const groups=situations;
 for(const [device,state] of Object.entries(screens)){
  if(state.list){state.list.replaceChildren();groups.forEach((name,i)=>{
   const b=document.createElement('button');b.type='button';b.className='dgo-situation';b.textContent=name;b.title=name;b.setAttribute('aria-pressed',String(selected===name));
   b.addEventListener('click',()=>choose(name));state.list.append(b);
  });if(!groups.length)state.list.textContent='No matching situation. Try another search.';
  }
  if(state.select){const old=state.select.value;state.select.replaceChildren();
   const opt=document.createElement('option');opt.value='';opt.textContent='Choose one of '+situations.length+' situations';state.select.append(opt);
   groups.forEach(s=>{
    const item=document.createElement('option');item.value=s;
    item.textContent=displayNames[situations.indexOf(s)]||s;
    item.setAttribute('aria-label',s);item.title=s;state.select.append(item);
   });
   state.select.value=groups.includes(selected)?selected:'';
  }
  const position=selected?situations.indexOf(selected):-1;
  state.deck.querySelector('.dgo-deck-icon').textContent=activityIcons[Math.max(0,position)]||'✦';
  state.deck.querySelector('.dgo-deck-copy strong').textContent=position<0?'Choose a situation':displayNames[position]||selected;
  state.deck.querySelector('.dgo-deck-copy small').textContent=position<0?'Find the right starting point':source.filter(d=>d.situation===selected).length+' guide options';
  state.deck.querySelector('.dgo-deck-count').textContent=position<0?situations.length+' situations':(position+1)+' / '+situations.length+' situations';
  state.photo.src=images[position]||'assets/decision-pathway.webp';state.photo.alt=selected?'Illustration for '+selected:'Community support worker exploring possible options';
  const rows=selected?source.filter(r=>r.situation===selected):[];
  const summary=state.summary;
  summary.querySelector('.dgo-state').textContent=selected?rows.length+' guide '+(rows.length===1?'option':'options')+' · Situation '+(position+1)+' of '+situations.length:situations.length+' situations · '+source.length+' guide options';
  summary.querySelector('h2').textContent=selected?(device==='mobile'?displayNames[position]||selected:selected):'Find a starting point';
  summary.querySelector('h2').setAttribute('aria-label',selected||'Find a starting point');
  summary.querySelector('h2').title=selected||'Find a starting point';
  summary.querySelector('.dgo-intro').textContent=selected?(rows.length?'Select an option below to see its full wording and named provider.':'No option matches the current search for this situation.'):'Choose one of the situations to see the possible guide options.';
  summary.querySelector('.dgo-options').textContent='';
  state.more.replaceChildren();
  if(!selected){const hint=document.createElement('p');hint.className='dgo-empty-hint';hint.textContent='The guide lists 26 possible routes across 13 situations. Select one to explore; eligibility is always confirmed by the agency.';state.more.append(hint);}
  else if(!rows.length){const hint=document.createElement('p');hint.className='dgo-empty-hint';hint.textContent='Choose a different situation to see other guide options.';state.more.append(hint);}
  const maxPage=Math.max(0,Math.ceil(rows.length/2)-1);routePage=Math.min(routePage,maxPage);
  rows.slice(routePage*2,routePage*2+2).forEach((row,i)=>{
   const b=document.createElement('button');b.type='button';b.className='dgo-route';
   b.innerHTML='<span class="dgo-route-count">'+String(routePage*2+i+1).padStart(2,'0')+'</span><span class="dgo-route-text"></span><span class="dgo-route-arrow" aria-hidden="true">↗</span>';
   b.querySelector('.dgo-route-text').textContent=row.options;
   b.setAttribute('aria-label','Guide option '+(routePage*2+i+1)+': '+row.options);
   b.addEventListener('click',()=>{syncNative();showDialog(selected,row.options,row.provider,row)});
   state.more.append(b);
  });
  if(rows.length>2){
   const pager=document.createElement('div');pager.className='dgo-route-pager';
   pager.innerHTML='<button type="button" aria-label="Previous guide options">‹</button><span></span><button type="button" aria-label="Next guide options">›</button>';
   pager.querySelector('span').textContent=(routePage*2+1)+'–'+Math.min(routePage*2+2,rows.length)+' of '+rows.length;
   const buttons=pager.querySelectorAll('button');buttons[0].disabled=routePage===0;buttons[1].disabled=routePage===maxPage;
   buttons[0].addEventListener('click',()=>{routePage--;render()});buttons[1].addEventListener('click',()=>{routePage++;render()});
   state.more.append(pager);
  }
 }
}
fetch('data/guide-content.json?v=directory-8',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Decision Guide content unavailable');return r.json()}).then(json=>{
 source=json.decision||[];situations=[...new Set(source.map(row=>row.situation))];render();
}).catch(err=>{console.error(err);for(const state of Object.values(screens))state.more.textContent='Unable to load decision guidance. Please refresh the page.'});
view.append(root);view.classList.add('decision-overlay-enabled');
function sync(){const on=view.classList.contains('active');document.documentElement.classList.toggle('dgo-active',on);root.hidden=!on;}
new MutationObserver(sync).observe(view,{attributes:true,attributeFilter:['class']});sync();
window.MOHWDecisionOverlay={get situation(){return selected},get count(){return situations.length},get optionsCount(){return source.length},select:choose};
})();