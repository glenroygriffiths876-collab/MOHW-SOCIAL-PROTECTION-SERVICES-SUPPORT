/* MOHW Social Support: premium accessibility settings, preserving Phase II actions. */
(()=>{
'use strict';
const paths={
listen:'<path d="M3 13v-2a9 9 0 0 1 18 0v2M3 12H1v8h5v-8H3Zm18 0h2v8h-5v-8h3Z"/>',
display:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
comfort:'<path d="M4 6h16M7 12h10M10 18h4"/><circle cx="4" cy="6" r="1"/><circle cx="7" cy="12" r="1"/>',
communicate:'<path d="M4 4h16v13H9l-5 4V4Z"/><path d="M8 9h8m-8 4h6"/>',
page:'<path d="M5 3h10l5 5v13H5V3Z"/><path d="M14 3v6h6M8 13h8m-8 4h6"/>',
book:'<path d="M12 6C8 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>',
pause:'<path d="M7 4v16M17 4v16"/>',
play:'<path d="m6 3 15 9-15 9V3Z"/>',
stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
contrast:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18Z"/>',
links:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',
motion:'<path d="M4 12h16M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
spacing:'<path d="M4 6h16M4 12h16M4 18h16"/>',
text:'<path d="M4 5h16M12 5v15M7 20h10"/>',
speed:'<path d="M4 17a9 9 0 1 1 16 0M12 15l5-7"/>',
voice:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
keyboard:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m3 0h1m3 0h1M7 16h10"/>',
reset:'<path d="M3 12a9 9 0 1 0 3-7M3 4v5h5"/>'
};
const ico=k=>'<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[k]+'</svg>';
const feature=(action,k,title,desc)=>'<button class="a3-feature" type="button" data-p2="'+action+'"><span class="a3-feature-icon">'+ico(k)+'</span><strong>'+title+'</strong><small>'+desc+'</small></button>';
const toggle=(pref,k,title,desc)=>'<label class="a3-toggle"><span class="a3-toggle-icon">'+ico(k)+'</span><span class="a3-toggle-words"><strong>'+title+'</strong><small>'+desc+'</small></span><input type="checkbox" data-pref="'+pref+'" role="switch"><span class="a3-switch" aria-hidden="true"></span></label>';
function mount(){
 const d=document.getElementById('p2-access-dialog');
 if(!d||d.classList.contains('a3-accessibility'))return;
 const controls={};d.querySelectorAll('[data-pref]').forEach(el=>controls[el.dataset.pref]=el);
 const jsl=d.querySelector('#p2-jsl');
 if(!controls.size||!controls.rate||!controls.voice||!jsl)return;
 const tabs=[['listen','Listen'],['display','Text'],['comfort','Comfort'],['communicate','Communicate']];
 d.classList.add('a3-accessibility');
 d.innerHTML=[
 '<div class="a3-shell"><header class="a3-header">',
 '<span class="a3-brand-icon">'+ico('listen')+'</span><div class="a3-brand"><small>MOHW SOCIAL SUPPORT · JAMAICA</small><h2 id="p2-access-title">Accessibility <em>& Listening</em></h2></div>',
 '<button type="button" data-p2="close" class="a3-close" aria-label="Close accessibility settings">×</button></header>',
 '<nav class="a3-tabs" role="tablist" aria-label="Accessibility sections">',
 tabs.map((v,i)=>'<button type="button" role="tab" id="a3-tab-'+v[0]+'" data-a3-tab="'+v[0]+'" aria-controls="a3-panel-'+v[0]+'" aria-selected="'+(i===0)+'" tabindex="'+(i===0?0:-1)+'"><span>'+ico(v[0])+'</span>'+v[1]+'</button>').join(''),
 '</nav><div class="a3-content">',
 '<section class="a3-panel" role="tabpanel" id="a3-panel-listen" aria-labelledby="a3-tab-listen" data-a3-panel="listen">',
 '<div class="a3-intro"><strong>Listen your way</strong><small>Audio guidance, whenever you need it</small></div>',
 '<div class="a3-features">',feature('read-page','page','Read this page','Listen to this screen'),feature('read-guide','book','Read the guide','Hear the guide content'),'</div>',
 '<div class="a3-playback" role="group" aria-label="Audio playback">',
 '<button data-p2="pause" type="button">'+ico('pause')+' Pause</button>',
 '<button data-p2="resume" type="button">'+ico('play')+' Resume</button>',
 '<button data-p2="stop" type="button">'+ico('stop')+' Stop</button></div>',
 '<div class="a3-audio-controls">',
 '<div class="a3-speed"><span class="a3-label">'+ico('speed')+' Reading speed</span>',
 '<div class="a3-chips" role="group" aria-label="Reading speed">',
 '<button type="button" data-a3-choice="rate" data-value="0.75">Slow</button><button type="button" data-a3-choice="rate" data-value="1">Normal</button><button type="button" data-a3-choice="rate" data-value="1.25">Fast</button>',
 '</div><span class="a3-native" data-a3-slot="rate"></span></div>',
 '<label class="a3-voice"><span class="a3-label">'+ico('voice')+' Voice</span><span data-a3-slot="voice"></span></label></div></section>',
 '<section class="a3-panel" role="tabpanel" id="a3-panel-display" aria-labelledby="a3-tab-display" data-a3-panel="display" hidden>',
 '<div class="a3-intro"><strong>Make words clearer</strong><small>Comfortable reading on any screen</small></div>',
 '<div class="a3-size"><span class="a3-label">'+ico('text')+' Text size</span>',
 '<div class="a3-chips a3-size-chips" role="group" aria-label="Text size">',
 '<button type="button" data-a3-choice="size" data-value="normal">Standard</button><button type="button" data-a3-choice="size" data-value="large">Large</button><button type="button" data-a3-choice="size" data-value="xlarge">Extra large</button>',
 '</div><span class="a3-native" data-a3-slot="size"></span></div>',
 '<div class="a3-toggles">',
 toggle('contrast','contrast','High contrast','Stronger text and outlines'),
 toggle('links','links','Underline links','Make links easy to spot'),
 '</div></section>',
 '<section class="a3-panel" role="tabpanel" id="a3-panel-comfort" aria-labelledby="a3-tab-comfort" data-a3-panel="comfort" hidden>',
 '<div class="a3-intro"><strong>A calmer experience</strong><small>Change motion and spacing to suit you</small></div>',
 '<div class="a3-toggles">',
 toggle('motion','motion','Reduce motion','Minimise animations'),
 toggle('spacing','spacing','Text spacing','More space between words and lines'),
 '</div><p class="a3-tip">Your preferences are saved on this device and apply throughout the guide.</p></section>',
 '<section class="a3-panel" role="tabpanel" id="a3-panel-communicate" aria-labelledby="a3-tab-communicate" data-a3-panel="communicate" hidden>',
 '<div class="a3-intro"><strong>Communication choices</strong><small>Get help without relying on sound</small></div>',
 '<div class="a3-features">',
 feature('gia','communicate','Type to GIA','Written support and guidance'),
 feature('welcome','keyboard','Introduction','Read the written welcome'),
 '</div><p class="a3-tip">Written guidance is available throughout the platform. Jamaican Sign Language resources are published only after qualified review.</p>',
 '<div data-a3-slot="jsl" class="a3-jsl"></div></section>',
 '</div><footer class="a3-footer"><span>YOUR EXPERIENCE · YOUR CHOICE</span>',
 '<button type="button" class="a3-reset" data-p2="reset">'+ico('reset')+' Reset</button>',
 '<button type="button" class="a3-done" data-p2="close">Done ✓</button></footer></div>'
 ].join('');
 for(const k of ['size','rate','voice'])d.querySelector('[data-a3-slot="'+k+'"]').append(controls[k]);
 d.querySelector('[data-a3-slot="jsl"]').append(jsl);
 for(const k of ['contrast','links','motion','spacing'])d.querySelector('[data-pref="'+k+'"]').checked=!!controls[k]?.checked;
 let currentTab='listen';
 const tabButtons=[...d.querySelectorAll('[data-a3-tab]')];
 const sync=()=>{
  for(const b of d.querySelectorAll('[data-a3-choice]')){
   const sel=d.querySelector('[data-pref="'+b.dataset.a3Choice+'"]');
   b.setAttribute('aria-pressed',String(sel?.value===b.dataset.value));
  }
  for(const el of d.querySelectorAll('.a3-toggle'))el.classList.toggle('is-on',el.querySelector('input').checked);
 };
 function show(key){
  currentTab=key;
  d.querySelectorAll('[data-a3-panel]').forEach(p=>p.hidden=p.dataset.a3Panel!==key);
  tabButtons.forEach(b=>{const on=b.dataset.a3Tab===key;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
 }
 tabButtons.forEach((b,i)=>{
  b.addEventListener('click',()=>show(b.dataset.a3Tab));
  b.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();
   const n=e.key==='Home'?0:e.key==='End'?tabButtons.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabButtons.length)%tabButtons.length;
   tabButtons[n].click();tabButtons[n].focus();
  });
 });
 d.querySelectorAll('[data-a3-choice]').forEach(b=>b.addEventListener('click',()=>{
  const el=d.querySelector('[data-pref="'+b.dataset.a3Choice+'"]');
  el.value=b.dataset.value;el.dispatchEvent(new Event('change',{bubbles:true}));sync();
 }));
 d.addEventListener('change',e=>{if(e.target.matches('[data-pref]'))sync()});
 d.addEventListener('click',e=>{
  const action=e.target.closest('[data-p2]')?.dataset.p2;
  if(action==='reset')queueMicrotask(sync);
  if(action==='gia'||action==='welcome')d.close();
 });
 new MutationObserver(()=>{if(d.open){sync();show(currentTab)}}).observe(d,{attributes:true,attributeFilter:['open']});
 show(currentTab);sync();
 window.MOHWAccessibilityPremium={dialog:d,openTab:key=>{show(key);if(!d.open)d.showModal()}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
