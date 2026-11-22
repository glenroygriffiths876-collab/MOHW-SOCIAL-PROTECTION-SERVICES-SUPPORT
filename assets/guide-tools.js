(() => {
  'use strict';
  const FEEDBACK_EMAIL = 'beginningconcepts.org@gmail.com';
  const GUIDE_URL = window.MOHW_CONFIG?.canonicalUrl || new URL('./',location.href).href;
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
    const home=q('#view-about');if(home&&!q('#bc-home-credit')){const credit=document.createElement('a');credit.id='bc-home-credit';credit.href='https://beginningconcepts.org/';credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent='Created by Beginning Concepts';credit.setAttribute('aria-label','Created by Beginning Concepts — visit business website');home.append(credit);}
    if(q('#guideActionDock'))return;
    const dock=document.createElement('nav');dock.id='guideActionDock';dock.className='guide-action-dock';dock.setAttribute('aria-label','Guide actions');
    dock.innerHTML='<button class="guide-action share" data-action="share" aria-label="Share this guide" title="Share"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="23.5" cy="7.5" r="4"/><circle cx="8.5" cy="16" r="4"/><circle cx="23.5" cy="24.5" r="4"/><path d="m12 14 7.5-4M12 18l7.5 4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span>Share</span></button><button class="guide-action issue" data-action="issue" aria-label="Report an issue" title="Report an issue"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 27V5m1 1h15l-4 5 4 5H9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Report</span></button><button class="guide-action feedback" data-action="feedback" aria-label="Message or send feedback" title="Message"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7h22v16H15l-7 5v-5H5z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 15h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span>Message</span></button><button class="guide-action download" data-action="download" aria-label="Read or download the manual" title="Download the manual"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v16m0 0-6-6m6 6 6-6M6 23v4h20v-4" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Download</span></button>'
    document.body.append(dock);
    const logo='assets/mohw-official-logo.png';
    const share=document.createElement('dialog');share.id='guideShareDialog';share.className='guide-message-dialog guide-share-dialog';share.setAttribute('aria-labelledby','guideShareTitle');
    share.innerHTML='<div class="guide-dialog-head"><div class="guide-share-brand"><img src="'+logo+'" alt="Ministry of Health &amp; Wellness"><div><span class="guide-tool-kicker">JAMAICA · MOHW</span><h2 id="guideShareTitle">Share this guide</h2></div></div><button class="guide-tool-close" data-close aria-label="Close">×</button></div><p class="guide-message-intro">Help someone find social protection services and referral information.</p><div class="guide-share-options"><button data-share="native"><span>↗</span><b>Share link</b><small>Open your device’s sharing options</small></button><button data-share="copy"><span>⧉</span><b>Copy link</b><small>Copy the guide address</small></button><button data-share="whatsapp"><span>◉</span><b>WhatsApp</b><small>Send the guide link in a message</small></button><button data-share="qr"><span>▦</span><b>QR code</b><small>Let someone scan this guide</small></button></div><div class="guide-share-url"><span id="guideShareUrl"></span><button data-share="copy">Copy</button></div><div class="guide-share-qr" id="guideShareQr" hidden><img alt="QR code linking to the Social Protection Services Support Guide"><p>Scan with a phone camera to open the guide.</p></div>';
    document.body.append(share);
    const message=document.createElement('dialog');message.id='guideMessageDialog';message.className='guide-message-dialog';message.setAttribute('aria-labelledby','guideMessageTitle');
    message.innerHTML='<form id="guideMessageForm"><div class="guide-dialog-head"><div class="guide-share-brand"><img src="'+logo+'" alt=""><div><span class="guide-tool-kicker">MOHW SOCIAL PROTECTION GUIDE</span><h2 id="guideMessageTitle">Send feedback</h2></div></div><button type="button" class="guide-tool-close" data-close aria-label="Close">×</button></div><p class="guide-message-intro" id="guideMessageIntro"></p><label class="guide-field-label" for="guideMessageType">What is this about?</label><select id="guideMessageType"><option>Feedback</option><option>Incorrect or outdated information</option><option>Broken link or contact</option><option>Technical issue</option><option>Accessibility suggestion</option><option>Other suggestion</option></select><label class="guide-field-label" for="guideMessageText">Your message</label><textarea id="guideMessageText" rows="5" maxlength="1200" placeholder="Tell us what happened or what would make the guide better." required></textarea><p class="guide-privacy-note">Please do not include anyone’s name, health details, or other private information. Your email app will open with this message. Review the content and recipient before sending.</p><div class="guide-dialog-actions"><button type="button" class="guide-secondary" data-close>Cancel</button><button type="submit" class="guide-primary">Continue to email <span>→</span></button></div></form>';
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
    dock.addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a==='share'){q('#guideShareQr').hidden=true;open(share);}if(a==='issue')report(true);if(a==='feedback')report(false);if(a==='download'){const manual=document.querySelector('#mainNav [data-nav="manual"]');if(manual)manual.click();else location.hash='#manual';}});
    share.addEventListener('click',async e=>{const a=e.target.closest('[data-share]')?.dataset.share;if(!a)return;if(a==='native'){close(share);await nativeShare();}if(a==='copy')await copy();if(a==='whatsapp')window.open('https://wa.me/?text='+encodeURIComponent(shareData.text+' '+shareUrl),'_blank','noopener,noreferrer');if(a==='qr'){const box=q('#guideShareQr');box.hidden=false;const img=box.querySelector('img');if(!img.src)img.src='https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data='+encodeURIComponent(shareUrl);}});
    [share,message,install].forEach(d=>d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))close(d);}));
    q('#guideMessageForm').addEventListener('submit',e=>{e.preventDefault();const text=q('#guideMessageText').value.trim();if(!text){q('#guideMessageText').focus();return;}const topic=q('#guideMessageType').value;const body=['MOHW Social Protection Services Support Guide — '+q('#guideMessageTitle').textContent,'Page: '+pageName(),'Topic: '+topic,'Message: '+text,'Page link: '+new URL(location.hash||'#about', GUIDE_URL).href,'Device view: '+innerWidth+' × '+innerHeight,'Date: '+new Date().toLocaleString()].join('\\n');const subject='MOHW Social Protection Guide — '+topic;const emailUrl='mailto:'+FEEDBACK_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);window.location.href=emailUrl;close(message);showToast('Email app requested. Review and send your message there.');});
    q('#guideInstallNow').addEventListener('click',async()=>{if(deferred){const p=deferred;deferred=null;close(install);try{await p.prompt();await p.userChoice;}catch{}}else close(install);});
  }

  function showToast(message){
    let toast=q('#guideToolToast');
    if(!toast){toast=document.createElement('div');toast.id='guideToolToast';toast.className='guide-tool-toast';toast.setAttribute('role','status');document.body.append(toast);}
    toast.textContent=message;toast.classList.add('show');
    clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2800);
  }

  // GIA is mounted by gia-next.js; keep this file for share and feedback tools.
  document.addEventListener('DOMContentLoaded', mountHelp, {once:true});
})();
