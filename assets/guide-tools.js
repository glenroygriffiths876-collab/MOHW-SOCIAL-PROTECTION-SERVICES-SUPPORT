(() => {
  'use strict';
  const WA_NUMBER = '18765029756';
  const GUIDE_URL = 'https://glenroygriffiths876-collab.github.io/MOHW-SOCIAL-PROTECTION-SERVICES-SUPPORT/';
  const GIA_IMAGE = './assets/gia-avatar.jpg';
  const q = (s, r=document) => r.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const waitForGuide = async () => {
    try {
      const response = await fetch('data/guide-content.json?v=gia-feedback-1', {cache:'no-store'});
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

  function mountGia(guide) {
    if(q('#giaLauncher'))return;
    const avatar=GIA_IMAGE;
    const launcher=document.createElement('button');
    launcher.className='gia-launcher';launcher.id='giaLauncher';launcher.type='button';
    launcher.setAttribute('aria-label','Open Gia, the guide assistant');launcher.setAttribute('aria-expanded','false');
    launcher.innerHTML='<span class="gia-launcher-pulse"></span><img src="'+avatar+'" alt=""><span class="gia-launcher-copy"><b>Ask Gia</b><small>Find a helpful next step</small></span><span class="gia-launcher-arrow" aria-hidden="true">↑</span>';
    document.body.append(launcher);
    const panel=document.createElement('section');
    panel.className='gia-panel';panel.id='giaPanel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-labelledby','giaTitle');
    panel.innerHTML='<header class="gia-head"><div class="gia-identity"><img src="'+avatar+'" alt="Gia"><div><span class="gia-presence"><i></i> GUIDE ASSISTANT</span><h2 id="giaTitle">Hi, I’m Gia <span>👋🏾</span></h2><p>Let’s find a helpful next step.</p></div></div><button class="gia-close" type="button" aria-label="Close Gia">×</button></header><div class="gia-intro"><span class="gia-spark">✳</span><p>I can search the booklet for programmes, services, referral steps, and agency contacts. Tell me what kind of support you are looking for.</p></div><div class="gia-shortcuts" aria-label="Try asking Gia"><button type="button" data-gia-prompt="cash assistance PATH">Cash help</button><button type="button" data-gia-prompt="housing">Housing</button><button type="button" data-gia-prompt="mental health">Wellbeing</button><button type="button" data-gia-prompt="referral steps">Referral steps</button></div><div class="gia-messages" id="giaMessages" aria-live="polite"><div class="gia-message gia-message-assistant">You can search by a service name, a need, or a parish. I’ll show guide information and where to confirm details.</div></div><form class="gia-compose" id="giaForm"><label class="visually-hidden" for="giaInput">Ask Gia about a service or support need</label><input id="giaInput" maxlength="180" autocomplete="off" placeholder="What support are you looking for?"><button type="submit" aria-label="Send question">↑</button></form><div class="gia-note">Guide search only · No personal details needed · Not an eligibility decision</div>';
    document.body.append(panel);
    const messages=q('#giaMessages'),input=q('#giaInput');
    const close=()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();};
    launcher.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;launcher.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>input.focus(),100);});
    q('.gia-close',panel).addEventListener('click',close);
    panel.addEventListener('click',event=>{
      const shortcut=event.target.closest('[data-gia-prompt]');
      if(shortcut){input.value=shortcut.dataset.giaPrompt;submitQuery(input.value);}
      const directory=event.target.closest('[data-gia-directory]');
      if(directory){showDirectory(directory.dataset.giaDirectory);}
      const nav=event.target.closest('[data-gia-nav]');
      if(nav){document.querySelector('[data-nav="'+nav.dataset.giaNav+'"]')?.click();close();}
    });
    q('#giaForm').addEventListener('submit',event=>{event.preventDefault();submitQuery(input.value);});
    function submitQuery(raw){
      const query=raw.trim();if(!query)return;
      messages.insertAdjacentHTML('beforeend','<div class="gia-message gia-message-user">'+esc(query)+'</div>');
      input.value='';
      const answer=findAnswers(guide,query);
      messages.insertAdjacentHTML('beforeend',answer);
      messages.scrollTop=messages.scrollHeight;
    }
    function showDirectory(term){
      const search=q('#serviceSearch');
      document.querySelector('[data-nav="services"]')?.click();
      if(search){search.value=term;search.dispatchEvent(new Event('input',{bubbles:true}));}
      close();
    }
  }

  function normal(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
  function editDistance(a,b){
    if(Math.abs(a.length-b.length)>2)return 3;
    let prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      const cur=[i];
      for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      prev=cur;
    }
    return prev[b.length];
  }
  function findAnswers(data,query){
    const qn=normal(query), tokens=qn.split(/\s+/).filter(t=>t.length>1);
    const synonyms={
      money:['cash','financial','benefit','benefits','grant','assistance','path','income','poor','food'],
      cash:['money','financial','benefit','benefits','grant','assistance','path','income'],
      house:['housing','shelter','rent','home','homeless'], housing:['house','shelter','rent','home','homeless'],
      health:['medical','clinic','hospital','medicine','medication','treatment'],
      mental:['wellbeing','wellness','counselling','counseling','psychology','crisis','suicide'],
      wellbeing:['mental','wellness','counselling','counseling','psychology'],
      child:['children','school','youth','family','caregiver'], children:['child','youth','family'],
      disability:['disabled','disabilities','accessibility','special needs'],
      referral:['refer','referring','process','steps','pathway','procedure'],
      domestic:['violence','abuse','gender','safety'], abuse:['violence','gender','safety'],
      work:['employment','job','skills','training'], job:['employment','work','skills'],
      parish:['location','near','where','office','contact']
    };
    const expanded=new Set(tokens);
    tokens.forEach(t=>(synonyms[t]||[]).forEach(v=>expanded.add(v)));
    const entries=[];
    (data.programmes||[]).forEach((x,i)=>entries.push({kind:'programme',title:x.name,body:[x.support,x.where,x.bring,x.process].filter(Boolean).join(' '),data:x,nav:'services',search:x.name}));
    (data.categories||[]).forEach(x=>entries.push({kind:'support category',title:x.programme+' · '+x.category,body:[x.benefits,x.target].filter(Boolean).join(' '),data:x,nav:'services',search:x.programme+' '+x.category}));
    (data.decision||[]).forEach(x=>entries.push({kind:'decision guide',title:x.situation,body:[x.options,x.provider].filter(Boolean).join(' '),data:x,nav:'decision',search:x.situation}));
    (data.contacts||[]).forEach(x=>entries.push({kind:'agency contact',title:x.agency,body:x.details||'',data:x,nav:'services',search:x.agency}));
    (data.referralSteps||[]).forEach((x,i)=>entries.push({kind:'referral procedure',title:'Step '+(i+1)+' · '+(typeof x==='string'?x:(x.title||'Referral step')),body:typeof x==='string'?x:[x.title,x.description,x.detail].filter(Boolean).join(' '),data:x,nav:'referrals',search:typeof x==='string'?x:[x.title,x.description,x.detail].filter(Boolean).join(' ')}));
    function score(entry){
      const title=normal(entry.title), body=normal(entry.body), all=title+' '+body, words=new Set(all.split(' '));
      let total=0,hits=0;
      for(const token of expanded){
        if(!token)continue;
        if(title===token)total+=12,hits++;
        else if(title.includes(token))total+=7,hits++;
        else if(words.has(token))total+=5,hits++;
        else if(body.includes(token))total+=2.5,hits++;
        else if(token.length>=4){
          const candidate=[...words].filter(w=>Math.abs(w.length-token.length)<=2).some(w=>editDistance(token,w)<=1);
          if(candidate)total+=1.5,hits++;
        }
      }
      return hits?total/(Math.sqrt(tokens.length||1)):0;
    }
    const scored=entries.map(e=>({...e,score:score(e)})).filter(e=>e.score>0).sort((a,b)=>b.score-a.score);
    const list=scored.slice(0,5);
    const intro=list.length
      ?'<div class="gia-message gia-message-assistant">I found a few relevant places in the guide. Start with the closest match, then confirm current details with the agency.</div>'
      :'<div class="gia-message gia-message-assistant">I couldn’t find an exact match in the guide yet. Try a programme name (like PATH), a need (like food or housing), or ask me about referral steps.</div>';
    const cards=list.map(e=>{
      const summary=String(e.body||'').slice(0,310)+(String(e.body||'').length>310?'…':'');
      const cta=e.nav==='services'?'Show in Find Services':e.nav==='decision'?'Open Decision Guide':'Open Referral Procedures';
      const attr=e.nav==='services'?'data-gia-directory="'+esc(e.search)+'"':'data-gia-nav="'+e.nav+'"';
      return '<article class="gia-result-card"><span class="gia-result-kind">'+esc(e.kind)+'</span><h3>'+esc(e.title)+'</h3><p>'+esc(summary||'See the guide section for related information.')+'</p><button type="button" '+attr+'>'+cta+' <span>→</span></button></article>';
    }).join('');
    return intro+(list.length?'<div class="gia-results">'+cards+'</div>':'<div class="gia-message gia-message-assistant"><button class="gia-inline-nav" type="button" data-gia-nav="services">Browse Find Services →</button> &nbsp; <button class="gia-inline-nav" type="button" data-gia-nav="referrals">See referral steps →</button></div>');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    mountHelp();
    const guide=await waitForGuide();
    mountGia(guide||{});
  }, {once:true});
})();