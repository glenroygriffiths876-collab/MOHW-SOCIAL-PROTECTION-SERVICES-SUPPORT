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
    if (q('#guideHelpFab')) return;
    const dock = document.createElement('div');
    dock.className = 'guide-tool-dock';
    dock.innerHTML = '<button type="button" class="guide-help-fab" id="guideHelpFab" aria-label="Share this guide, report an issue, or send feedback" aria-expanded="false"><span aria-hidden="true">↗</span><span class="guide-help-label">Guide tools</span></button><section class="guide-help-panel" id="guideHelpPanel" aria-label="Guide tools" hidden><div class="guide-help-panel-head"><div><span class="guide-tool-kicker">Help us improve</span><h2>Guide tools</h2></div><button type="button" class="guide-tool-close" aria-label="Close guide tools">×</button></div><p>Share this guide or tell us what needs attention.</p><div class="guide-tool-options"><button type="button" data-guide-tool="share"><span>↗</span><b>Share this guide</b><small>Send a link to someone who may find it helpful.</small></button><button type="button" data-guide-tool="report"><span>⚑</span><b>Report an issue</b><small>Flag a broken link, incorrect detail, or technical problem.</small></button><button type="button" data-guide-tool="feedback"><span>✳</span><b>Send feedback</b><small>Suggest an improvement to the guide.</small></button></div><small class="guide-tool-foot">Your message opens WhatsApp. It is not sent until you review and press Send.</small></section>';
    document.body.append(dock);

    const modal = document.createElement('dialog');
    modal.className = 'guide-message-dialog';
    modal.id = 'guideMessageDialog';
    modal.setAttribute('aria-labelledby','guideMessageTitle');
    modal.innerHTML = '<form method="dialog" id="guideMessageForm"><div class="guide-dialog-head"><div><span class="guide-tool-kicker">Social Protection Guide · Jamaica</span><h2 id="guideMessageTitle">Tell us what you think</h2></div><button type="button" class="guide-tool-close" id="guideMessageClose" aria-label="Close">×</button></div><p class="guide-message-intro" id="guideMessageIntro"></p><label class="guide-field-label" for="guideMessageType">What is this about?</label><select id="guideMessageType"><option>Feedback</option><option>Incorrect or outdated information</option><option>Broken link or contact</option><option>Technical issue</option><option>Accessibility suggestion</option><option>Other suggestion</option></select><label class="guide-field-label" for="guideMessageText">Your message</label><textarea id="guideMessageText" rows="5" maxlength="1200" placeholder="Describe the issue or suggestion. Please do not include anyone’s name, health details, or other private information." required></textarea><p class="guide-privacy-note">The message will include the page name and guide link to help us locate the issue. Please leave out personal or sensitive information.</p><div class="guide-dialog-actions"><button type="button" class="guide-secondary" id="guideMessageCancel">Cancel</button><button type="submit" class="guide-primary">Continue to WhatsApp <span>→</span></button></div></form>';
    document.body.append(modal);

    const fab=q('#guideHelpFab'), panel=q('#guideHelpPanel');
    fab.addEventListener('click', () => {
      const open=panel.hidden;
      panel.hidden=!open;
      fab.setAttribute('aria-expanded',String(open));
      if(open) q('.guide-tool-close',panel).focus();
    });
    q('.guide-tool-close',panel).addEventListener('click', closePanel);
    function closePanel(){ panel.hidden=true; fab.setAttribute('aria-expanded','false'); }
    panel.addEventListener('click', async event => {
      const button=event.target.closest('[data-guide-tool]'); if(!button)return;
      const action=button.dataset.guideTool;
      if(action==='share'){closePanel();await shareGuide();return;}
      openMessage(action);
    });
    q('#guideMessageClose').addEventListener('click',()=>modal.close());
    q('#guideMessageCancel').addEventListener('click',()=>modal.close());
    modal.addEventListener('click',event=>{if(event.target===modal)modal.close();});
    q('#guideMessageForm').addEventListener('submit',event=>{
      event.preventDefault();
      const text=q('#guideMessageText').value.trim();
      if(!text){q('#guideMessageText').focus();return;}
      const kind=q('#guideMessageType').value;
      const message=[
        'Social Protection Services Support Guide — '+(kind==='Feedback'?'Feedback':'Report / feedback'),
        'Page: '+pageName(),
        'Topic: '+kind,
        'Message: '+text,
        'Page link: '+location.href,
        'Device view: '+window.innerWidth+' × '+window.innerHeight,
        'Date: '+new Date().toLocaleString()
      ].join('\n');
      window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
      modal.close();
    });
    function openMessage(action){
      closePanel();
      q('#guideMessageTitle').textContent=action==='report'?'Report an issue':'Send feedback';
      q('#guideMessageIntro').textContent=action==='report'
        ?'Tell us what is not working or which guide detail needs checking. Your WhatsApp app will open with a draft for you to review.'
        :'Tell us what would make this guide more useful. Your WhatsApp app will open with a draft for you to review.';
      q('#guideMessageType').value=action==='report'?'Technical issue':'Feedback';
      q('#guideMessageText').value='';
      modal.showModal();
      setTimeout(()=>q('#guideMessageText').focus(),80);
    }
    async function shareGuide(){
      const shareData={title:'Social Protection Services Support Guide · Jamaica',text:'Explore Jamaica’s Social Protection Services Support Guide by service, parish, and need.',url:GUIDE_URL};
      if(navigator.share){
        try{await navigator.share(shareData);return;}catch(error){if(error?.name==='AbortError')return;}
      }
      try{
        await navigator.clipboard.writeText(GUIDE_URL);
        showToast('Guide link copied. You can now share it.');
      }catch(error){
        const wa='https://wa.me/?text='+encodeURIComponent(shareData.text+' '+GUIDE_URL);
        window.open(wa,'_blank','noopener,noreferrer');
      }
    }
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