/* Clean interior redesign — follow approved 34-screen page structures, retain native guide data and functions.
   Preview only. Home artwork and native application services remain unchanged. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const paths={chevron:'<path d="m9 5 7 7-7 7"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',alert:'<path d="M12 3 2 21h20L12 3Zm0 6v5m0 3v.1"/>',ear:'<path d="M7 16a5 5 0 1 1 8-4.2c-.5 2.2-2.4 2.5-2.7 4.7-.2 2-1.5 3.3-3.4 3.3"/><path d="M3.8 5a9 9 0 0 0 0 12m16.4-12a9 9 0 0 1 0 12"/>',book:'<path d="M12 6C8 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>',arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/>'};
const icon=(id)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[id]||paths.arrow)+'</svg>';
let guide=null,activeStep=0,activeDecision=null,serviceTab='locations',browseMode='programmes';
const referralTips=[
 ['Ask what is affecting the person’s care or wellbeing.','Listen without judgement and respect the person’s priorities.'],
 ['Check for urgent safety or health concerns.','Follow approved emergency and safeguarding procedures first.'],
 ['Choose a suitable starting point together.','Prioritise safety, health and basic needs when needs overlap.'],
 ['Explain the next step and check the documents needed.','Requirements vary. Do not promise eligibility.'],
 ['With consent, help the person connect to the agency.','Confirm contact details and protect confidentiality.'],
 ['Document the referral and check whether support was accessed.','Follow facility policy and use approved record systems.']
];
const referralPhotos=['assets/referral-listening.webp','assets/referral-safety.webp','assets/referral-match.webp','assets/referral-preparing.webp','assets/referral-warmhandoff.webp','assets/referral-followup.webp'];
const decisionLabels={
 'Someone who wants/needs mental health support':'Mental health and wellbeing',
 'A Parent or Student':'Family, school and student support',
 'A Senior (60+)':'Support for seniors',
 'Looking for Skills Training and Work':'Training and employment',
 'A Person with a Disability':'Disability support',
 'In a Crisis (Fire, Death)':'Crisis, bereavement and emergency',
 'An Entrepreneur/Farmer/ Backyard Gardening':'Business, farming and gardening',
 'A Patient Needing Tests':'Tests and diagnostic support',
 'A Patient Needing Treatment':'Help with treatment costs',
 'Affected by Substance Misuse':'Substance-use support',
 'Experiencing Abuse, Domestic Violence, or GBV':'Safety, abuse and violence support',
 'Affected by Disaster or Fire':'Disaster recovery',
 'A Pregnant Adolescent or Adolescent Mother or Vulnerable Chidren':'Adolescent parents and vulnerable children'
};
function openNative(id){
 const b=$('#mainNav [data-nav="'+id+'"]');if(b)b.click();else{
  $$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+id));
  history.replaceState(null,'','#'+id);
 }
 window.dispatchEvent(new Event('hashchange'));window.scrollTo({top:0,behavior:'instant'});
}
function goServices(tab,mode){
 openNative('services');switchService(tab||'locations');
 if(mode)switchBrowse(mode);
}
function trimMenu(){
 const menu=$('#ad-menu');
 if(menu){menu.innerHTML=[['about','Home'],['services','Find services'],['referrals','Make a referral'],['decision','Help me choose'],['manual','Read the manual']].map(([id,label])=>'<button type="button" data-ad-nav="'+id+'">'+label+icon('chevron')+'</button>').join('');}
 const hd=$('#ad-header .ad-desktop-nav');if(hd){hd.innerHTML=[['about','Home'],['services','Find services'],['referrals','Referrals'],['decision','Decision guide'],['manual','Manual']].map(([id,label])=>'<button type="button" data-ad-nav="'+id+'">'+label+'</button>').join('');}
 // Keep other source views accessible through Find Services but not as competing pages.
 const map={programmes:['programmes','programmes'],categories:['programmes','categories'],contacts:['contacts',null]};
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-ad-nav],[data-nav]');
  const id=b?.getAttribute('data-ad-nav')||b?.getAttribute('data-nav');
  if(!id||!map[id]||b?.closest('#cr-tabs, #cr-internal-tabs'))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  goServices(map[id][0],map[id][1]);
 },true);
 const checkHash=()=>{const id=location.hash.slice(1);if(map[id])goServices(map[id][0],map[id][1]);};
 window.addEventListener('hashchange',()=>{if(['programmes','categories','contacts'].includes(location.hash.slice(1)))checkHash();});
}
function hero(title,photo,alt,small){
 return '<div class="cr-hero"><div class="cr-hero-copy">'+(small?'<span class="cr-eyebrow">'+E(small)+'</span>':'')+'<h1>'+E(title)+'</h1></div><img src="'+E(photo)+'" loading="eager" decoding="async" alt="'+E(alt)+'"><div class="cr-hero-swoosh" aria-hidden="true"></div></div>';
}
function buildReferral(){
 const v=$('#view-referrals');if(!v)return;
 const host=document.createElement('div');host.id='cr-referral';host.className='cr-page cr-referral';
 host.innerHTML=hero('Make a referral','assets/referral-listening.webp','Jamaican support worker listening attentively to an older woman','')+
 '<div class="cr-ref-body flagship-workspace"><div class="flagship-kicker">REFERRAL WORKSPACE · 06 STAGES</div><div class="flagship-stage-map">'+referralTips.map((_,i)=>'<button type="button" data-cr-step="'+i+'"><b>0'+(i+1)+'</b>'+['Listen','Assess safety','Match support','Prepare','Connect','Follow up'][i]+'</button>').join('')+'</div><img id="flagship-step-photo" src="'+referralPhotos[0]+'" alt="" class="flagship-step-photo">'+
 '<div class="cr-step-meta"><strong id="cr-ref-counter">Step 1 of 6</strong><span>Guided referral pathway</span></div>'+
 '<div class="cr-progress" id="cr-progress" role="group" aria-label="Six referral steps">'+Array.from({length:6},(_,i)=>'<button type="button" data-cr-step="'+i+'" aria-label="Go to step '+(i+1)+'" aria-current="'+(i===0?'step':'false')+'"></button>').join('')+'</div>'+
 '<h2 id="cr-ref-title">Identify the need</h2><p id="cr-ref-summary" class="cr-lead"></p>'+
 '<div class="cr-ref-tip"><span>'+icon('ear')+'</span><p id="cr-ref-tip"></p></div>'+
 '<details class="cr-disclosure" id="cr-ref-detail"><summary><span class="cr-detail-icon">'+icon('book')+'</span>Full wording from the guide <b>⌄</b></summary><div id="cr-ref-full"></div></details>'+
 '<div class="cr-ref-controls"><button id="cr-ref-prev" type="button">‹ Previous</button><button id="cr-ref-next" class="cr-primary" type="button">Next step '+icon('arrow')+'</button></div>'+
 '<aside class="cr-danger"><span>'+icon('alert')+'</span><div><strong>Urgent safety comes first</strong><p>If someone is at immediate risk of harm, follow emergency procedures and safeguarding guidance.</p></div></aside>'+
 '<p class="cr-draft-note">Use the full guide and confirm agency requirements before referring.</p>'+
 '</div>';
 v.prepend(host);v.classList.add('cr-ready');
 host.addEventListener('click',e=>{
  const b=e.target.closest('[data-cr-step]');if(b){activeStep=Number(b.dataset.crStep);paintReferral();return;}
  if(e.target.closest('#cr-ref-prev')&&activeStep>0){activeStep--;paintReferral();return;}
  if(e.target.closest('#cr-ref-next')){if(activeStep<5){activeStep++;paintReferral();}else goServices('locations');}
 });
 paintReferral();
}
function paintReferral(){
 const steps=guide?.referralSteps;if(!steps?.length)return;
 activeStep=Math.min(activeStep,steps.length-1);let step=steps[activeStep];
 $('#flagship-step-photo').src=referralPhotos[activeStep];$$('.flagship-stage-map button').forEach((b,i)=>{b.classList.toggle('selected',i===activeStep);b.setAttribute('aria-current',i===activeStep?'step':'false')});$('#cr-ref-counter').textContent='Step '+(activeStep+1)+' of 6';
 $('#cr-ref-title').textContent=step[0];
 $('#cr-ref-summary').textContent=referralTips[activeStep][0];
 $('#cr-ref-tip').textContent=referralTips[activeStep][1];
 $('#cr-ref-full').textContent=step[1];$('#cr-ref-detail').open=false;
 $$('#cr-progress button').forEach((b,i)=>{b.classList.toggle('completed',i<=activeStep);b.setAttribute('aria-current',i===activeStep?'step':'false')});
 $('#cr-ref-prev').disabled=activeStep===0;$('#cr-ref-next').innerHTML=activeStep===5?'Find services '+icon('arrow'):'Next step '+icon('arrow');
}
function buildDecision(){
 const v=$('#view-decision');if(!v)return;
 const host=document.createElement('div');host.id='cr-decision';host.className='cr-page cr-decision';
 host.innerHTML=hero('Decision Guide','assets/decision-options.webp','Jamaican community members exploring support options','')+
 '<div class="cr-decision-body flagship-workspace"><div class="flagship-kicker">DECISION WORKSPACE · EXPLORE SUPPORT</div><div class="flagship-flow"><button type="button" data-flow="need">Identify need</button><button type="button" data-flow="routes" disabled>Explore routes</button><button type="button" data-flow="refer" disabled>Refer</button></div><div id="cr-decision-choice"><h2>What support is needed?</h2>'+
 '<label class="cr-decision-search">'+icon('search')+'<input id="cr-decision-query" type="search" placeholder="Search situations" aria-label="Search situations"></label>'+
 '<div id="cr-decision-list" class="cr-choice-list"></div></div>'+
 '<div id="cr-decision-results" hidden><button type="button" id="cr-decision-back" class="cr-back">‹ All situations</button><p class="cr-eyebrow">POSSIBLE STARTING POINTS</p><h2 id="cr-decision-title"></h2><p class="cr-description">Options transcribed from the guide. The responsible agency confirms services and eligibility.</p><div id="cr-decision-cards"></div><button type="button" id="cr-decision-services" class="cr-primary">Continue to referrals '+icon('arrow')+'</button></div>'+
 '<aside class="cr-danger"><span>'+icon('alert')+'</span><div><strong>Immediate danger or medical emergency?</strong><p>Use approved emergency procedures. Do not wait for a directory search.</p></div></aside></div>';
 v.prepend(host);v.classList.add('cr-ready');
 host.addEventListener('click',e=>{
  const flow=e.target.closest('[data-flow]');if(flow){if(flow.dataset.flow==='need'){activeDecision=null;paintDecisionResults();}else if(flow.dataset.flow==='routes'&&activeDecision){paintDecisionResults();}else if(flow.dataset.flow==='refer'&&activeDecision){openNative('referrals');}return;}const option=e.target.closest('[data-cr-situation]');if(option){activeDecision=option.dataset.crSituation;paintDecisionResults();return;}
  if(e.target.closest('#cr-decision-back')){activeDecision=null;paintDecisionResults();return;}
  if(e.target.closest('#cr-decision-services'))openNative('referrals');
 });
 $('#cr-decision-query').addEventListener('input',paintDecisionList);
 paintDecisionList();
}
function paintDecisionList(){
 if(!guide?.decision)return;
 const group=[...new Set(guide.decision.map(x=>x.situation))];
 const q=$('#cr-decision-query')?.value.toLowerCase().trim()||'';
 const matches=group.filter(x=>!q||(decisionLabels[x]||x).toLowerCase().includes(q)||x.toLowerCase().includes(q));
 $('#cr-decision-list').innerHTML=matches.length?matches.map(s=>{
  const count=guide.decision.filter(x=>x.situation===s).length;
  return '<button type="button" data-cr-situation="'+E(s)+'"><span><strong>'+E(decisionLabels[s]||s.replace('Chidren','Children'))+'</strong><small>'+count+' possible '+(count===1?'route':'routes')+'</small></span>'+icon('chevron')+'</button>';
 }).join(''):'<p class="cr-no-results">No situations matched your search.</p>';
}
function paintDecisionResults(){
 if(!guide?.decision)return;
 const selected=Boolean(activeDecision);$('[data-flow]').forEach(b=>{b.disabled=b.dataset.flow!=='need'&&!selected;b.setAttribute('aria-current',b.dataset.flow===(selected?'routes':'need')?'step':'false')});
 $('#cr-decision-choice').hidden=selected;$('#cr-decision-results').hidden=!selected;
 if(!selected)return;
 const routes=guide.decision.filter(x=>x.situation===activeDecision);
 $('#cr-decision-title').textContent=decisionLabels[activeDecision]||activeDecision;
 $('#cr-decision-cards').innerHTML=routes.map((r,i)=>'<article class="cr-route"><span>OPTION '+(i+1)+'</span><h3>'+E(r.options)+'</h3><p><strong>Provider:</strong> '+E(r.provider)+'</p></article>').join('');
 $('#cr-decision-results').scrollIntoView({behavior:reduce()?'auto':'smooth',block:'start'});
}
function moveNode(selector,where){
 const src=$(selector),target=$(where);if(src&&target)target.append(src);
}
function buildServices(){
 const view=$('#view-services');const content=$('#view-services .page-content');if(!view||!content)return;
 const shell=document.createElement('section');shell.id='cr-services';shell.className='cr-page';
 shell.innerHTML=hero('Find services','assets/services-explore.webp','Jamaican community navigators exploring services together','')+
 '<div class="cr-service-body"><h2>What are you looking for?</h2>'+
 '<nav id="cr-tabs" class="cr-tabs" aria-label="Ways to find support">'+
 '<button type="button" data-cr-tab="locations" class="selected" aria-selected="true">'+icon('pin')+'Offices & map</button>'+
 '<button type="button" data-cr-tab="programmes" aria-selected="false">'+icon('book')+'Programmes & needs</button>'+
 '<button type="button" data-cr-tab="contacts" aria-selected="false">Agency contacts</button>'+
 '</nav>'+
 '<div class="cr-tabpanel" id="cr-panel-locations"></div>'+
 '<div class="cr-tabpanel" id="cr-panel-programmes" hidden><div class="cr-subtabs" id="cr-internal-tabs"><button type="button" class="selected" data-cr-browse="programmes">Programmes</button><button type="button" data-cr-browse="categories">By type of support</button></div>'+
 '<div id="cr-programmes" class="cr-data-view"><p class="cr-context">Search programme profiles to see where to go and how to apply.</p><div class="cr-selector" id="cr-programme-filter-wrap"><label>Support type <select id="cr-programme-filter" aria-label="Filter programmes by support type"><option value="all">All support types</option></select></label></div><div id="cr-programme-native"></div><button type="button" class="cr-show-more" data-cr-show="programmes" hidden>View more programmes ↓</button></div>'+
 '<div id="cr-categories" class="cr-data-view" hidden><p class="cr-context">Browse the types of support listed in the guide.</p><div class="cr-selector"><label>Support type <select id="cr-category-filter" aria-label="Choose support type"><option value="all">All support types</option></select></label></div><div id="cr-category-native"></div><button type="button" class="cr-show-more" data-cr-show="categories" hidden>View more options ↓</button></div></div>'+
 '<div class="cr-tabpanel" id="cr-panel-contacts" hidden><p class="cr-context">Find contact details recorded in the guide. Confirm them directly before use.</p><div id="cr-contacts-native"></div><button type="button" class="cr-show-more" data-cr-show="contacts" hidden>View more agencies ↓</button><details class="cr-disclosure cr-contacts-extra"><summary>Hotlines, documents and application details <b>⌄</b></summary><div id="cr-contacts-docs"></div></details></div>'+
 '</div>';
 content.prepend(shell);
 // Reuse source-linked interactive map and existing profile renderers, so there is only ONE visible directory.
 moveNode('#ad-directory','#cr-panel-locations');
 for(const id of ['programmes','categories']){
  const source=$('#view-'+id+' .page-content'), dest=$('#cr-'+(id==='programmes'?'programme':'category')+'-native');
  if(source&&dest){
   for(const selector of ['.toolbar','#'+(id==='programmes'?'programmeCount':'categoryCount'),'#'+(id==='programmes'?'programmeCards':'categoryCards')]){
    const found=$(selector,source);if(found)dest.append(found);
   }
  }
 }
 const contactsSrc=$('#view-contacts .page-content');
 if(contactsSrc){for(const s of ['.toolbar','#contactCards']){const node=$(s,contactsSrc);if(node)$('#cr-contacts-native').append(node);}
 for(const s of ['.hotline-panel','.documents-panel']){const node=$(s,contactsSrc);if(node)$('#cr-contacts-docs').append(node);}}
 view.classList.add('cr-ready');
 shell.addEventListener('click',e=>{
  const b=e.target.closest('[data-cr-tab]');if(b){switchService(b.dataset.crTab);return;}
  const sub=e.target.closest('[data-cr-browse]');if(sub){switchBrowse(sub.dataset.crBrowse);return;}
  const more=e.target.closest('[data-cr-show]');if(more){
   const key=more.dataset.crShow,area=$('#cr-'+key+'-native')||$('#cr-contacts-native');
   area?.classList.add('cr-expanded');more.hidden=true;return;
  }
 });
 const syncDropdown=(nativeId,dropdownId,nativeAttr)=>{
  const group=$('#'+nativeId),select=$('#'+dropdownId);if(!group||!select)return;
  const refresh=()=>{
   const buttons=$$('button['+nativeAttr+']',group);
   if(!buttons.length)return;
   const prior=select.value;select.innerHTML=buttons.map(b=>'<option value="'+E(b.getAttribute(nativeAttr))+'">'+E(b.textContent.trim())+'</option>').join('');
   if($('option[value="'+CSS.escape(prior)+'"]',select))select.value=prior;
  };
  new MutationObserver(refresh).observe(group,{childList:true,subtree:true});
  refresh();
  select.addEventListener('change',()=>{const button=$$('button',group).find(b=>b.getAttribute(nativeAttr)===select.value);button?.click();});
 };
 syncDropdown('programmeFilters','cr-programme-filter','data-prog-filter');
 syncDropdown('categoryFilters','cr-category-filter','data-cat-filter');
 for(const [key,selector] of [['programmes','#programmeCards'],['categories','#categoryCards'],['contacts','#contactCards']]){
  const list=$(selector),btn=$('[data-cr-show="'+key+'"]'),area=$('#cr-'+(key==='programmes'?'programme':'category')+'-native')||$('#cr-contacts-native');
  if(!list||!btn)return;
  const check=()=>{if(!area?.classList.contains('cr-expanded'))btn.hidden=$$('article',list).length<=7;else btn.hidden=true;};
  new MutationObserver(check).observe(list,{childList:true});
  check();
 }
 // Start in the map view with no duplicate listing.
 switchService('locations');
}
function switchService(id){
 if(!['locations','programmes','contacts'].includes(id))id='locations';
 serviceTab=id;
 $$('#cr-tabs button').forEach(b=>{const a=b.dataset.crTab===id;b.classList.toggle('selected',a);b.setAttribute('aria-selected',String(a));});
 $$('.cr-tabpanel').forEach(p=>p.hidden=p.id!=='cr-panel-'+id);
 if(id==='locations')setTimeout(()=>{if(typeof L!=='undefined'){$('#ad-map-panel')?.hidden===false&&window.dispatchEvent(new Event('resize'));}},100);
}
function switchBrowse(mode){
 browseMode=mode==='categories'?'categories':'programmes';
 $$('#cr-internal-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.crBrowse===browseMode));
 $('#cr-programmes').hidden=browseMode!=='programmes';$('#cr-categories').hidden=browseMode!=='categories';
}
function buildManual(){
 const v=$('#view-manual');if(!v)return;
 const cover=document.createElement('div');cover.id='cr-manual-intro';cover.className='cr-page';
 cover.innerHTML=hero('Digital manual','assets/about-guide.webp','Jamaican family reviewing a guide together','')+
 '<p class="cr-manual-explain">Read, listen or turn the pages of the Social Protection Services Support Guide.</p>';
 v.prepend(cover);v.classList.add('cr-ready');
 const reader=$('#manual-reader');
 if(reader){const primary=$('#manual-welcome');if(primary){primary.querySelector('h2')?.classList.add('cr-reader-title');}}
}
function boot(){
 trimMenu();buildReferral();buildDecision();buildServices();buildManual();
 // All content comes from the same November guide used by the untouched live application.
 fetch('data/guide-content.json?v=clean-guide-20261122',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('source missing'))).then(j=>{
  guide=j;paintReferral();paintDecisionList();
 }).catch(()=>{if($('#cr-ref-full'))$('#cr-ref-full').textContent='Guide details unavailable; please reload.';});
 if(location.hash==='#programmes')goServices('programmes','programmes');
 if(location.hash==='#categories')goServices('programmes','categories');
 if(location.hash==='#contacts')goServices('contacts');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

;(()=>{const s=document.createElement('style');s.textContent=`html.ad-preview #cr-referral .flagship-workspace,html.ad-preview #cr-decision .flagship-workspace{background:linear-gradient(145deg,#10183e,#28336b)!important;color:white!important;padding:clamp(16px,4vw,36px)!important;border-radius:24px!important}.flagship-kicker{color:#f8d36b;font:800 11px system-ui;letter-spacing:.12em;margin-bottom:16px}.flagship-stage-map{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-bottom:18px}.flagship-stage-map button{display:grid;gap:6px;text-align:left;background:#303e71;color:white;border:1px solid #7786b4;border-radius:15px;padding:12px;font:700 12px system-ui;cursor:pointer}.flagship-stage-map button b{font-size:24px;color:#f8d36b}.flagship-stage-map button.selected{background:#f8d36b;color:#11183e;box-shadow:0 5px 0 #b58b26}.flagship-stage-map button.selected b{color:#11183e}.flagship-step-photo{width:100%;height:clamp(140px,28vw,300px);object-fit:cover;border-radius:18px;margin-bottom:16px}.flagship-workspace h2,.flagship-workspace .cr-lead,.flagship-workspace .cr-step-meta,.flagship-workspace .cr-description{color:white!important}.flagship-flow{display:flex;gap:6px;margin-bottom:20px}.flagship-flow span{flex:1;text-align:center;background:#354477;padding:12px 5px;border-radius:12px;font-size:12px}.flagship-flow span:first-child{background:#f8d36b;color:#11183e}html.ad-preview #cr-decision-list{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}html.ad-preview #cr-decision-list button{display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:space-between!important;min-height:120px!important;background:linear-gradient(145deg,#fff,#e5e9fa)!important;color:#10183e!important;border-radius:18px!important;padding:14px!important;box-shadow:0 5px 0 #8693c2!important}.flagship-workspace .cr-route,.flagship-workspace .cr-disclosure,.flagship-workspace .cr-ref-tip{color:#17234c!important;background:white!important}.flagship-workspace button{transition:transform .2s}.flagship-workspace button:hover{transform:translateY(-2px)}@media(prefers-reduced-motion:reduce){.flagship-workspace *{transition:none!important;animation:none!important}}`;document.head.append(s)})();
;(()=>{const s=document.createElement('style');s.textContent='html.ad-preview #cr-decision #cr-decision-choice h2,html.ad-preview #cr-decision #cr-decision-title{color:#fff!important}.flagship-flow button{flex:1;min-width:0;background:#354477;color:white;border:1px solid #8794bf;border-radius:12px;padding:12px 4px;font:inherit}.flagship-flow button[aria-current="step"]{background:#f8d36b;color:#11183e}.flagship-flow button:disabled{opacity:.65;cursor:not-allowed}';document.head.append(s)})();