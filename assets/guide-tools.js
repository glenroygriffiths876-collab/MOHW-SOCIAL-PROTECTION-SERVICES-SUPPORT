(() => {
  'use strict';
  const WA_NUMBER = '18765029756';
  const GUIDE_URL = 'https://glenroygriffiths876-collab.github.io/MOHW-SOCIAL-PROTECTION-SERVICES-SUPPORT/';
  const GIA_IMAGE = './assets/gia-avatar.jpg';
  const q = (s, r=document) => r.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const waitForGuide = async () => {
    try {
      const response = await fetch('data/guide-content.json', {cache:'no-cache'});
      if (!response.ok) throw new Error('Guide unavailable');
      return await response.json();
    } catch (error) {
      console.error('Guide tools could not load booklet content:', error);
      return null;
    }
  };
  const titleForPage = () => {
    const active = q('.view.active');
    return active?.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim() || 'Social Protection Services Support Guide';
  };
  const pageName = () => ({
    about:'About This Guide', referrals:'Referral Procedures', decision:'Decision Guide', services:'Find Services'
  }[(location.hash || '#about').slice(1)] || titleForPage());

  function mountHelp() {
    if(q('#guideActionDock'))return;
    const dock=document.createElement('nav');dock.id='guideActionDock';dock.className='guide-action-dock';dock.setAttribute('aria-label','Guide actions');
    dock.innerHTML='<button class="guide-action share" data-action="share" aria-label="Share this guide" title="Share"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="23.5" cy="7.5" r="4"/><circle cx="8.5" cy="16" r="4"/><circle cx="23.5" cy="24.5" r="4"/><path d="m12 14 7.5-4M12 18l7.5 4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span>Share</span></button><button class="guide-action issue" data-action="issue" aria-label="Report an issue" title="Report an issue"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 27V5m1 1h15l-4 5 4 5H9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Report</span></button><button class="guide-action feedback" data-action="feedback" aria-label="Send feedback" title="Send feedback"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7h22v16H15l-7 5v-5H5z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 15h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span>Feedback</span></button><button class="guide-action install" data-action="install" aria-label="Install this app" title="Install app"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v16m0 0-6-6m6 6 6-6M6 23v4h20v-4" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Install app</span></button>'
    document.body.append(dock);
    const logo='assets/mohw-official-logo.png';
    const share=document.createElement('dialog');share.id='guideShareDialog';share.className='guide-message-dialog guide-share-dialog';share.setAttribute('aria-labelledby','guideShareTitle');
    share.innerHTML='<div class="guide-dialog-head"><div class="guide-share-brand"><img src="'+logo+'" alt="Ministry of Health &amp; Wellness"><div><span class="guide-tool-kicker">JAMAICA · MOHW</span><h2 id="guideShareTitle">Share this guide</h2></div></div><button class="guide-tool-close" data-close aria-label="Close">×</button></div><p class="guide-message-intro">Help someone find social protection services and referral information.</p><div class="guide-share-options"><button data-share="native"><span>↗</span><b>Share link</b><small>Open your device’s sharing options</small></button><button data-share="copy"><span>⧉</span><b>Copy link</b><small>Copy the guide address</small></button><button data-share="whatsapp"><span>◉</span><b>WhatsApp</b><small>Send the guide link in a message</small></button><button data-share="qr"><span>▦</span><b>QR code</b><small>Let someone scan this guide</small></button></div><div class="guide-share-url"><span id="guideShareUrl"></span><button data-share="copy">Copy</button></div><div class="guide-share-qr" id="guideShareQr" hidden><img alt="QR code linking to the Social Protection Services Support Guide"><p>Scan with a phone camera to open the guide.</p></div>';
    document.body.append(share);
    const message=document.createElement('dialog');message.id='guideMessageDialog';message.className='guide-message-dialog';message.setAttribute('aria-labelledby','guideMessageTitle');
    message.innerHTML='<form id="guideMessageForm"><div class="guide-dialog-head"><div class="guide-share-brand"><img src="'+logo+'" alt=""><div><span class="guide-tool-kicker">MOHW SOCIAL PROTECTION GUIDE</span><h2 id="guideMessageTitle">Send feedback</h2></div></div><button type="button" class="guide-tool-close" data-close aria-label="Close">×</button></div><p class="guide-message-intro" id="guideMessageIntro"></p><label class="guide-field-label" for="guideMessageType">What is this about?</label><select id="guideMessageType"><option>Feedback</option><option>Incorrect or outdated information</option><option>Broken link or contact</option><option>Technical issue</option><option>Accessibility suggestion</option><option>Other suggestion</option></select><label class="guide-field-label" for="guideMessageText">Your message</label><textarea id="guideMessageText" rows="5" maxlength="1200" placeholder="Tell us what happened or what would make the guide better." required></textarea><p class="guide-privacy-note">Please do not include anyone’s name, health details, or other private information. Nothing is sent until you review and press Send in WhatsApp.</p><div class="guide-dialog-actions"><button type="button" class="guide-secondary" data-close>Cancel</button><button type="submit" class="guide-primary">Continue to WhatsApp <span>→</span></button></div></form>';
    document.body.append(message);
    const install=document.createElement('dialog');install.id='guideInstallDialog';install.className='guide-message-dialog';install.setAttribute('aria-labelledby','guideInstallTitle');
    install.innerHTML='<div class="guide-dialog-head"><div class="guide-share-brand"><img src="'+logo+'" alt=""><div><span class="guide-tool-kicker">MOHW · SOCIAL PROTECTION</span><h2 id="guideInstallTitle">Add this guide to your device</h2></div></div><button class="guide-tool-close" data-close aria-label="Close">×</button></div><div class="guide-install-card"><div class="guide-install-app-icon"><img src="'+logo+'" alt=""></div><div><b>MOHW Social Support</b><small>Jamaica · Ministry of Health &amp; Wellness</small></div><span class="guide-install-check">✓</span></div><p class="guide-message-intro" id="guideInstallInstructions">Install the guide for an app-style icon and a full-screen experience.</p><div class="guide-install-buttons"><button class="guide-primary" id="guideInstallNow">Install app <span>↓</span></button><button class="guide-secondary" data-close>Maybe later</button></div>';
    document.body.append(install);
    const shareUrl=GUIDE_URL; q('#guideShareUrl').textContent=shareUrl;
    const open=d=>{if(!d.open)d.showModal()},close=d=>{if(d.open)d.close()};
    const shareData={title:'MOHW Social Protection Services Support Guide',text:'Find social protection services and referral information across Jamaica.',url:shareUrl};
    let deferred=null;
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;});
    window.addEventListener('appinstalled',()=>{deferred=null;showToast('The guide is installed on your device.');});
    const copy=async()=>{try{await navigator.clipboard.writeText(shareUrl);}catch{const x=document.createElement('textarea');x.value=shareUrl;x.style='position:fixed;opacity:0';document.body.append(x);x.select();document.execCommand('copy');x.remove();}showToast('Guide link copied.');};
    const nativeShare=async()=>{if(navigator.share){try{await navigator.share(shareData);return;}catch(e){if(e.name==='AbortError')return;}}await copy();};
    const report=(issue)=>{q('#guideMessageTitle').textContent=issue?'Report an issue':'Send feedback';q('#guideMessageType').value=issue?'Technical issue':'Feedback';q('#guideMessageIntro').textContent=issue?'Tell us what is wrong or not working. The page name and link will be added automatically.':'Share a suggestion to help improve this guide.';q('#guideMessageText').value='';open(message);setTimeout(()=>q('#guideMessageText').focus(),50);};
    const deviceInstructions=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)?'In Safari, tap Share, then “Add to Home Screen”. Confirm the name and tap Add.':/android/i.test(navigator.userAgent)?'In Chrome, tap the menu (⋮), then “Install app” or “Add to Home screen”.':'In Chrome or Edge, use the install icon in the address bar or browser menu and choose “Install”.';
    const installNow=async()=>{if(deferred){const p=deferred;deferred=null;close(install);try{await p.prompt();const c=await p.userChoice;if(c?.outcome==='accepted')showToast('The guide is being installed.');}catch{open(install);}return;}q('#guideInstallInstructions').textContent=deviceInstructions();q('#guideInstallNow').textContent='Got it';open(install);};
    dock.addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a==='share'){q('#guideShareQr').hidden=true;open(share);}if(a==='issue')report(true);if(a==='feedback')report(false);if(a==='install')installNow();});
    share.addEventListener('click',async e=>{const a=e.target.closest('[data-share]')?.dataset.share;if(!a)return;if(a==='native'){close(share);await nativeShare();}if(a==='copy')await copy();if(a==='whatsapp')window.open('https://wa.me/?text='+encodeURIComponent(shareData.text+' '+shareUrl),'_blank','noopener,noreferrer');if(a==='qr'){const box=q('#guideShareQr');box.hidden=false;const img=box.querySelector('img');if(!img.src)img.src='https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data='+encodeURIComponent(shareUrl);}});
    [share,message,install].forEach(d=>d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))close(d);}));
    q('#guideMessageForm').addEventListener('submit',e=>{e.preventDefault();const text=q('#guideMessageText').value.trim();if(!text){q('#guideMessageText').focus();return;}const topic=q('#guideMessageType').value;const body=['MOHW Social Protection Services Support Guide — '+q('#guideMessageTitle').textContent,'Page: '+pageName(),'Topic: '+topic,'Message: '+text,'Page link: '+location.href,'Device view: '+innerWidth+' × '+innerHeight,'Date: '+new Date().toLocaleString()].join('\\n');window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(body),'_blank','noopener,noreferrer');close(message);showToast('WhatsApp opened. Review your message before sending.');});
    q('#guideInstallNow').addEventListener('click',async()=>{if(deferred){const p=deferred;deferred=null;close(install);try{await p.prompt();await p.userChoice;}catch{}}else close(install);});
  }

  function showToast(message){
    let toast=q('#guideToolToast');
    if(!toast){toast=document.createElement('div');toast.id='guideToolToast';toast.className='guide-tool-toast';toast.setAttribute('role','status');document.body.append(toast);}
    toast.textContent=message;toast.classList.add('show');
    clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2800);
  }

  const NEEDS = [
    ['Food and daily essentials', 'food meals clothing poor relief'],
    ['Transport to care', 'transport transportation'],
    ['Medication or treatment', 'medication treatment medical'],
    ['Housing', 'housing shelter homeless'],
    ['Disability and caregiving', 'disability disabilities caregiver care'],
    ['Income and benefits', 'cash income financial pension'],
    ['Education and work', 'education school training employment'],
    ['Emotional support', 'mental counselling wellbeing']
  ];
  const QUESTIONS = [
    ['What kind of food support is needed?', [['Food for a household','Poor Relief food'],['Meals for an older person','Senior Citizen Services Meals'],['Meals for a student','School Feeding'],['Not sure yet','food meals']]],
    ['What is preventing the journey?', [['Cannot afford transport','Poor Relief transportation'],['Needs accessible transport or someone to accompany them','transportation disability'],['Not sure yet','transportation']]],
    ['What needs to be paid for or arranged?', [['Ongoing prescription medication','NHF medication'],['A test or scan','RHA Diagnostic Support'],['Specialised treatment or equipment','Compassionate medical treatment'],['Not sure yet','medical assistance']]],
    ['What housing help is needed?', [['Somewhere to stay or emergency support','Poor Relief homeless shelter'],['Repairs or rebuilding','housing repairs rehabilitation'],['Making a home accessible','disability accessibility modifications'],['Not sure yet','Local Government Assistance housing']]],
    ['Who needs the support?', [['A child with a disability','Early Stimulation children disabilities'],['An adult with a disability','disability assistance'],['An older person needing daily care','senior care infirmary'],['A caregiver who needs help','caregiver support'],['Not sure yet','disability support']]],
    ['Which situation is closest?', [['Household struggling with basic expenses','PATH cash household'],['Older person asking about a pension','Social Pension NIS'],['Help after a crisis or disaster','Rehabilitation Grants emergency'],['Not sure yet','cash assistance']]],
    ['What is the immediate goal?', [['Staying in school','PATH school assistance'],['Learning a skill or finding work','HEART training employment'],['Returning to education after pregnancy','Women Centre adolescent education'],['Not sure yet','HEART PATH education']]],
    ['What support is being sought?', [['Mental health support','mental health counselling'],['Support with substance use','NCDA counselling'],['Support after violence or abuse','Victim Services Bureau Gender'],['Not sure yet','psychosocial support']]]
  ];
  const PARISH_OPTIONS = ['Not specified','Hanover','Westmoreland','St. James','Trelawny','St. Elizabeth','Manchester','Clarendon','St. Ann','St. Catherine','St. Andrew','Kingston','St. Mary','Portland','St. Thomas'];
  function detectNeeds(text) {
    const patterns = [/food|hungr|meal|grocer/, /transport|travel|bus fare|taxi|getting to|cannot get to|can t get to/, /medicin|medication|treatment|prescription|scan|dialysis/, /hous|shelter|homeless|rent|roof/, /disabil|disabled|caregiv|autis|daily care/, /income|money|cash|pension|financial/, /school|education|training|employment|job/, /mental|counsell|substance|emotional/];
    return patterns.flatMap((pattern,index)=>pattern.test(normal(text))?[index]:[]);
  }
  const BARRIERS = {
    'Missing documents': 'Ask the agency which documents are essential, which alternatives it accepts, and whether an initial assessment can begin while documents are obtained.',
    'Cannot travel': 'Ask about telephone intake, an accessible appointment, an authorised representative, or a local referral route. Confirm what the agency can actually offer.',
    'Cannot afford costs': 'Confirm all application, travel and service costs before arranging a visit. Ask the receiving service or facility social worker about available assistance.',
    'No response': 'Check the contact details and opening hours, record the attempted contact in your approved records, and ask for an alternative contact or escalation route.',
    'Service unavailable': 'Clarify whether the issue is capacity, catchment area or eligibility. Review another guide option and confirm availability before redirecting the person.',
    'Communication or caregiver support': 'Ask the person how they prefer to communicate and whom they want involved. Confirm accessibility and representative arrangements with the service.'
  };
  function normal(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function guideEntries(data) {
    const entries = [];
    for (const p of data.programmes || []) entries.push({title:p.name, body:p.support, where:p.where, bring:p.bring, process:p.process, section:'Programme profiles', nav:'services', term:p.name});
    for (const c of data.categories || []) entries.push({title:c.programme, body:c.benefits, target:c.target, section:'Support categories', nav:'services', term:c.programme});
    for (const d of data.decision || []) entries.push({title:d.options, body:d.situation, where:d.provider, section:'Decision Guide', nav:'decision'});
    for (const c of data.contacts || []) entries.push({title:c.agency, body:c.details, section:'Agency contacts', nav:'services', term:c.agency});
    for (const [i, step] of (data.referralSteps || []).entries()) {
      const title = Array.isArray(step) ? step[0] : typeof step === 'string' ? step : step.title;
      const body = Array.isArray(step) ? step[1] : typeof step === 'string' ? step : step.description;
      entries.push({title:`Step ${i + 1} · ${title}`,body,section:'Referral Procedures',nav:'referrals'});
    }
    for (const d of data.documents || []) entries.push({title:d.document,body:d.requirements,where:d.where,bring:d.requirements,process:d.process,section:'Document requirements',nav:'services',term:d.where});
    const aliases = {'Poor Relief':'Local Government Assistance','National Health Fund Card':'NHF','HEART/NSTA Trust':'HEART / NSTA','Compassionate Fund Programme':'MOHW Compassionate Fund Programme','CHASE Medical Assistance':'CHASE / Compassionate Medical Assistance'};
    for (const entry of entries) {
      const canonical=aliases[entry.title] || entry.title;
      const profile=entries.find(e=>e.section==='Programme profiles' && e.title===canonical);
      if(profile && profile!==entry) {
        entry.where=profile.where;entry.bring=profile.bring;entry.process=profile.process;entry.term=profile.term;
      }
      const meta=data.serviceMetadata?.[canonical] || data.serviceMetadata?.[entry.title] || {};
      entry.agency=meta.agency || entry.where || '';
      entry.url=/^https:\/\//.test(meta.officialUrl || '')?meta.officialUrl:'';
      entry.contacts=(data.contacts || []).filter(c=>(meta.contactAgencies || []).some(name=>normal(c.agency).includes(normal(name))));
      entry.canonical=canonical;
    }
    return entries;
  }
  function oneEditApart(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i=0, j=0, edits=0;
    while (i<a.length && j<b.length) {
      if(a[i]===b[j]) {i++;j++;continue;}
      if(++edits>1) return false;
      if(a.length>=b.length) i++;
      if(b.length>=a.length) j++;
    }
    return edits + (a.length-i) + (b.length-j) <= 1;
  }
  function searchGuide(entries, query) {
    const stop = new Set('a an the i am is are has have with for to of in on at and or this that someone person help need needs wants can cannot who she he her his my me please get looking about'.split(' '));
    const aliases = {child:['children'], children:['child'], caregiver:['caregiving','care'], food:['meals','feeding'], transport:['transportation'], disabled:['disability','disabilities'], disability:['disabled','disabilities'], elderly:['senior','seniors'], older:['senior','seniors'], job:['employment','training'], money:['cash','financial'], medicine:['medication','drugs'], housing:['shelter','homeless'], counselling:['counseling'], referral:['referral','step'], steps:['step'], documents:['documents','identification'], unwell:['medical'], mental:['mental','psychosocial']};
    const words = [...new Set(normal(query).split(' ').filter(w => w.length > 1 && !stop.has(w)))];
    if (!words.length) return [];
    const ranked = entries.map(entry => {
      const title = normal(entry.title), body = normal([entry.body,entry.target,entry.where,entry.bring,entry.process].join(' '));
      const vocabulary = new Set((title+' '+body).split(' '));
      const matches = words.filter(word => [word,...(aliases[word] || [])].some(term => vocabulary.has(term) || (term.length >= 5 && [...vocabulary].some(candidate => oneEditApart(term, candidate)))));
      const score = matches.reduce((sum, word) => sum + ([word,...(aliases[word] || [])].some(term => title.split(' ').includes(term)) ? 7 : 2), 0) + (title === normal(query) ? 30 : 0);
      return {...entry,score:score + matches.length * 12,matches};
    }).filter(entry => entry.score > 0).sort((a,b) => b.score-a.score);
    const seen = new Set();
    return ranked.filter(entry => {const key=normal(entry.canonical || entry.title);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,8);
  }
  function mountGia(initialGuide) {
    if(q('#giaLauncher')) return;
    let guide = initialGuide, entries = guideEntries(guide || {});
    let state = {guided:false, needIndex:null, detail:'', parish:'Not specified', showAll:false, detected:[], completed:[], view:'help', query:'', need:'', barrier:'', selected:null, plan:'', outcome:'', next:'', date:''};
    let results = [];
    const launcher = document.createElement('button');
    launcher.id='giaLauncher'; launcher.className='gia-launcher'; launcher.type='button';
    launcher.setAttribute('aria-label','Open Gia, the guide assistant');launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-expanded','false');
    launcher.innerHTML=`<span class="gia-launcher-pulse"></span><img src="${GIA_IMAGE}" alt=""><span class="gia-launcher-copy"><b>Ask Gia</b><small>Find your next step</small></span>`;
    const panel = document.createElement('dialog');panel.id='giaPanel';panel.className='gia-panel gia-workflow';panel.setAttribute('aria-labelledby','giaTitle');
    panel.innerHTML=`<header class="gia-head"><div class="gia-identity"><img src="${GIA_IMAGE}" alt=""><div><h2 id="giaTitle">Let’s work through it</h2><p>Gia · MOHW Social Support</p></div></div><button class="gia-close" aria-label="Close Gia" data-action="close">×</button></header><nav class="gia-tabs" aria-label="Gia tools"><button data-view="help">Help someone</button><button data-view="search">Find information</button><button data-view="follow">Follow up</button></nav><main class="gia-workspace" id="giaWorkspace"></main><p class="gia-note">Keep names and identifying details out. Drafts stay in this open page and clear on reload.</p>`;
    document.body.append(launcher,panel);
    const workspace=q('#giaWorkspace',panel);
    const button=(action,label)=>`<button type="button" data-action="${action}">${label}</button>`;
    function beginNeed(index) {
      state.guided=true;state.needIndex=index;state.need=NEEDS[index][1];state.detail='';state.selected=null;state.plan='';state.completed=[];state.showAll=false;
      render('clarify');
    }
    function contactDetails(entry) {
      return `<section class="gia-contact-block"><h4>Contact the service</h4><p>${esc(entry.agency || 'Confirm the responsible agency in the source section.')}</p>${entry.contacts.map(c=>`<details><summary>${esc(c.agency)}</summary><p>${esc(c.details)}</p></details>`).join('')}${entry.url?`<a href="${esc(entry.url)}" target="_blank" rel="noopener noreferrer">Open agency website ↗</a>`:''}<small>Agency details are transcribed from the working guide. Confirm current arrangements.</small></section>`;
    }
    function render(view=state.view) {
      state.view=view;
      panel.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.view===view)));
      if(!guide){workspace.innerHTML=`<h3 tabindex="-1">The guide could not load</h3><p>Check your connection and try again. Your current entries will stay here.</p>${button('retry','Try again')}${button('directory','Open directory')}`;return;}
      const source=`<p class="gia-source">Source · ${esc(guide.edition)} · working draft, agency verification pending.</p>`;
      if(view==='home') workspace.innerHTML=`<h3 tabindex="-1">What would you like to do?</h3><p>Start with a need, find a specific resource, or work through an unsuccessful referral.</p><div class="gia-start"><button data-view="help"><b>Help someone</b><span>Choose a need and prepare the next step</span></button><button data-view="search"><b>Find information</b><span>Search programmes, contacts and referral guidance</span></button><button data-view="follow"><b>Follow up</b><span>Review an outcome and decide what happens next</span></button></div>${source}`;
      if(view==='help') workspace.innerHTML=`<h3 tabindex="-1">Tell me what’s getting in the way.</h3><p>Describe the situation or choose a need. We’ll work out a practical starting point together.</p><div class="gia-choices">${NEEDS.map(([label,query],i)=>`<button data-need="${i}" aria-pressed="${state.need===query}">${label}</button>`).join('')}</div><form data-form="help"><label for="giaSituation">Or describe the support needed</label><textarea id="giaSituation" maxlength="500" rows="3" placeholder="For example, transport to clinic is too expensive">${esc(state.query)}</textarea><button type="submit" class="gia-primary">Explore support</button></form><details><summary>Urgent safety concern?</summary><p>${esc(guide.referralSteps?.[1]?.[1] || 'Follow your facility’s emergency and safeguarding procedures.')}</p><button data-nav="referrals">Open referral guidance</button></details>`;
      if(view==='priority') workspace.innerHTML=`<h3 tabindex="-1">Which need should we work on first?</h3><p>I found these possible needs in your description. Choose the person’s priority, or change the description.</p><blockquote>${esc(state.query)}</blockquote><div class="gia-start">${state.detected.map(i=>`<button data-need="${i}">${esc(NEEDS[i][0])}</button>`).join('')}</div>${button('edit','Change the description')}`;
      if(view==='clarify') {
        const question=QUESTIONS[state.needIndex];
        workspace.innerHTML=`<div class="gia-progress">Understand the need → Choose support → Prepare next step</div><h3 tabindex="-1">${esc(question[0])}</h3><p>This helps narrow the guide to the kind of support you need.</p><div class="gia-start">${question[1].map(([label],i)=>`<button data-detail="${i}">${esc(label)}</button>`).join('')}</div>${button('edit','Back to needs')}`;
      }
      if(view==='search') workspace.innerHTML=`<h3 tabindex="-1">Find information quickly</h3><form data-form="search"><label for="giaSearch">Programme, need, document or agency</label><input id="giaSearch" type="search" maxlength="180" value="${esc(state.query)}" placeholder="Try PATH, transport or referral steps" required><button type="submit" class="gia-primary">Search guide</button></form><p>Use a programme profile to find its agency links and application information.</p>${source}`;
      if(view==='results') {
        results=searchGuide(state.guided ? entries.filter(e=>['Programme profiles','Support categories','Decision Guide'].includes(e.section)) : entries,state.guided ? state.need : state.query);
        if(state.guided && state.detail==='A caregiver who needs help') results=[];
        workspace.innerHTML=`<h3 tabindex="-1">Let’s choose a starting point</h3>${/danger|abuse|suicid|violence|neglect|emergency/i.test(state.query)?`<aside class="gia-urgent"><b>Check urgency and safety first</b><p>${esc(guide.referralSteps?.[1]?.[1] || '')}</p><button data-nav="referrals">Open referral guidance</button></aside>`:''}<p>Your priority · <strong>${esc(state.guided ? NEEDS[state.needIndex]?.[0] || state.query : state.query)}</strong>${state.detail?' · '+esc(state.detail):''}</p>${button('edit','Change the need')}${source}${results.length?'<p>Matches reflect the guide wording. Confirm suitability and availability with the agency.</p>':'<p>The guide does not identify a clear service for this request. Ask the facility social worker or receiving agency to help clarify the support needed. You can also change the need or browse the directory. This does not mean assistance is unavailable.</p>'+button('directory','Browse services')}<div class="gia-results">${results.slice(0,state.showAll || !state.guided ? 8 : 3).map((e,i)=>`<article class="gia-result-card"><small>${esc(e.section)}</small><h4>${esc(e.title)}</h4><p>${esc(e.body?.length>220?e.body.slice(0,217)+'…':e.body)}</p>${e.target?`<p><b>Group listed in guide</b> ${esc(e.target)}</p>`:''}<small>Guide section · ${esc(e.section)}</small><button data-select="${i}">Review this option</button></article>`).join('')}</div>${state.guided && results.length>3 && !state.showAll?button('more','Show more options'):''}`;
      }
      if(view==='option') {
        const e=state.selected;
        workspace.innerHTML=`<h3 tabindex="-1">${esc(e.title)}</h3><p>${esc(e.body)}</p>${source}<dl>${[['Where to start',e.where],['Documents listed',e.bring],['Process in the guide',e.process],['Group listed',e.target]].filter(([,v])=>v).map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${contactDetails(e)}<details class="gia-call"><summary>What to ask when you call</summary><p>“I’m asking about ${esc(e.title)}. Is this the right service for ${esc(state.detail || state.query)}? Which office should we contact, what documents are needed, and are there any costs or appointment requirements?”</p></details><h4>Prepare before a visit</h4><p>Tick only the arrangements you have confirmed with the service.</p><div class="gia-checklist">${['Correct service and catchment area','Availability, appointment and access arrangements','Documents, accepted alternatives and costs'].map((label,i)=>`<label><input type="checkbox" data-check="${i}" ${state.completed.includes(i)?'checked':''}>${label}</label>`).join('')}</div><label for="giaParish">Parish to discuss with the agency</label><select id="giaParish">${PARISH_OPTIONS.map(v=>`<option ${v===state.parish?'selected':''}>${v}</option>`).join('')}</select><small>Used in your plan. Local availability still needs confirmation.</small><button data-nav="${e.nav}" data-term="${esc(e.term || '')}">Open source section and contacts</button><label for="giaBarrier">What might make this difficult?</label><select id="giaBarrier"><option value="">No barrier selected / not sure</option>${Object.keys(BARRIERS).map(b=>`<option ${state.barrier===b?'selected':''}>${b}</option>`).join('')}</select><p id="giaBarrierAdvice" role="status">${esc(BARRIERS[state.barrier] || '')}</p><div class="gia-actions">${button('plan','Prepare action plan')}${button('results','Compare other options')}</div>`;
      }
      if(view==='plan') workspace.innerHTML=`<h3 tabindex="-1">Review the action plan</h3><p>Edit this draft together before copying or printing. Add only information appropriate for the recipient.</p><label for="giaPlan">Client instructions / referral preparation</label><textarea id="giaPlan" rows="14" maxlength="10000">${esc(state.plan)}</textarea><div class="gia-actions">${button('copy','Copy reviewed text')}${button('print','Print reviewed text')}${button('follow','Plan follow-up')}${button('option','Back to option')}</div><details><summary>Changed the arrangements?</summary><p>Rebuild the draft from your current choices. This replaces edits in the text above.</p>${button('refreshPlan','Rebuild draft from current choices')}</details><p id="giaStatus" role="status"></p><p>Preparing this text does not send a referral. Record any referral in your approved system.</p>`;
      if(view==='follow') workspace.innerHTML=`<h3 tabindex="-1">What happened after the referral?</h3><p>Use this checklist during follow-up, then transfer the reviewed note to your approved records.</p><label for="giaOutcome">Outcome</label><select id="giaOutcome"><option value="">Choose an outcome</option>${['Received help','Awaiting response','Could not access service','Needs changed'].map(v=>`<option ${state.outcome===v?'selected':''}>${v}</option>`).join('')}</select><label for="giaFollowBarrier">Barrier, if any</label><select id="giaFollowBarrier"><option value="">None / not sure</option>${Object.keys(BARRIERS).map(v=>`<option ${state.barrier===v?'selected':''}>${v}</option>`).join('')}</select><p id="giaFollowAdvice" role="status">${esc(BARRIERS[state.barrier] || '')}</p><label for="giaNext">Next action and responsible role</label><textarea id="giaNext" rows="3" maxlength="1000" placeholder="For example, referring worker to confirm appointment arrangements">${esc(state.next)}</textarea><label for="giaDate">Date to check again</label><input id="giaDate" type="date" value="${esc(state.date)}"><div class="gia-actions">${button('copyFollow','Copy follow-up note')}${button('help','Explore another option')}</div><p id="giaStatus" role="status"></p><p>This page does not save case records or send reminders.</p>`;
      if(['priority','clarify'].includes(view) && /danger|abuse|suicid|violence|neglect|emergency/i.test(state.query)) workspace.insertAdjacentHTML('afterbegin',`<aside class="gia-urgent"><b>Check urgency and safety first</b><p>${esc(guide.referralSteps?.[1]?.[1] || '')}</p><button data-nav="referrals">Open referral guidance</button></aside>`);
      workspace.insertAdjacentHTML('beforeend',`<div class="gia-reset">${button('reset','Clear this session')}</div>`);
      workspace.scrollTop=0;workspace.querySelector('h3')?.focus();
    }
    function preserve() {
      const value=id=>q('#'+id,panel)?.value;
      if(value('giaSituation')!==undefined) state.query=value('giaSituation');
      if(value('giaSearch')!==undefined) state.query=value('giaSearch');
      if(value('giaPlan')!==undefined) state.plan=value('giaPlan');
      if(value('giaNext')!==undefined) state.next=value('giaNext');
      if(value('giaDate')!==undefined) state.date=value('giaDate');
    }
    function makePlan() {
      const e=state.selected;
      return ['MOHW Social Support — action plan draft',`Priority: ${state.guided ? NEEDS[state.needIndex]?.[0] || state.query : state.query}`,`Specific need: ${state.detail || state.query}`,`Parish to confirm: ${state.parish}`,`Option to confirm: ${e.title}`,`Where to start: ${e.where || 'Open the source section and confirm the responsible agency.'}`,`Documents listed: ${e.bring || 'Confirm requirements directly with the agency.'}`,`Next step: ${e.process || 'Contact the responsible agency to confirm the appropriate referral route.'}`,`Barrier: ${state.barrier || 'None selected / not sure'}`,BARRIERS[state.barrier] || '', 'Before travelling: confirm availability, catchment, appointment, accessibility, documents and costs.', `Preparation confirmed: ${state.completed.length} of 3 checks. Confirm outstanding arrangements before travelling.`, 'Client action: Gather the documents listed above and agree a suitable appointment with the worker.', `Worker action: Contact ${e.agency || 'the receiving service'} to confirm suitability and access.`, `Follow-up date: ${state.date || 'Agree a date together.'}`,`Source: ${guide.edition}, ${e.section}. Working draft; requirements need agency confirmation.`].filter(Boolean).join('\n\n');
    }
    async function copy(text) {try{await navigator.clipboard.writeText(text);q('#giaStatus',panel).textContent='Copied. Review the destination before pasting.';}catch{q('#giaStatus',panel).textContent='Copy unavailable. Select and copy the text manually.';}}
    function close(){preserve();panel.close();}
    launcher.addEventListener('click',()=>{panel.showModal();launcher.setAttribute('aria-expanded','true');render();});
    panel.addEventListener('close',()=>{preserve();launcher.setAttribute('aria-expanded','false');launcher.focus();});
    panel.addEventListener('cancel',preserve);
    panel.addEventListener('input',preserve);
    panel.addEventListener('change',event=>{
      const id=event.target.id;
      if(id==='giaBarrier'||id==='giaFollowBarrier'){state.barrier=event.target.value;q(id==='giaBarrier'?'#giaBarrierAdvice':'#giaFollowAdvice',panel).textContent=BARRIERS[state.barrier] || '';}
      if(id==='giaParish') state.parish=event.target.value;
      if(event.target.dataset.check!==undefined){const index=Number(event.target.dataset.check);state.completed=state.completed.filter(i=>i!==index);if(event.target.checked)state.completed.push(index);}
      if(id==='giaOutcome') state.outcome=event.target.value;
    });
    panel.addEventListener('submit',event=>{
      event.preventDefault();preserve();if(!state.query.trim())return;
      state.need='';state.selected=null;state.plan='';state.showAll=false;
      state.guided=event.target.dataset.form==='help';
      if(state.guided){
        state.detected=detectNeeds(state.query);
        if(state.detected.length>1){render('priority');return;}
        if(state.detected.length===1){beginNeed(state.detected[0]);return;}
        state.guided=false;
      }
      render('results');
    });
    panel.addEventListener('click',async event=>{
      const target=event.target.closest('button');if(!target)return;preserve();
      if(target.dataset.view){render(target.dataset.view);return;}
      if(target.dataset.need!==undefined){const index=Number(target.dataset.need);if(state.view==='help')state.query=NEEDS[index][0];beginNeed(index);return;}
      if(target.dataset.detail!==undefined){const [label,query]=QUESTIONS[state.needIndex][1][Number(target.dataset.detail)];state.detail=label;state.need=query;render('results');return;}
      if(target.dataset.select!==undefined){const selected=results[Number(target.dataset.select)];if(state.selected?.canonical!==selected.canonical)state.completed=[];state.selected=selected;state.plan='';render('option');return;}
      if(target.dataset.nav){document.querySelector(`[data-nav="${target.dataset.nav}"]`)?.click();if(target.dataset.term){q('[data-map-filter="all"]')?.click();const field=q('#serviceSearch');field.value=target.dataset.term;field.dispatchEvent(new Event('input',{bubbles:true}));}close();return;}
      const action=target.dataset.action;
      if(action==='close')close();
      else if(action==='retry'){target.disabled=true;guide=await waitForGuide();entries=guideEntries(guide||{});render();}
      else if(action==='directory'){document.querySelector('[data-nav="services"]')?.click();close();}
      else if(action==='more'){state.showAll=true;render('results');}
      else if(action==='edit')render('help');
      else if(action==='reset'){workspace.innerHTML='<h3 tabindex="-1">Clear this session?</h3><p>This removes the current draft and answers from this page.</p>'+button('confirmReset','Clear answers')+button('cancelReset','Keep working');workspace.querySelector('h3').focus();}
      else if(action==='confirmReset'){state={guided:false, needIndex:null, detail:'', parish:'Not specified', showAll:false, detected:[], completed:[], view:'help',query:'',need:'',barrier:'',selected:null,plan:'',outcome:'',next:'',date:''};render();}
      else if(action==='cancelReset')render();
      else if(action==='plan'){state.plan=state.plan || makePlan();render('plan');}
      else if(action==='refreshPlan'){state.plan=makePlan();render('plan');}
      else if(action==='copy')await copy(state.plan);
      else if(action==='copyFollow'){await copy(['Follow-up draft',`Option: ${state.selected?.title || 'To be recorded'}`,`Outcome: ${state.outcome || 'Not recorded'}`,`Barrier: ${state.barrier || 'Not recorded'}`,`Next action and responsible role: ${state.next || 'To be agreed'}`,`Check again: ${state.date || 'To be agreed'}`].join('\n'));}
      else if(action==='print'){
        let print=q('#giaPrint');if(!print){print=document.createElement('pre');print.id='giaPrint';document.body.append(print);}print.textContent=state.plan;document.body.classList.add('gia-printing');window.print();document.body.classList.remove('gia-printing');print.remove();
      }
      else if(['results','option','follow','help'].includes(action))render(action);
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    mountHelp();
    const guide=await waitForGuide();
    mountGia(guide);
  }, {once:true});
})();