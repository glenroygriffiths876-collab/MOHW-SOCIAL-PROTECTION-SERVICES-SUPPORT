const PARISHES=[
 {name:'Hanover',short:'HAN',x:11.5,y:34},{name:'Westmoreland',short:'WML',x:13,y:55},{name:'St. James',short:'STJ',x:25.5,y:31},{name:'Trelawny',short:'TRE',x:37,y:29},{name:'St. Elizabeth',short:'STE',x:31,y:65},{name:'Manchester',short:'MAN',x:47,y:64},{name:'Clarendon',short:'CLA',x:58.5,y:63},{name:'St. Ann',short:'ANN',x:54,y:31},{name:'St. Catherine',short:'STC',x:68,y:55},{name:'St. Andrew',short:'STA',x:73,y:60},{name:'Kingston',short:'KIN',x:77,y:68},{name:'St. Mary',short:'STM',x:69,y:33},{name:'Portland',short:'POR',x:84,y:40},{name:'St. Thomas',short:'STT',x:87,y:64}
];
const NAV=['about','referrals','decision','services','manual','programmes','categories','contacts'];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
let data=null, selectedParish='ALL', programFilter='all', categoryFilter='all', mapFilter='all', serviceCatalog=[];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x??'').toLowerCase();
function showView(id){if(!NAV.includes(id))return;$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${id}`));$$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));history.replaceState(null,'',`#${id}`);window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')}
$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.nav)));
$$('[data-card-nav]').forEach(c=>{const go=()=>showView(c.dataset.cardNav);c.addEventListener('click',go);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
$('#menuToggle').addEventListener('click',()=>{const n=$('#mainNav'),open=!n.classList.contains('open');n.classList.toggle('open',open);$('#menuToggle').setAttribute('aria-expanded',String(open))});
function drawAbout(){ $('#disclaimer').textContent=data.about.disclaimer; }
function drawReferrals(){
 const nav=$('#referralStepNav'),panel=$('#referralStepPanel'),counter=$('#referralStepCounter'),fill=$('#referralProgressFill'),meter=$('.journey-progress-track'),previous=$('#referralPrev'),next=$('#referralNext');
 if(!nav||!panel||!data.referralSteps?.length)return;
 const steps=data.referralSteps;let active=0;
 const concise=[
  ["Ask what is affecting the person's care or wellbeing.","Listen without judgement and respect the person's priorities."],
  ["Check for immediate danger or serious health and safeguarding concerns.","Follow emergency and safeguarding procedures before continuing."],
  ["Use the decision guide or service directory to identify a suitable starting point.","Prioritise safety, health and basic needs when needs overlap."],
  ["Explain the referral and check which documents the agency requires.","Requirements vary. Do not promise eligibility."],
  ["With consent, help make direct contact or prepare a referral note.","Confirm contact details and protect confidentiality."],
  ["Record the referral and check whether the person received support, where appropriate.","Follow facility policy and use approved record systems."]
 ];
 const scenes=[
  {kind:'listening',image:'assets/referral-listening.webp',alt:'An older Jamaican woman sharing her concern with a community health worker who listens attentively',caption:'Begin by understanding what matters to the person.'},
  {kind:'safety',image:'assets/referral-safety.webp',alt:'A community health worker checks on a woman’s safety and wellbeing in a private, welcoming room',caption:'Check immediate safety and wellbeing first.'},
  {kind:'matching',image:'assets/referral-match.webp',alt:'A Jamaican community navigator and client compare support options and a parish map together',caption:'Choose a service that fits the person’s needs.'},
  {kind:'preparing',image:'assets/referral-preparing.webp',alt:'A Jamaican community worker helps a father and child organise papers together at a service desk',caption:'Prepare together, one step at a time.'},
  {kind:'handoff',image:'assets/referral-warmhandoff.webp',alt:'A Jamaican social worker and client make a supportive agency phone call together',caption:'Connect the person directly wherever possible.'},
  {kind:'followup',image:'assets/referral-followup.webp',alt:'A Jamaican support worker and senior client sharing a follow-up call and reviewing a checklist together',caption:'Keep the person involved in what happens next.'}
 ];
 // Six distinct professional outline icons supplement six unique photographic illustrations.
 const icons=[
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-5.5A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 8.5 4v5.6c0 5.3-3.5 8.4-8.5 10.4-5-2-8.5-5.1-8.5-10.4V6L12 2Z"/><path d="m8.5 12 2.3 2.3 4.8-4.8"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="10.2" cy="10.2" r="6.8"/><path d="m15.3 15.3 6 6M7.2 10.2h6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6m-6 4h6m-6 4h3"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 8 5-4 5 4 2 0 3-3 5 4-5 9-4-1-4 2-7-7V8Z"/><path d="m9 12 3 3m-1-5 5 5m-9-7 2 2"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="19" rx="2"/><path d="M8 7h8m-8 4h7m-7 4h5m1 3 2 2 4-4"/></svg>'
 ];
 function showStep(index){
  active=(index+steps.length)%steps.length;
  const [title,copy]=steps[active],scene=scenes[active];
  if(!scene)return;
  // Full exact wording is taken from the guide. Summaries and notes are the
  // already-approved text, not invented eligibility or referral requirements.
  panel.innerHTML='<article class="journey-feature-card rpx-feature" data-rpx-active-step="'+(active+1)+'">'+
   '<figure class="step-scene rpx-step-scene"><img src="'+scene.image+'" alt="'+esc(scene.alt)+'" loading="eager" decoding="async"><figcaption>'+esc(scene.caption)+'</figcaption></figure>'+
   '<div class="journey-feature-copy rpx-feature-copy">'+
   '<div class="journey-feature-meta rpx-step-meta"><span>STEP '+String(active+1).padStart(2,'0')+'</span><span>OF '+String(steps.length).padStart(2,'0')+'</span></div>'+
   '<h3 id="activeReferralStepTitle">'+esc(title)+'</h3>'+
   '<p class="rpx-step-lead">'+esc(concise[active]?.[0]||copy)+'</p>'+
   '<div class="step-source-note rpx-remember"><span class="rpx-remember-icon" aria-hidden="true">✦</span><div><strong>Remember</strong><p>'+esc(concise[active]?.[1]||'Confirm details with the agency.')+'</p></div></div>'+
   '<details class="p3-step-detail rpx-full-guide"><summary><span aria-hidden="true">▤</span> Full wording from the guide</summary><p>'+esc(copy)+'</p></details>'+
   '</div></article>';
  nav.innerHTML=steps.map((s,i)=>'<button type="button" class="journey-step-tab rpx-step-tab rpx-step-'+(i+1)+' '+(i===active?'is-current':'')+'" data-ref-step="'+i+'" aria-current="'+(i===active?'step':'false')+'" aria-controls="referralStepPanel" aria-label="Step '+(i+1)+': '+esc(s[0])+'"><span class="tab-number">'+(i+1)+'</span><span class="rpx-step-icon">'+icons[i]+'</span><span class="tab-title">'+esc(s[0])+'</span><span class="rpx-step-arrow" aria-hidden="true">↗</span></button>').join('');
  $$('.journey-step-tab',nav).forEach(button=>button.addEventListener('click',()=>showStep(Number(button.dataset.refStep))));
  if(counter)counter.textContent='STEP '+String(active+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');
  if(fill)fill.style.width=((active+1)/steps.length*100)+'%';
  if(meter)meter.setAttribute('aria-valuenow',String(active+1));
  if(previous)previous.disabled=active===0;
  if(next){next.innerHTML=active===steps.length-1?'<span>Start again</span> ↺':'<span>Next step</span> →';next.setAttribute('aria-label',active===steps.length-1?'Start the referral journey again':'Go to next referral step')}
 }
 if(previous)previous.addEventListener('click',()=>showStep(active-1));
 if(next)next.addEventListener('click',()=>showStep(active===steps.length-1?0:active+1));
 $$('[data-ref-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.refScroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})));
 $$('[data-ref-step-jump]').forEach(button=>button.addEventListener('click',()=>{showStep(Number(button.dataset.refStepJump));document.getElementById('referralJourney')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}));
 showStep(0);
}

function categoryOf(programme){const n=norm(programme);if(n==='path'||n==='local government assistance'||n==='nis')return 'Cash Assistance';if(n.includes('nhf')||n.includes('compassionate')||n.includes('diagnostic')||n.includes('chase'))return 'Health Support';if(n.includes('heart')||n.includes('skills'))return 'Skill Building';if(n.includes('housing')||n.includes('nht')||n.includes('nshp'))return 'Housing Support';if(n.includes('child protection')||n.includes('women')||n.includes('senior citizen'))return 'Family & Children Youth Support';if(n.includes('victim services')||n.includes('gender affairs'))return 'Justice & Safety Support';if(n.includes('ncda'))return 'Psychosocial Support';const m=data.categories.find(c=>norm(c.programme)===n);return m?.category||'Other support'}
function drawProgramFilters(){const cats=['All','Health Support','Cash Assistance','Skill Building','Housing Support','Family & Children Youth Support','Other'];$('#programmeFilters').innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" data-prog-filter="${esc(i===0?'all':c)}">${esc(i===0?'All programmes':c)}</button>`).join('');$$('[data-prog-filter]').forEach(b=>b.addEventListener('click',()=>{programFilter=b.dataset.progFilter;$$('[data-prog-filter]').forEach(x=>x.classList.toggle('active',x===b));renderProgrammes()}))}
function renderProgrammes(){const q=norm($('#programmeSearch').value);const list=data.programmes.filter(p=>(programFilter==='all'||categoryOf(p.name)===programFilter)&&(!q||norm(Object.values(p).join(' ')).includes(q)));$('#programmeCount').textContent=`${list.length} programme profiles · Draft content transcribed from the guide`;$('#programmeCards').innerHTML=list.length?list.map((p,i)=>`<article class="programme-card"><div class="card-top"><span class="card-icon">${['◉','✚','⌂','♡','↗','▤'][i%6]}</span><span class="tag">${esc(categoryOf(p.name))}</span></div><h3>${esc(p.name)}</h3><p>${esc(p.support)}</p><button class="card-action" data-open-program="${data.programmes.indexOf(p)}">View full profile →</button></article>`).join(''):'<div class="empty-state">No programme matches this search. Try a broader term.</div>';$$('[data-open-program]').forEach(b=>b.addEventListener('click',()=>openProgramme(Number(b.dataset.openProgram))))}
function openProgramme(i){const p=data.programmes[i];$('#modalEyebrow').textContent=categoryOf(p.name)+' · Draft profile';$('#modalTitle').textContent=p.name;$('#modalBody').innerHTML=[['Where to go',p.where],['What to bring',p.bring],['The process',p.process],['Type of support',p.support]].map(([h,v])=>`<section><h3>${h}</h3><p>${esc(v)}</p></section>`).join('')+'<div class="modal-draft">Draft details from the supplied November 2026 booklet. Confirm current requirements, benefits, locations, and eligibility directly with the responsible agency.</div>';$('#programmeModal').showModal()}
$('#modalClose').addEventListener('click',()=>$('#programmeModal').close());$('#programmeModal').addEventListener('click',e=>{if(e.target===$('#programmeModal'))$('#programmeModal').close()});$('#programmeSearch').addEventListener('input',renderProgrammes);
function drawCategoryFilters(){const cats=['All',...new Set(data.categories.map(c=>c.category))];$('#categoryFilters').innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" data-cat-filter="${esc(i===0?'all':c)}">${esc(i===0?'All categories':c)}</button>`).join('');$$('[data-cat-filter]').forEach(b=>b.addEventListener('click',()=>{categoryFilter=b.dataset.catFilter;$$('[data-cat-filter]').forEach(x=>x.classList.toggle('active',x===b));renderCategories()}))}
function renderCategories(){const q=norm($('#categorySearch').value);const list=data.categories.filter(c=>(categoryFilter==='all'||c.category===categoryFilter)&&(!q||norm(Object.values(c).join(' ')).includes(q)));$('#categoryCount').textContent=`${list.length} listings across ${new Set(list.map(c=>c.category)).size} categories · Source: supplied guide`;$('#categoryCards').innerHTML=list.length?list.map(c=>`<article class="category-card"><span class="tag">${esc(c.category)}</span><h3>${esc(c.programme)}</h3><p>${esc(c.benefits)}</p><span class="category-programme"><b>Guide names as target group:</b> ${esc(c.target)}</span></article>`).join(''):'<div class="empty-state">No category listing matches this search.</div>'}
$('#categorySearch').addEventListener('input',renderCategories);
let selectedDecisionSituation='';
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
const decisionIcons=[
 {match:/mental|substance|wellbeing/i,icon:'♡'},
 {match:/family|school|student|adolescent/i,icon:'⌂'},
 {match:/senior/i,icon:'✿'},
 {match:/training|employment|business|farming/i,icon:'↗'},
 {match:/disability/i,icon:'◎'},
 {match:/crisis|emergency|disaster/i,icon:'✳'},
 {match:/test|diagnostic|treatment/i,icon:'✚'},
 {match:/safety|abuse|violence/i,icon:'⌑'}
];
function decisionLabel(s){return decisionLabels[s]||s.replace('Chidren','Children')}
function decisionIcon(s){return decisionIcons.find(x=>x.match.test(decisionLabel(s)))?.icon||'✦'}
function decisionMatchText(d){return norm(Object.values(d).join(' '))}
function decisionServiceMatches(d){
 const query=String(d.options||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const matches=[];
 serviceCatalog.forEach((s,index)=>{
  const names=[s.name,...(s.aliases||[]),...(s.categoryRows||[]).map(r=>r.programme)];
  if(names.some(name=>{
   const term=String(name).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
   return term.length>=4&&query.includes(term);
  }))matches.push(index);
 });
 const hints=[
  [/mental health|suicide|substance misuse|substance use|ncda/i,['NCDA Support']],
  [/rehabilitation/i,['Rehabilitation Grants']],
  [/stw|ojt|sip|steps to work/i,['Steps to Work','Social Intervention Programme (SIP)']],
  [/school feeding|tertiary grants/i,['School Feeding','PATH']],
  [/nhf card|low.cost medicine|drug for elderly/i,['NHF','Jamaica Drug for Elderly Programme']],
  [/social pension/i,['Social Pension']],
  [/nis|nis pension/i,['NIS']],
  [/senior citizen|meals on wheels|infirmary|institutional care/i,['Senior Citizen Services / Meals on Wheels','Local Government Assistance','Poor Relief']],
  [/heart\s*\/?\s*nsta|skills training/i,['HEART / NSTA']],
  [/economic empowerment/i,['Economic Empowerment Grant']],
  [/accessibility modification|home modification|nht/i,['National Housing Trust (NHT)']],
  [/small business|jbdc|mida|rada grants|farming support/i,['Grants (RADA / JBDC)']],
  [/diagnostic|ct scans|mri/i,['RHA Diagnostic Support']],
  [/compassionate fund|chase medical/i,['CHASE / Compassionate Medical Assistance','MOHW Compassionate Fund Programme']],
  [/victim services|domestic violence|bga|no.abuse|shelter|gbv/i,['Bureau of Gender Affairs Services','Victim Services Branch']],
  [/child protection|vulnerable children/i,['Child Protection and Family Services Agency (CPFSA)']],
  [/disaster|emergency poor relief|rehabilitation \/ compassionate/i,['MLSS Emergency Assistance','Local Government Assistance']],
  [/women.s centre|adolescent mother/i,["Women's Centre Programme for Adolescent Mothers"]]
 ];
 const addByName=name=>{const normalized=name.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();serviceCatalog.forEach((s,index)=>{if(s.name.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()===normalized&&!matches.includes(index))matches.push(index)})};
 hints.forEach(([pattern,names])=>{if(pattern.test(d.options||''))names.forEach(addByName)});
 return matches.slice(0,3);
}
function renderDecision(){
 const input=$('#decisionSearch'),q=norm(input?.value).trim();
 const groups=[...new Set(data.decision.map(d=>d.situation))].map(situation=>({situation,items:data.decision.filter(d=>d.situation===situation)}));
 const visibleGroups=groups.filter(g=>!q||g.items.some(d=>decisionMatchText(d).includes(q))||norm(g.situation).includes(q));
 $('#decisionTally').textContent=q?visibleGroups.length+' matching '+(visibleGroups.length===1?'situation':'situations')+' · search also checks options and agencies':groups.length+' situations · '+data.decision.length+' guide options';
 $('#decisionSituations').innerHTML=visibleGroups.length?visibleGroups.map((g,i)=>'<button type="button" class="decision-situation-card tone-'+(i%4)+' '+(selectedDecisionSituation===g.situation?'active':'')+'" data-decision-situation="'+esc(g.situation)+'" aria-pressed="'+(selectedDecisionSituation===g.situation)+'"><span class="decision-situation-icon">'+decisionIcon(g.situation)+'</span><span class="decision-situation-copy"><b>'+esc(decisionLabel(g.situation))+'</b><small>'+g.items.length+' '+(g.items.length===1?'guide option':'guide options')+'</small></span><span class="decision-situation-arrow">→</span></button>').join(''):'<div class="empty-state">No situation matches that search. Try a programme, agency, or a broader word.</div>';
 let routes=[];
 if(selectedDecisionSituation){routes=data.decision.filter(d=>d.situation===selectedDecisionSituation&&(!q||decisionMatchText(d).includes(q)))}
 else if(q){routes=data.decision.filter(d=>decisionMatchText(d).includes(q))}
 const heading=$('#decisionResultsHeading');
 if(!routes.length){
  if(selectedDecisionSituation&&q)heading.innerHTML='<div><div class="eyebrow"><i></i> Refine your search</div><h2>No options match “'+esc(input.value.trim())+'” in '+esc(decisionLabel(selectedDecisionSituation))+'.</h2><p>Clear the search to see every option for this situation, or choose another situation above.</p></div><button type="button" class="decision-clear" data-decision-clear-search>Clear search</button>';
  else if(q)heading.innerHTML='<div><div class="eyebrow"><i></i> Search results</div><h2>Guide options matching “'+esc(input.value.trim())+'”</h2><p>Choose a situation above to narrow these results.</p></div>';
  else heading.innerHTML='<div><div class="eyebrow"><i></i> Your next step</div><h2>Choose a situation above.</h2></div>';
  $('#decisionCards').innerHTML='';
  return;
 }
 heading.innerHTML='<div><div class="eyebrow"><i></i> '+(selectedDecisionSituation?'Possible routes for this situation':'Search results from the guide')+'</div><h2>'+(selectedDecisionSituation?esc(decisionLabel(selectedDecisionSituation)):'Matching guide options')+'</h2><p>'+routes.length+' '+(routes.length===1?'option':'options')+' listed in the guide. Select an option to explore service details.</p></div><button type="button" class="decision-clear" data-decision-clear-selection>See all situations</button>';
 $('#decisionCards').innerHTML=routes.map((d,i)=>{
   const related=decisionServiceMatches(d);
   const actions=related.length?related.map(index=>'<button type="button" class="decision-profile-link" data-decision-service="'+index+'">View '+esc(serviceCatalog[index].name)+' details <span>↗</span></button>').join(''):'';
   return '<article class="decision-card decision-route-card tone-'+(i%4)+'"><div class="decision-route-icon">'+decisionIcon(d.situation)+'</div><div class="decision-route-copy"><span class="decision-route-label">OPTION '+String(i+1).padStart(2,'0')+'</span><h3>'+esc(d.options)+'</h3><div class="provider"><b>Named provider</b><span>'+esc(d.provider)+'</span></div><div class="decision-card-actions">'+actions+'<button type="button" class="decision-directory-link" data-decision-directory="'+esc(d.provider)+'">Browse agency listings <span>→</span></button></div></div></article>';
 }).join('');
}
$('#decisionSearch').addEventListener('input',renderDecision);
$('#decisionSituations').addEventListener('click',e=>{const b=e.target.closest('[data-decision-situation]');if(!b)return;selectedDecisionSituation=b.dataset.decisionSituation;renderDecision();$('#decisionResultsHeading').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});
$('#decisionReset').addEventListener('click',()=>{selectedDecisionSituation='';$('#decisionSearch').value='';renderDecision()});
$('#decisionResultsHeading').addEventListener('click',e=>{if(e.target.closest('[data-decision-clear-selection]')){selectedDecisionSituation='';renderDecision()}else if(e.target.closest('[data-decision-clear-search]')){$('#decisionSearch').value='';renderDecision()}});
$('#decisionCards').addEventListener('click',e=>{
 const profile=e.target.closest('[data-decision-service]');
 if(profile){openService(Number(profile.dataset.decisionService));return}
 const directory=e.target.closest('[data-decision-directory]');
 if(directory){
  showView('services');selectedParish='ALL';mapFilter='all';$('#parishFilter').value='ALL';$('#serviceSearch').value=directory.dataset.decisionDirectory;
  $$('[data-map-filter]').forEach(b=>b.classList.toggle('active',b.dataset.mapFilter==='all'));
  $$('[data-parish]').forEach(b=>b.classList.remove('active'));renderMapResults();
 }
});
function renderContacts(){const q=norm($('#contactSearch').value);const list=data.contacts.filter(c=>!q||norm(c.agency+' '+c.details).includes(q));$('#contactCards').innerHTML=list.length?list.map(c=>{const meta=metadataForContact(c);return `<article class="contact-card"><div class="card-top"><span class="service-logo">${logoMarkup({name:c.agency,agency:c.agency,meta:{}})}</span><span class="tag">Agency contact</span></div><h3>${esc(c.agency)}</h3><p class="contact-info">${esc(c.details)}</p>${socialLinksMarkup(meta.socialLinks)}<span class="verify-label">Copied from draft · Verify before use</span></article>`}).join(''):'<div class="empty-state">No agency matches this search.</div>';$('#hotlineList').innerHTML=`<div class="hotline-text">${esc(data.hotlines)}</div>`;$('#documentCards').innerHTML=data.documents.map(d=>`<article class="document-card"><h3>${esc(d.document)}</h3><dl><div><dt>Where to apply</dt><dd>${esc(d.where)}</dd></div><div><dt>Requirements</dt><dd>${esc(d.requirements)}</dd></div><div><dt>Process</dt><dd>${esc(d.process)}</dd></div><div><dt>Cost stated in booklet</dt><dd>${esc(d.cost)}</dd></div></dl><span class="verify-label">Draft · confirm current fees and requirements</span></article>`).join('')}
$('#contactSearch').addEventListener('input',renderContacts);
function serviceKey(value){
  const key=norm(value).replace(/[^a-z0-9]/g,'');
  const aliases={
    poorrelief:'localgovernmentassistance',
    nationalhealthfundcard:'nhf',
    compassionatefundprogramme:'mohwcompassionatefundprogramme',
    chasemedicalassistance:'chasecompassionatemedicalassistance',
    heartnstatrust:'heartnsta',
    nhthomegrant:'nationalhousingtrustnht',
    ncdacounsellingandtreatmentsupport:'ncdasupport',
    nationalcouncilforseniorcitizensmealsonwheels:'seniorcitizenservicesmealsonwheels',
    bureauofgenderaffairs:'bureauofgenderaffairsservices'
  };
  return aliases[key]||key;
}
function metadataFor(service){
  const match=Object.entries(data.serviceMetadata||{}).find(([name])=>serviceKey(name)===serviceKey(service.name));
  return match?.[1]||{};
}
function contactsFor(service,meta){
  if(service.contactOnly&&service.contact)return [service.contact];
  const keys=(meta.contactAgencies||[]).map(norm);
  return data.contacts.filter(c=>keys.some(k=>norm(c.agency).includes(k)||k.includes(norm(c.agency))));
}
function buildServiceCatalog(){
  const records=new Map();
  const add=(record)=>{const key=serviceKey(record.name);let found=records.get(key);if(!found){found={...record,categories:[],categoryRows:[],aliases:[],contacts:[]};records.set(key,found)}else if(record.name!==found.name&&!found.aliases.includes(record.name))found.aliases.push(record.name);return found};
  data.programmes.forEach(p=>add({...p,kind:'programme'}));
  data.categories.forEach(row=>{const service=add({name:row.programme,support:row.benefits,where:'',bring:'',process:'',kind:'category'});service.categoryRows.push(row);if(row.programme!==service.name&&!service.aliases.includes(row.programme))service.aliases.push(row.programme)});
  let services=[...records.values()];
  services.forEach(s=>{
    const meta=metadataFor(s);
    s.meta=meta;
    s.categories=[...new Set(s.categoryRows.map(r=>r.category))];
    if(!s.categories.length)s.categories=[categoryOf(s.name)];
    s.contacts=contactsFor(s,meta);
    s.agency=meta.agency||s.contacts.map(c=>c.agency).join(' · ')||'Agency not specified in the guide';
  });
  data.contacts.forEach(contact=>{
    const linked=services.some(s=>s.contacts.some(c=>c.agency===contact.agency));
    if(!linked)services.push({name:contact.agency,support:'Agency contact listing from the guide. Contact the agency to confirm which programme or service fits your situation.',where:'See the agency contact information below.',bring:'Not specified for this agency listing.',process:'Contact the agency to ask about the service, eligibility, and current application or referral steps.',kind:'agency',contactOnly:true,contact,categories:['Agency contacts'],categoryRows:[],aliases:[],contacts:[contact],agency:contact.agency,meta:{}});
  });
  return services;
}
function serviceLogo(service){
  if(service.meta?.logoUrl)return {url:service.meta.logoUrl,source:service.meta.logoSourceUrl||service.meta.officialUrl||'',alt:service.meta.agency||service.name};
  const n=norm(service.name+' '+service.agency);
  const registry=data.logoRegistry||[];
  if(serviceKey(service.name)===serviceKey('Grants (RADA / JBDC)')){
    const shared=registry.find(item=>item.id==='rada-jbdc');
    if(shared)return {logos:shared.logos||null,url:shared.logoUrl||'',source:shared.logoSourceUrl||'',alt:shared.alt||service.name};
  }
  const match=registry
    .map(item=>({item,score:Math.max(0,...(item.match||[]).filter(term=>n.includes(norm(term))).map(term=>norm(term).length))}))
    .filter(entry=>entry.score>0)
    .sort((a,b)=>b.score-a.score)[0]?.item;
  if(!match)return null;
  return {logos:match.logos||null,url:match.logoUrl||'',source:match.logoSourceUrl||'',alt:match.alt||service.agency||service.name};
}
function logoMarkup(service){
  const logo=serviceLogo(service), known={'local government assistance':'BOS','grants (rada / jbdc)':'RADA','new social housing programme (nshp)':'NSHP','mohw compassionate fund programme':'MOHW','rha diagnostic support':'RHA','jamaican foundation for lifelong learning':'JFLL'};
  const words=service.name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const initials=known[norm(service.name)]||words.slice(0,2).map(w=>w.length<=5&&w===w.toUpperCase()?w:w[0].toUpperCase()).join('').slice(0,5)||'GOJ';
  const fallback='<span class="service-logo-fallback" hidden aria-label="'+esc(service.agency)+'">'+esc(initials)+'</span>';
  if(!logo)return '<span class="service-logo-fallback" aria-label="'+esc(service.agency)+'">'+esc(initials)+'</span>';
  const image=(item)=>'<img class="service-logo-image" src="'+esc(item.url||item.logoUrl||'')+'" alt="'+esc(item.alt||logo.alt||service.agency)+' logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;const p=this.closest(\'.service-logo\');if(p&&!p.querySelector(\'.service-logo-image:not([hidden])\')){const f=p.querySelector(\'.service-logo-fallback\');if(f)f.hidden=false}">';
  const imgs=logo.logos?.length?'<span class="service-logo-cluster">'+logo.logos.map(image).join('')+'</span>':image({url:logo.url,alt:logo.alt});
  return imgs+fallback;
}
function mapsSearchUrl(query){
  const location=selectedParish==='ALL'?'Jamaica':selectedParish+', Jamaica';
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((query||'social protection agency')+', '+location);
}
function contactMarkup(contact){
  const text=esc(contact.details||'Contact details are not listed in the guide.');
  const emails=[];
  let linked=text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,email=>{const token='EMAILTOKEN'+emails.length+'TOKEN';emails.push(email);return token});
  linked=linked.replace(/(?:https?:\/\/)?(?:www\.)?[A-Z0-9.-]+\.(?:gov\.jm|org\.jm|com\.jm|gov|org|com)(?:\/[A-Z0-9._~:/?#\[\]@!$&'()*+,;=%-]*)?/gi,url=>{const href=url.startsWith('http')?url:'https://'+url;return '<a href="'+href+'" target="_blank" rel="noopener noreferrer">'+url+'</a>'});
  linked=linked.replace(/(?:\+?1[\s.-]?)?\(?876\)?[\s.-]?\d{3}[\s.-]?\d{4}(?:-\d{1,2})?/g,phone=>'<a href="tel:'+phone.replace(/[^\d+]/g,'')+'">'+phone+'</a>');
  emails.forEach((email,i)=>{linked=linked.replace('EMAILTOKEN'+i+'TOKEN','<a href="mailto:'+email+'">'+email+'</a>')});
  return '<p class="linked-contact-details">'+linked.replace(/;\s*/g,'<br>')+'</p>';
}
function socialLinksMarkup(links,label='Ministry social pages'){
  if(!Array.isArray(links)||!links.length)return '';
  return '<div class="social-link-list" aria-label="'+esc(label)+'">'+links.map(item=>'<a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.label)+' ↗</a>').join('')+'</div>';
}
function metadataForContact(contact){
  const key=serviceKey(contact.agency);
  return Object.values(data.serviceMetadata||{}).find(meta=>(meta.contactAgencies||[]).some(name=>{
    const candidate=serviceKey(name);
    return key===candidate||key.includes(candidate)||candidate.includes(key);
  }))||{};
}
function renderMap(){
  serviceCatalog=buildServiceCatalog();
  const pf=$('#parishFilter');
  pf.innerHTML='<option value="ALL">All parishes</option>'+PARISHES.map(p=>'<option value="'+esc(p.name)+'">'+esc(p.name)+'</option>').join('');
  const modes=['All support','Health','Cash & benefits','Housing','Skills & education','Family & youth','Wellbeing & safety','Community & other','Agency contacts'];
  $('#serviceFilters').innerHTML=modes.map((name,i)=>'<button class="chip '+(i===0?'active':'')+'" data-map-filter="'+esc(i===0?'all':name)+'" type="button">'+esc(name)+'</button>').join('');
  $$('[data-map-filter]').forEach(b=>b.addEventListener('click',()=>{mapFilter=b.dataset.mapFilter;$$('[data-map-filter]').forEach(x=>x.classList.toggle('active',x===b));renderMapResults()}));
  $('#parishPins').innerHTML=PARISHES.map((p,i)=>'<button class="parish-pin '+(selectedParish===p.name?'active':'')+'" data-parish="'+esc(p.name)+'" style="left:'+p.x+'%;top:'+p.y+'%;animation-delay:'+(i*24)+'ms" type="button" title="Select '+esc(p.name)+'" aria-label="Select '+esc(p.name)+' parish">'+esc(p.short)+'</button>').join('');
  $$('[data-parish]').forEach(b=>b.addEventListener('click',()=>selectParish(b.dataset.parish)));
  pf.addEventListener('change',()=>selectParish(pf.value));
  $('#serviceSearch').addEventListener('input',renderMapResults);
  $('#mapCaveat').textContent=data.mapParishCaveat;
  $('#directoryHotlines').innerHTML='<h3>Quick contacts listed in the guide</h3><div class="quick-contact-grid">'+(data.quickContacts||[]).map(c=>'<div class="quick-contact"><b>'+esc(c.label)+'</b><span>'+esc(c.details)+'</span></div>').join('')+'</div>';
  $('#serviceResults').addEventListener('click',e=>{const b=e.target.closest('[data-service-open]');if(b)openService(Number(b.dataset.serviceOpen))});
  $('#serviceModalBody').addEventListener('click',e=>{const button=e.target.closest('[data-gia-referral]');if(!button)return;$('#serviceModal').close();if(window.MOHWGIA?.openReferral)window.MOHWGIA.openReferral(button.dataset.giaReferral);else alert('GIA is unavailable. Please reload this page.');});
  $('#serviceModalClose').addEventListener('click',()=>$('#serviceModal').close());
  $('#serviceModal').addEventListener('click',e=>{if(e.target===$('#serviceModal'))$('#serviceModal').close()});
  $('#showAgencyContacts').addEventListener('click',()=>{mapFilter='Agency contacts';$$('[data-map-filter]').forEach(x=>x.classList.toggle('active',x.dataset.mapFilter==='Agency contacts'));renderMapResults();$('#serviceResults').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});
  renderMapResults();
}
function selectParish(parish){
  selectedParish=parish;$('#parishFilter').value=parish;
  if(parish!=='ALL')window.MOHWGIA?.setParish?.(parish);
  $$('[data-parish]').forEach(b=>b.classList.toggle('active',b.dataset.parish===parish));
  renderMapResults();
}
function renderMapResults(){
  if(!serviceCatalog.length)return;
  const q=norm($('#serviceSearch').value).trim();
  const list=serviceCatalog.filter(s=>{
    const cats=s.categories||[];
    const categoryGroups={'Health':['Health Support'],'Cash & benefits':['Cash Assistance','Empowerment'],'Housing':['Housing Support'],'Skills & education':['Education & Youth','Skill Building'],'Family & youth':['Family & Children Youth Support','Senior Support','Child Protection and Family Support'],'Wellbeing & safety':['Psychosocial Support','Justice & Safety Support','Gender-Based Violence & Safety','Disaster & Emergency Relief'],'Community & other':['Other support']};
    const categoryOk=mapFilter==='all'||(mapFilter==='Agency contacts'?s.contacts.length>0:(categoryGroups[mapFilter]||[mapFilter]).some(c=>cats.includes(c)));
    const searchable=[s.name,s.support,s.where,s.bring,s.process,s.agency,...s.aliases,...cats,...s.categoryRows.flatMap(r=>[r.programme,r.benefits,r.target]),...s.contacts.flatMap(c=>[c.agency,c.details])].join(' ');
    return categoryOk&&(!q||norm(searchable).includes(q));
  });
  const status=selectedParish==='ALL'?'Browse national and parish-level routes in the guide.':selectedParish+' selected · this filters the search context but does not verify a local office or service location.';
  $('#mapStatus').textContent=status;
  $('#serviceTitle').textContent=selectedParish==='ALL'?'Services, programmes and agency contacts':selectedParish+' · services and referral routes';
  $('#serviceCount').textContent=list.length+' matching '+(list.length===1?'result':'results');
  $('#serviceResults').innerHTML=list.length?list.map((s,i)=>{
    const index=serviceCatalog.indexOf(s),cats=(s.categories||[]).slice(0,2).map(c=>'<span class="service-tag">'+esc(c)+'</span>').join('');
    return '<article class="service-card"><div class="service-card-top"><div class="service-logo">'+logoMarkup(s)+'</div><div class="service-labels">'+cats+(s.kind==='agency'?'<span class="service-tag agency-tag">Agency contact</span>':'')+'</div></div><h3>'+esc(s.name)+'</h3><small class="service-agency-line">'+esc(s.agency)+'</small><div class="service-card-actions"><button class="service-open" type="button" data-service-open="'+index+'">View service details <span>→</span></button><a href="'+esc(mapsSearchUrl(s.agency==='Agency not specified in the guide'?s.name:s.agency))+'" target="_blank" rel="noopener noreferrer">Google Maps ↗</a></div></article>';
  }).join(''):'<div class="empty-state">No services match that search. Try a broader need, programme name, agency, or parish.</div>';
}
function openService(index){
  const s=serviceCatalog[index];if(!s)return;
  const modal=$('#serviceModal'),logo=serviceLogo(s),meta=s.meta||{};
  $('#serviceModalEyebrow').textContent=(s.kind==='agency'?'Agency contact':'Service profile')+' · '+(s.categories||[]).join(' · ');
  $('#serviceModalTitle').textContent=s.name;
  const parts=[];
  parts.push('<div class="service-profile-intro"><div class="service-logo profile-logo">'+logoMarkup(s)+'</div><div><p>'+esc(s.support||'Contact this agency to ask which service fits your situation.')+'</p><small>'+esc(s.agency)+'</small></div></div>');
  if(s.categoryRows.length){parts.push('<section><h3>Support and intended groups</h3>'+s.categoryRows.map(r=>'<div class="profile-fact"><b>'+esc(r.programme)+' · '+esc(r.category)+'</b><p>'+esc(r.benefits)+'</p><p><strong>Guide-listed target group:</strong> '+esc(r.target)+'</p></div>').join('')+'</section>')}
  parts.push('<section class="profile-grid"><div><h3>Where to start</h3><p>'+esc(s.where||'The guide does not specify a starting location for this listing. Confirm the correct office with the responsible agency.')+'</p></div><div><h3>What to bring</h3><p>'+esc(s.bring||'The guide does not specify documents for this listing. Confirm requirements with the responsible agency.')+'</p></div><div><h3>Referral or application steps</h3><p>'+esc(s.process||'The guide does not list application steps for this entry. Contact the agency to confirm the current process.')+'</p></div></section>');
  const contacts=s.contacts||[];
  if(contacts.length){parts.push('<section><h3>Agency contacts from the guide</h3><div class="profile-contact-grid">'+contacts.map(c=>'<article class="profile-contact"><b>'+esc(c.agency)+'</b>'+contactMarkup(c)+'<a class="map-link" href="'+esc(mapsSearchUrl(c.agency))+'" target="_blank" rel="noopener noreferrer">Find this agency on Google Maps ↗</a><small>Contact details transcribed from the guide; confirm they are current.</small></article>').join('')+'</div></section>')}
  else parts.push('<section><h3>Agency contact</h3><p>No matching agency contact is listed in the guide for this entry. Use the official agency link or Google Maps search to confirm how to reach the service.</p></section>');
  const links=[];
  links.push('<button class="btn primary" type="button" data-gia-referral="'+esc(s.name)+'">Prepare referral with GIA ↗</button>');
  if(meta.officialUrl)links.push('<a class="btn ghost" href="'+esc(meta.officialUrl)+'" target="_blank" rel="noopener noreferrer">Official agency website ↗</a>');
  if(meta.serviceUrl)links.push('<a class="btn ghost" href="'+esc(meta.serviceUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(meta.serviceLinkLabel||'Related official page')+' ↗</a>');
  links.push('<a class="btn ghost" href="'+esc(mapsSearchUrl(s.agency==='Agency not specified in the guide'?s.name:s.agency))+'" target="_blank" rel="noopener noreferrer">Open Google Maps directory ↗</a>');
  if(logo?.source)links.push('<a class="source-link" href="'+esc(logo.source)+'" target="_blank" rel="noopener noreferrer">Logo source ↗</a>');
  if(meta.socialLinks?.length)parts.push('<section class="profile-socials"><h3>Ministry social pages</h3><p>'+esc(meta.socialNote||'Official Ministry social channels.')+'</p>'+socialLinksMarkup(meta.socialLinks)+'</section>');
  parts.push('<div class="profile-actions">'+links.join('')+'</div><p class="profile-note">The guide may not contain current eligibility, fees, hours, or availability. Confirm these directly with the responsible agency.</p>');
  $('#serviceModalBody').innerHTML=parts.join('');
  modal.showModal();
}

async function init(){try{const r=await fetch('data/guide-content.json?v=directory-8', {cache:'no-store'});if(!r.ok)throw Error('Content unavailable');data=await r.json();drawAbout();drawReferrals();drawProgramFilters();renderProgrammes();drawCategoryFilters();renderCategories();renderDecision();renderContacts();renderMap();renderDecision();let initial=location.hash.slice(1);if(['programmes','categories','contacts'].includes(initial))initial='services';showView(NAV.includes(initial)?initial:'about')}catch(e){console.error(e);$('#main').innerHTML='<div class="wrap page-content"><div class="empty-state"><b>Guide content could not be loaded.</b> Refresh the page or contact the site owner.</div></div>'}}
init();
