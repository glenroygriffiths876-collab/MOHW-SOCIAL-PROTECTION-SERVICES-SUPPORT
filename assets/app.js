const PARISHES=[
 {name:'Hanover',short:'HAN',x:11.5,y:34},{name:'Westmoreland',short:'WML',x:13,y:55},{name:'St. James',short:'STJ',x:25.5,y:31},{name:'Trelawny',short:'TRE',x:37,y:29},{name:'St. Elizabeth',short:'STE',x:31,y:65},{name:'Manchester',short:'MAN',x:47,y:64},{name:'Clarendon',short:'CLA',x:58.5,y:63},{name:'St. Ann',short:'ANN',x:54,y:31},{name:'St. Catherine',short:'STC',x:68,y:55},{name:'St. Andrew',short:'STA',x:73,y:60},{name:'Kingston',short:'KIN',x:77,y:68},{name:'St. Mary',short:'STM',x:69,y:33},{name:'Portland',short:'POR',x:84,y:40},{name:'St. Thomas',short:'STT',x:87,y:64}
];
const NAV=['about','referrals','decision','services'];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
let data=null, selectedParish='ALL', programFilter='all', categoryFilter='all', mapFilter='all', serviceCatalog=[];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x??'').toLowerCase();
function showView(id){if(!NAV.includes(id))return;$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${id}`));$$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));history.replaceState(null,'',`#${id}`);window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')}
$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.nav)));
$$('[data-card-nav]').forEach(c=>{const go=()=>showView(c.dataset.cardNav);c.addEventListener('click',go);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
$('#menuToggle').addEventListener('click',()=>{const n=$('#mainNav'),open=!n.classList.contains('open');n.classList.toggle('open',open);$('#menuToggle').setAttribute('aria-expanded',String(open))});
function drawAbout(){ $('#aboutIntro').textContent=data.about.intro;$('#aboutWhy').textContent=data.about.why;$('#aboutAudience').textContent=data.about.audience;$('#disclaimer').textContent=data.about.disclaimer;$('#howCards').innerHTML=data.about.how.map((t,i)=>`<article class="home-card"><span class="mini-icon">${['◎','▤','⌖','↗'][i]}</span><h3>${['Understand the overview','Compare service options','Choose a possible pathway','Confirm current details'][i]}</h3><p>${esc(t)}</p></article>`).join('')}
function drawReferrals(){ $('#referralSteps').innerHTML=data.referralSteps.map((s,i)=>`<article class="step-card"><span class="step-num">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div></article>`).join('') }
function categoryOf(programme){const n=norm(programme);if(n==='path'||n==='local government assistance'||n==='nis')return 'Cash Assistance';if(n.includes('nhf')||n.includes('compassionate')||n.includes('diagnostic')||n.includes('chase'))return 'Health Support';if(n.includes('heart')||n.includes('skills'))return 'Skill Building';if(n.includes('housing')||n.includes('nht')||n.includes('nshp'))return 'Housing Support';if(n.includes('child protection')||n.includes('women')||n.includes('senior citizen'))return 'Family & Children Youth Support';if(n.includes('victim services')||n.includes('gender affairs'))return 'Justice & Safety Support';if(n.includes('ncda'))return 'Psychosocial Support';const m=data.categories.find(c=>norm(c.programme)===n);return m?.category||'Other support'}
function drawProgramFilters(){const cats=['All','Health Support','Cash Assistance','Skill Building','Housing Support','Family & Children Youth Support','Other'];$('#programmeFilters').innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" data-prog-filter="${esc(i===0?'all':c)}">${esc(i===0?'All programmes':c)}</button>`).join('');$$('[data-prog-filter]').forEach(b=>b.addEventListener('click',()=>{programFilter=b.dataset.progFilter;$$('[data-prog-filter]').forEach(x=>x.classList.toggle('active',x===b));renderProgrammes()}))}
function renderProgrammes(){const q=norm($('#programmeSearch').value);const list=data.programmes.filter(p=>(programFilter==='all'||categoryOf(p.name)===programFilter)&&(!q||norm(Object.values(p).join(' ')).includes(q)));$('#programmeCount').textContent=`${list.length} programme profiles · Draft content transcribed from the guide`;$('#programmeCards').innerHTML=list.length?list.map((p,i)=>`<article class="programme-card"><div class="card-top"><span class="card-icon">${['◉','✚','⌂','♡','↗','▤'][i%6]}</span><span class="tag">${esc(categoryOf(p.name))}</span></div><h3>${esc(p.name)}</h3><p>${esc(p.support)}</p><button class="card-action" data-open-program="${data.programmes.indexOf(p)}">View full profile →</button></article>`).join(''):'<div class="empty-state">No programme matches this search. Try a broader term.</div>';$$('[data-open-program]').forEach(b=>b.addEventListener('click',()=>openProgramme(Number(b.dataset.openProgram))))}
function openProgramme(i){const p=data.programmes[i];$('#modalEyebrow').textContent=categoryOf(p.name)+' · Draft profile';$('#modalTitle').textContent=p.name;$('#modalBody').innerHTML=[['Where to go',p.where],['What to bring',p.bring],['The process',p.process],['Type of support',p.support]].map(([h,v])=>`<section><h3>${h}</h3><p>${esc(v)}</p></section>`).join('')+'<div class="modal-draft">Draft details from the supplied November 2026 booklet. Confirm current requirements, benefits, locations, and eligibility directly with the responsible agency.</div>';$('#programmeModal').showModal()}
$('#modalClose').addEventListener('click',()=>$('#programmeModal').close());$('#programmeModal').addEventListener('click',e=>{if(e.target===$('#programmeModal'))$('#programmeModal').close()});$('#programmeSearch').addEventListener('input',renderProgrammes);
function drawCategoryFilters(){const cats=['All',...new Set(data.categories.map(c=>c.category))];$('#categoryFilters').innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" data-cat-filter="${esc(i===0?'all':c)}">${esc(i===0?'All categories':c)}</button>`).join('');$$('[data-cat-filter]').forEach(b=>b.addEventListener('click',()=>{categoryFilter=b.dataset.catFilter;$$('[data-cat-filter]').forEach(x=>x.classList.toggle('active',x===b));renderCategories()}))}
function renderCategories(){const q=norm($('#categorySearch').value);const list=data.categories.filter(c=>(categoryFilter==='all'||c.category===categoryFilter)&&(!q||norm(Object.values(c).join(' ')).includes(q)));$('#categoryCount').textContent=`${list.length} listings across ${new Set(list.map(c=>c.category)).size} categories · Source: supplied guide`;$('#categoryCards').innerHTML=list.length?list.map(c=>`<article class="category-card"><span class="tag">${esc(c.category)}</span><h3>${esc(c.programme)}</h3><p>${esc(c.benefits)}</p><span class="category-programme"><b>Guide names as target group:</b> ${esc(c.target)}</span></article>`).join(''):'<div class="empty-state">No category listing matches this search.</div>'}
$('#categorySearch').addEventListener('input',renderCategories);
function renderDecision(){const q=norm($('#decisionSearch').value);const list=data.decision.filter(d=>!q||norm(Object.values(d).join(' ')).includes(q));$('#decisionCards').innerHTML=list.length?list.map(d=>`<article class="decision-card"><h3>${esc(d.situation)}</h3><p>${esc(d.options)}</p><div class="provider"><b>Named provider:</b> ${esc(d.provider)}</div></article>`).join(''):'<div class="empty-state">No pathway matches this search.</div>'}
$('#decisionSearch').addEventListener('input',renderDecision);
function renderContacts(){const q=norm($('#contactSearch').value);const list=data.contacts.filter(c=>!q||norm(c.agency+' '+c.details).includes(q));$('#contactCards').innerHTML=list.length?list.map(c=>`<article class="contact-card"><div class="card-top"><span class="service-logo">${logoMarkup({name:c.agency,agency:c.agency,meta:{}})}</span><span class="tag">Agency contact</span></div><h3>${esc(c.agency)}</h3><p class="contact-info">${esc(c.details)}</p><span class="verify-label">Copied from draft · Verify before use</span></article>`).join(''):'<div class="empty-state">No agency matches this search.</div>';$('#hotlineList').innerHTML=`<div class="hotline-text">${esc(data.hotlines)}</div>`;$('#documentCards').innerHTML=data.documents.map(d=>`<article class="document-card"><h3>${esc(d.document)}</h3><dl><div><dt>Where to apply</dt><dd>${esc(d.where)}</dd></div><div><dt>Requirements</dt><dd>${esc(d.requirements)}</dd></div><div><dt>Process</dt><dd>${esc(d.process)}</dd></div><div><dt>Cost stated in booklet</dt><dd>${esc(d.cost)}</dd></div></dl><span class="verify-label">Draft · confirm current fees and requirements</span></article>`).join('')}
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
  $('#serviceModalClose').addEventListener('click',()=>$('#serviceModal').close());
  $('#serviceModal').addEventListener('click',e=>{if(e.target===$('#serviceModal'))$('#serviceModal').close()});
  $('#showAgencyContacts').addEventListener('click',()=>{mapFilter='Agency contacts';$$('[data-map-filter]').forEach(x=>x.classList.toggle('active',x.dataset.mapFilter==='Agency contacts'));renderMapResults();$('#serviceResults').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});
  renderMapResults();
}
function selectParish(parish){
  selectedParish=parish;$('#parishFilter').value=parish;
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
    return '<article class="service-card"><div class="service-card-top"><div class="service-logo">'+logoMarkup(s)+'</div><div class="service-labels">'+cats+(s.kind==='agency'?'<span class="service-tag agency-tag">Agency contact</span>':'')+'</div></div><h3>'+esc(s.name)+'</h3><p>'+esc(s.support||'Agency contact information and service routes listed in the guide.')+'</p><small class="service-agency-line">'+esc(s.agency)+'</small><div class="service-card-actions"><button class="service-open" type="button" data-service-open="'+index+'">View service details <span>→</span></button><a href="'+esc(mapsSearchUrl(s.agency==='Agency not specified in the guide'?s.name:s.agency))+'" target="_blank" rel="noopener noreferrer">Google Maps ↗</a></div></article>';
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
  if(meta.officialUrl)links.push('<a class="btn primary" href="'+esc(meta.officialUrl)+'" target="_blank" rel="noopener noreferrer">Official agency website ↗</a>');
  links.push('<a class="btn ghost" href="'+esc(mapsSearchUrl(s.agency==='Agency not specified in the guide'?s.name:s.agency))+'" target="_blank" rel="noopener noreferrer">Open Google Maps directory ↗</a>');
  if(logo?.source)links.push('<a class="source-link" href="'+esc(logo.source)+'" target="_blank" rel="noopener noreferrer">Logo source ↗</a>');
  parts.push('<div class="profile-actions">'+links.join('')+'</div><p class="profile-note">The guide may not contain current eligibility, fees, hours, or availability. Confirm these directly with the responsible agency.</p>');
  $('#serviceModalBody').innerHTML=parts.join('');
  modal.showModal();
}

async function init(){try{const r=await fetch('data/guide-content.json?v=directory-3');if(!r.ok)throw Error('Content unavailable');data=await r.json();drawAbout();drawReferrals();drawProgramFilters();renderProgrammes();drawCategoryFilters();renderCategories();renderDecision();renderContacts();renderMap();let initial=location.hash.slice(1);if(['programmes','categories','contacts'].includes(initial))initial='services';showView(NAV.includes(initial)?initial:'about')}catch(e){console.error(e);$('#main').innerHTML='<div class="wrap page-content"><div class="empty-state"><b>Guide content could not be loaded.</b> Refresh the page or contact the site owner.</div></div>'}}
init();
