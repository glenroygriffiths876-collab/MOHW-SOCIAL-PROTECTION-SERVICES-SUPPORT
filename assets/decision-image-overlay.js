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
const nav=[['Home','about'],['Referrals','referrals'],['Decision Guide','decision'],['Find Services','services'],['Digital Manual','manual'],['Accessibility','access']];
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
let source=[],situations=[],selected='',query='',activeOption=0;
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
function buildNav(frame,positions){positions.forEach((coords,i)=>buttonArea(frame,'dgo-nav dgo-nav-'+i,coords,nav[i][0],()=>navAction(nav[i][1])))}
function intro(frame,coords,small){
 const region=appendArea(frame,'dgo-hero-copy',coords);
 region.innerHTML='<h1>Decision <span>Guide</span></h1><p>Choose a situation to explore possible support and referral options.</p>';
}
function makeControls(frame,layout){
 const state=screens[layout];
 const search=appendArea(frame,'dgo-search',layout==='desktop'?[60,366,462,52]:[59,546,774,82]);
 const input=document.createElement('input');input.type='search';input.placeholder='Search a situation or service';input.autocomplete='off';input.setAttribute('aria-label','Search situations, programmes and agencies');
 input.addEventListener('input',()=>{query=input.value.trim();screens[layout==='desktop'?'mobile':'desktop'].searchInput.value=input.value;render()});
 if(layout==='mobile')input.placeholder='Search needs or agencies';
 search.append(input);state.searchInput=input;
 const clear=document.createElement('button');clear.type='button';clear.className='dgo-reset';
 clear.textContent='Reset';clear.setAttribute('aria-label','Reset decision search and situation');
 clear.addEventListener('click',()=>{query='';selected='';screens.desktop.searchInput.value='';screens.mobile.searchInput.value='';syncNative();render()});
 search.append(clear);
 const choices=appendArea(frame,'dgo-choices',layout==='desktop'?[49,433,480,411]:[57,635,780,93]);state.choices=choices;
 if(layout==='desktop'){
 const head=document.createElement('div');head.className='dgo-choices-label';head.textContent='CHOOSE A SITUATION';choices.append(head);
 const list=document.createElement('div');list.className='dgo-situation-list';list.setAttribute('role','group');list.setAttribute('aria-label','Choose a situation');choices.append(list);state.list=list;
 }else{
  const label=document.createElement('label');label.textContent='Select a situation';label.htmlFor='dgo-mobile-select';choices.append(label);
  const select=document.createElement('select');select.id='dgo-mobile-select';select.setAttribute('aria-label','Choose one of 13 situations');
  select.addEventListener('change',()=>choose(select.value));choices.append(select);state.select=select;
 }
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
buildNav(desktop,[[180,34,183,50],[385,34,182,50],[589,34,182,50],[797,34,182,50],[1006,34,181,50],[1210,34,186,50]]);
buildNav(mobile,[[11,5,143,91],[158,5,143,91],[305,5,143,91],[452,5,143,91],[598,5,143,91],[746,5,143,91]]);
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
function choose(value){selected=value;for(const state of Object.values(screens))if(state.select)state.select.value=value;syncNative();render();}
function syncNative(){
 const nativeSearch=$('#decisionSearch');if(nativeSearch){nativeSearch.value=query;nativeSearch.dispatchEvent(new Event('input',{bubbles:true}));}
 if(selected){const existing=[...document.querySelectorAll('#decisionSituations [data-decision-situation]')].find(b=>b.dataset.decisionSituation===selected);
  // Selection drives the original referral and agency-match engine.
  if(existing){existing.click();}}
 else $('#decisionReset')?.click();
}
function render(){
 const normalize=s=>String(s||'').toLocaleLowerCase('en');const q=normalize(query);
 const groups=situations.filter(s=>!q||normalize(s).includes(q)||source.some(r=>r.situation===s&&normalize(r.options+' '+r.provider).includes(q)));
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
  state.photo.src=images[position]||'assets/decision-pathway.webp';state.photo.alt=selected?'Illustration for '+selected:'Community support worker exploring possible options';
  const rows=selected?source.filter(r=>r.situation===selected && (!q||normalize(r.situation+' '+r.options+' '+r.provider).includes(q))):[];
  const summary=state.summary;
  summary.querySelector('.dgo-state').textContent=selected?rows.length+' guide '+(rows.length===1?'option':'options')+' · Situation '+(position+1)+' of '+situations.length:situations.length+' situations · '+source.length+' guide options';
  summary.querySelector('h2').textContent=selected?(device==='mobile'?displayNames[position]||selected:selected):'Find a starting point';
  summary.querySelector('h2').setAttribute('aria-label',selected||'Find a starting point');
  summary.querySelector('h2').title=selected||'Find a starting point';
  summary.querySelector('.dgo-intro').textContent=selected?(rows.length?'Select an option below to see its full wording and named provider.':'No option matches the current search for this situation.'):'Choose a situation or search for a service, need or agency.';
  summary.querySelector('.dgo-options').textContent='';
  state.more.replaceChildren();
  if(!selected){const hint=document.createElement('p');hint.className='dgo-empty-hint';hint.textContent='The guide lists 26 possible routes across 13 situations. Select one to explore; eligibility is always confirmed by the agency.';state.more.append(hint);}
  else if(!rows.length){const hint=document.createElement('p');hint.className='dgo-empty-hint';hint.textContent='Clear the search or choose another situation.';state.more.append(hint);}
  rows.forEach((row,i)=>{
   const b=document.createElement('button');b.type='button';b.className='dgo-route';
   b.innerHTML='<span class="dgo-route-count">'+String(i+1).padStart(2,'0')+'</span><span class="dgo-route-text"></span><span class="dgo-route-arrow" aria-hidden="true">↗</span>';
   b.querySelector('.dgo-route-text').textContent=row.options;
   b.setAttribute('aria-label','Guide option '+(i+1)+': '+row.options);
   b.addEventListener('click',()=>{syncNative();showDialog(selected,row.options,row.provider,row)});
   state.more.append(b);
  });
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