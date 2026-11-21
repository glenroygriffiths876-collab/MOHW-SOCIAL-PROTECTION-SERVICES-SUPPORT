/* Premium MOHW accessibility dashboard; retains the original Phase II event handlers. */
(()=>{'use strict';
function install(){
const d=document.getElementById('p2-access-dialog');if(!d||d.dataset.premium==='yes')return;
const pref=k=>d.querySelector('[data-pref="'+k+'"]');
const controls=Object.fromEntries(['size','rate','voice','contrast','motion','spacing','links'].map(k=>[k,pref(k)]));
if(Object.values(controls).some(v=>!v))return;
const jsl=d.querySelector('#p2-jsl');
const paths={
access:'<circle cx="12" cy="4" r="2"/><path d="M4 9h16m-8-3v7m0 0-5 8m5-8 5 8"/>',
display:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4M9 14l3-6 3 6m-5-2h4"/>',
listen:'<path d="M4 13v-2a8 8 0 0 1 16 0v2M4 12H2v7a3 3 0 0 0 3 3h2v-9H4Zm16 0h2v7a3 3 0 0 1-3 3h-2v-9h3Z"/>',
support:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
contrast:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18Z"/>',
motion:'<path d="M3 12h12M7 7h12M7 17h12m-4-8 3 3-3 3"/>',
spacing:'<path d="M4 5h16M4 19h16M8 9h8m-8 6h8M5 8l-2 4 2 4m14-8 2 4-2 4"/>',
links:'<path d="M10 13a5 5 0 0 0 7.1 0l2.5-2.5a5 5 0 0 0-7.1-7.1L11 5M14 11a5 5 0 0 0-7.1 0l-2.5 2.5a5 5 0 0 0 7.1 7.1L13 19"/>',
page:'<path d="M5 4h11l4 4v12H5Zm11 0v5h4M8 13h8m-8 4h8"/>',
book:'<path d="M12 6C8 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>',
voice:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0m-7 7v4m-5 0h10"/>',
stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
chat:'<path d="M4 4h16v13H9l-5 4V4Zm4 5h8m-8 4h5"/>',
close:'<path d="M5 5 19 19M19 5 5 19"/>',
reset:'<path d="M4 11a8 8 0 1 1 2 7M4 5v6h6"/>',
check:'<path d="m5 12 4 4 10-10"/>'};
const icon=k=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[k]+'</svg>';
const toggle=(key,name,detail,k)=>'<label class="ax-toggle" data-ax-toggle="'+key+'"><span class="ax-icon">'+icon(k)+'</span><span class="ax-toggle-copy"><strong>'+name+'</strong><small>'+detail+'</small></span><span class="ax-track" aria-hidden="true"><i></i></span><span data-ax-slot="'+key+'"></span></label>';
const segment=(key,val,head,desc='')=>'<button type="button" data-ax-pref="'+key+'" data-ax-value="'+val+'" aria-pressed="false"><span>'+head+'</span>'+(desc?'<b>'+desc+'</b>':'')+'</button>';
d.innerHTML='<div class="ax-shell">'+
'<header class="ax-head"><span class="ax-feature">'+icon('access')+'</span><div class="ax-head-copy"><small>MOHW · JAMAICA</small><h2 id="p2-access-title">Accessibility <em>& Listening</em></h2><p>Make the guide work for you</p></div><button type="button" class="ax-close" data-p2="close" aria-label="Close accessibility settings">'+icon('close')+'</button></header>'+
'<nav class="ax-tabs" role="tablist" aria-label="Accessibility options">'+
[['display','Display'],['listen','Listen'],['support','Support']].map(([id,name])=>'<button type="button" role="tab" id="ax-tab-'+id+'" aria-controls="ax-panel-'+id+'" aria-selected="'+(id==='display')+'" tabindex="'+(id==='display'?'0':'-1')+'" data-ax-tab="'+id+'">'+icon(id)+'<span>'+name+'</span></button>').join('')+'</nav>'+
'<div class="ax-panels">'+
'<section class="ax-panel" data-ax-panel="display" id="ax-panel-display" role="tabpanel" aria-labelledby="ax-tab-display"><div class="ax-label"><strong>TEXT SIZE</strong><small>Choose your preferred size</small></div><div class="ax-segments ax-size" role="group" aria-label="Text size">'+segment('size','normal','A','Standard')+segment('size','large','A+','Large')+segment('size','xlarge','A++','Extra large')+'</div><div class="ax-label"><strong>VISUAL COMFORT</strong><small>Tap to adjust</small></div><div class="ax-switches">'+toggle('contrast','High contrast','Clearer colours','contrast')+toggle('motion','Reduce motion','Less animation','motion')+toggle('spacing','Text spacing','More breathing room','spacing')+toggle('links','Underline links','Spot links easily','links')+'</div><span class="ax-proxy-slot" data-ax-slot="size"></span></section>'+
'<section class="ax-panel" data-ax-panel="listen" id="ax-panel-listen" role="tabpanel" aria-labelledby="ax-tab-listen" hidden><div class="ax-label"><strong>READ ALOUD</strong><small>Start listening at any time</small></div><div class="ax-reading-actions"><button type="button" data-p2="read-page"><span class="ax-icon">'+icon('page')+'</span><span><strong>Read this page</strong><small>Listen from here</small></span></button><button type="button" data-p2="read-guide"><span class="ax-icon">'+icon('book')+'</span><span><strong>Read the guide</strong><small>Listen to the content</small></span></button></div><div class="ax-label"><strong>READING SPEED</strong><small>Set the pace</small></div><div class="ax-segments ax-speed" role="group" aria-label="Reading speed">'+segment('rate','0.75','Slower')+segment('rate','1','Normal')+segment('rate','1.25','Faster')+'</div><label class="ax-voice-label" for="ax-voice-select"><span>'+icon('voice')+' Reading voice</span><span data-ax-slot="voice"></span></label><button type="button" class="ax-stop" data-p2="stop">'+icon('stop')+' Stop audio</button><span class="ax-proxy-slot" data-ax-slot="rate"></span></section>'+
'<section class="ax-panel" data-ax-panel="support" id="ax-panel-support" role="tabpanel" aria-labelledby="ax-tab-support" hidden><div class="ax-label"><strong>COMMUNICATION</strong><small>Choose how to get help</small></div><div class="ax-support-cards"><article><span class="ax-icon">'+icon('chat')+'</span><strong>Type to GIA</strong><small>Ask questions without speaking</small><button type="button" data-ax-action="gia">Open GIA</button></article><article><span class="ax-icon">'+icon('book')+'</span><strong>Written guide</strong><small>Read instructions at your pace</small><button type="button" data-ax-action="manual">Read manual</button></article></div><p class="ax-support-note"><b>Deaf and hard-of-hearing access:</b> Typed questions and written information are available. Jamaican Sign Language media requires interpreter and community review before publication.</p><div class="ax-jsl" data-ax-slot="jsl"></div></section>'+
'</div><footer class="ax-footer"><button type="button" class="ax-reset" data-p2="reset">'+icon('reset')+' Reset</button><small>'+icon('check')+' Saved on this device</small><button type="button" class="ax-done" data-p2="close">Done</button></footer></div>';
for(const [key,control] of Object.entries(controls)){
 const marker=d.querySelector('[data-ax-slot="'+key+'"]');if(!marker)throw Error('Accessibility slot missing: '+key);
 control.classList.add(key==='voice'?'ax-voice-select':'ax-hidden-pref');
 if(key==='voice')control.id='ax-voice-select';marker.replaceWith(control);
}
if(jsl)d.querySelector('[data-ax-slot="jsl"]')?.append(jsl);
d.dataset.premium='yes';
function tab(name,focus=false){
 d.querySelectorAll('[data-ax-tab]').forEach(b=>{const active=b.dataset.axTab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active&&focus)b.focus();});
 d.querySelectorAll('[data-ax-panel]').forEach(panel=>panel.hidden=panel.dataset.axPanel!==name);
}
function update(){
 d.querySelectorAll('[data-ax-pref]').forEach(b=>{
 const active=String(controls[b.dataset.axPref].value)===b.dataset.axValue;
 b.setAttribute('aria-pressed',String(active));
 });
 for(const key of ['contrast','motion','spacing','links'])d.querySelector('[data-ax-toggle="'+key+'"]')?.classList.toggle('is-on',controls[key].checked);
}
d.addEventListener('click',e=>{
 const t=e.target.closest('[data-ax-tab]');
 if(t){tab(t.dataset.axTab);return}
 const s=e.target.closest('[data-ax-pref]');
 if(s){const input=controls[s.dataset.axPref];input.value=s.dataset.axValue;input.dispatchEvent(new Event('change',{bubbles:true}));update();return}
 const action=e.target.closest('[data-ax-action]')?.dataset.axAction;
 if(action==='gia'){d.close();if(window.MOHWGIA?.open)window.MOHWGIA.open();else document.getElementById('gia2Launcher')?.click();}
 if(action==='manual'){d.close();document.querySelector('#mainNav [data-nav="manual"]')?.click();}
});
d.querySelector('.ax-tabs').addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
 const tabs=[...d.querySelectorAll('[data-ax-tab]')],idx=tabs.findIndex(x=>x.getAttribute('aria-selected')==='true');
 const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(idx+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tab(tabs[next].dataset.axTab,true);
});
d.addEventListener('change',update);
document.addEventListener('click',e=>{if(e.target.closest('[data-p2="access"],[data-p2="reset"]'))queueMicrotask(update)});
update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();