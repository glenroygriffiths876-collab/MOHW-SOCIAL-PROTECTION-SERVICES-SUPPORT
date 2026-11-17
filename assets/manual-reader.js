(()=>{'use strict';
const root=document.getElementById('manual-reader');if(!root)return;
const $=id=>document.getElementById('manual-'+id),stage=$('stage'),book=$('book'),scroll=$('scroll'),status=$('status'),retry=$('retry'),loadNote=$('load-note'),welcome=$('welcome'),download=$('download'),native=$('native');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const options=$('options'),fullButton=$('full');
const fullMode=()=>document.fullscreenElement===root||root.classList.contains('manual-fullscreen');
const canSpread=()=>scroll.clientWidth>=760&&(!fullMode()||scroll.clientHeight>=440);
function closeTools(focus=false){if(options?.open){options.open=false;if(focus)options.querySelector('summary')?.focus()}}
$('close-options')?.addEventListener('click',()=>closeTools(true));
function fullLabel(){const on=fullMode();fullButton.textContent=on?'Exit':'Full screen';fullButton.setAttribute('aria-label',on?'Exit full screen':'Enter full screen');fullButton.title=on?'Exit full screen':'Enter full screen';fullButton.setAttribute('aria-pressed',String(on))}

let doc=null,loading=null,blobUrl=null,sourceName='',page=1,zoom=1,two=true,sound=false,audio=null,paperBuffer=null,epoch=0,renderEpoch=0,busy=false,libPromise=null,autoTried=false,activeJobs=[];
const say=t=>status.textContent=t;
let spokenGeneration=0; const textBox=document.getElementById('p2-manual-transcript'),audioStatus=document.getElementById('p2-manual-status');
function stopReading(){spokenGeneration++;window.MOHWAudio?.stop('manual')}
async function pageText(n,source){const p=await source.getPage(n);const c=await p.getTextContent();return c.items.map(i=>i.str||'').join(' ').replace(/\s+/g,' ').trim()}
async function readManual(all){if(!doc||!window.MOHWAudio){audioStatus.textContent='The manual is not ready for audio. Try again after it opens.';return}stopReading();const generation=spokenGeneration,source=doc;for(let n=page;n<=(all?source.numPages:targets().at(-1));n++){try{const text=await pageText(n,source);if(generation!==spokenGeneration||doc!==source)return;if(!text){audioStatus.textContent='Page '+n+' has no extractable text. An approved accessible transcript is needed.';if(!all)return;continue}audioStatus.textContent='Reading page '+n+' of '+source.numPages;if(!textBox.hidden)textBox.textContent='Page '+n+' — '+text;const finished=await window.MOHWAudio.read('Page '+n+'. '+text,'manual');if(!finished||generation!==spokenGeneration)return}catch(_){audioStatus.textContent='Page text could not be read. Try the accessible guide content instead.';return}}if(generation===spokenGeneration)audioStatus.textContent='Reading finished. Pages without extractable text require an approved transcript.'}
const transcriptButton=document.getElementById('p2-manual-text');async function updateTranscript(){if(!doc||textBox.hidden)return;const source=doc,at=page;try{const texts=await Promise.all(targets().map(async n=>'Page '+n+' — '+((await pageText(n,source))||'No extractable text; an approved transcript is required.')));if(source===doc&&at===page)textBox.textContent=texts.join('\n\n')}catch(_){textBox.textContent='Text is unavailable for this page.'}}
 document.getElementById('p2-manual-page').onclick=()=>readManual(false);document.getElementById('p2-manual-all').onclick=()=>readManual(true);transcriptButton.onclick=()=>{textBox.hidden=!textBox.hidden;transcriptButton.setAttribute('aria-expanded',String(!textBox.hidden));transcriptButton.textContent=textBox.hidden?'Show page text':'Hide page text';updateTranscript()};document.getElementById('p2-manual-print').onclick=()=>{if(blobUrl)window.open(blobUrl,'_blank','noopener');else audioStatus.textContent='Open the manual first.'};const alive=()=>!!doc;
const library=()=>{if(!libPromise)libPromise=import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs').then(lib=>{lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';return lib}).catch(e=>{libPromise=null;throw e});return libPromise};
function stopJobs(){activeJobs.forEach(t=>{try{t.cancel()}catch(_){}});activeJobs=[]}
function release(){stopReading();if(textBox)textBox.textContent='';epoch++;renderEpoch++;stopJobs();if(loading){try{Promise.resolve(loading.destroy()).catch(()=>{})}catch(_){}loading=null}doc=null;if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null}book.replaceChildren();download.removeAttribute('href');native.removeAttribute('href');busy=false}
function controls(){const total=doc?.numPages||0,spread=two&&canSpread(),second=spread&&page>1&&page<total;const label='Page '+page+(second?'–'+(page+1):'')+' / '+total;$('count').textContent=label;$('number').max=String(total||1);$('number').value=String(page);$('layout').textContent=spread?'One page':canSpread()?'Two pages':'Two pages (wide screens)';$('layout').title=canSpread()?'Change page layout':'Two-page view is available when the reading area is wide enough';$('layout').setAttribute('aria-pressed',String(spread));for(const id of ['prev','prev-bottom'])$(id).disabled=!total||busy||page<=1;for(const id of ['next','next-bottom'])$(id).disabled=!total||busy||page+(second?1:0)>=total;for(const id of ['go','minus','plus','fit','layout'])$(id).disabled=!total||busy;$('minus').disabled=!total||busy||zoom<=.75;$('plus').disabled=!total||busy||zoom>=2.5;$('layout').disabled=!total||busy||!canSpread();root.classList.toggle('manual-zoomed',zoom>1)}
/* Short, layered paper texture: broad, softly filtered noise with irregular
   dry fibre transients, a smooth sweeping envelope and no periodic flutter.
   Stereo motion follows the direction of the page turn when supported. */
function paperTexture(ctx){
 const length=Math.floor(ctx.sampleRate*.56),buffer=ctx.createBuffer(1,length,ctx.sampleRate),out=buffer.getChannelData(0);
 let low=0,fast=0,slow=0;
 const grains=[[.09,.018,.17],[.17,.032,.20],[.27,.024,.12],[.35,.020,.14],[.44,.014,.16]];
 for(let i=0;i<length;i++){
  const t=i/ctx.sampleRate,x=Math.random()*2-1,y=Math.random()*2-1;
  low=.94*low+.06*x;fast=.48*fast+.52*y;slow=.84*slow+.16*fast;
  const broad=Math.pow(Math.sin(Math.PI*Math.min(1,t/.56)),1.7);
  const sweep=(.65+.35*Math.min(1,t/.20))*(1-.45*Math.max(0,(t-.26)/.30));
  let fibre=0;for(const [at,width,weight] of grains)fibre+=weight*Math.exp(-Math.pow((t-at)/width,2));
  out[i]=(low*.64+(fast-slow)*(.33+fibre))*broad*sweep;
 }
 return buffer;
}
function rustle(direction){
 if(!sound||!audio||audio.state!=='running'||window.MOHWAudio?.active())return;
 try{
  const t=audio.currentTime,src=audio.createBufferSource(),hp=audio.createBiquadFilter(),lp=audio.createBiquadFilter(),gain=audio.createGain();
  if(!paperBuffer)paperBuffer=paperTexture(audio);src.buffer=paperBuffer;
  hp.type='highpass';hp.frequency.value=310;hp.Q.value=.55;
  lp.type='lowpass';lp.Q.value=.55;lp.frequency.setValueAtTime(1500,t);lp.frequency.linearRampToValueAtTime(3600,t+.21);lp.frequency.linearRampToValueAtTime(1300,t+.56);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.43,t+.06);gain.gain.linearRampToValueAtTime(.36,t+.28);gain.gain.linearRampToValueAtTime(0,t+.56);
  src.connect(hp);hp.connect(lp);lp.connect(gain);
  let pan=null;
  if(typeof audio.createStereoPanner==='function'){
   pan=audio.createStereoPanner();const side=direction<0?1:-1;
   pan.pan.setValueAtTime(side*.72,t);pan.pan.linearRampToValueAtTime(-side*.72,t+.52);gain.connect(pan);pan.connect(audio.destination);
  }else gain.connect(audio.destination);
  src.onended=()=>{for(const node of [src,hp,lp,gain,pan])node?.disconnect()};src.start(t);
 }catch(_){}
}
$('sound').onclick=async()=>{try{if(!sound){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error();audio=audio||new AC();await audio.resume();sound=true}else sound=false;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound))}catch(_){say('Sound is unavailable on this browser.')}};
/* The only readable PDF is the bundled programme guide. No local picker. */
async function loadApproved(){
 release();const ticket=epoch;page=1;zoom=1;sourceName='MOHW_Social_Protection_Guide_Concept_Full.pdf';
 welcome.hidden=false;stage.hidden=true;retry.hidden=true;retry.disabled=true;loadNote.hidden=false;loadNote.lastChild.textContent=' Opening the guide automatically…';say('Loading the illustrated guide…');
 try{
  const manifestPath=root.dataset.approvedPdf;
  if(manifestPath!=='assets/manual/manifest.json')throw Error('Approved guide unavailable');
  const response=await fetch(manifestPath,{cache:'no-store'});if(!response.ok)throw Error('Guide unavailable');
  const m=await response.json();if(!Array.isArray(m.parts)||!m.parts.length||!m.parts.every(p=>/^assets\/manual\/part-\d{2}\.bin$/.test(p)))throw Error('Guide parts unavailable');
  const chunks=await Promise.all(m.parts.map(async p=>{const r=await fetch(p);if(!r.ok)throw Error('Guide unavailable');return r.arrayBuffer()}));
  const blob=new Blob(chunks,{type:'application/pdf'});if(ticket!==epoch)return;
  if(blob.size!==m.byteLength||blob.size>100*1024*1024)throw Error('Guide file incomplete');
  const signature=await blob.slice(0,1024).text();if(!signature.includes('%PDF-'))throw Error('Invalid guide');
  if(ticket!==epoch)return;
  blobUrl=URL.createObjectURL(blob);download.href=blobUrl;download.download=sourceName;native.href=blobUrl;welcome.hidden=true;stage.hidden=false;controls();say('Opening the manual…');
  const lib=await library();if(ticket!==epoch)return;const bytes=new Uint8Array(await blob.arrayBuffer());if(ticket!==epoch)return;loading=lib.getDocument({data:bytes,isEvalSupported:false,enableXfa:false});doc=await loading.promise;if(ticket!==epoch)return;await paint(0);
 }catch(e){
  if(ticket!==epoch)return;console.warn('Manual reader:',e);busy=false;controls();
  if(blobUrl){say('Flipbook unavailable. Use Open searchable PDF or Download PDF below.')}
  else{release();stage.hidden=true;welcome.hidden=false;loadNote.hidden=true;retry.hidden=false;retry.disabled=false;say('The guide could not be loaded. Check your connection and retry.')}
 }
}
function align(n){const max=doc.numPages;n=Math.max(1,Math.min(max,Math.trunc(n)||1));return two&&canSpread()&&n>1?n-n%2:n}
function targets(){return two&&canSpread()&&page>1&&page<doc.numPages?[page,page+1]:[page]}
async function paint(direction){if(!doc)return;const task=++renderEpoch,documentRef=doc;stopJobs();busy=true;controls();const old=direction?Array.from(book.querySelectorAll('.manual-page')).at(direction>0?-1:0):null;let overlay=null;if(old&&!reduced.matches&&!document.documentElement.classList.contains('p2-motion')){const orig=old.querySelector('canvas');if(orig){overlay=document.createElement('canvas');overlay.width=orig.width;overlay.height=orig.height;overlay.getContext('2d').drawImage(orig,0,0);overlay.className='manual-turn'+(direction<0?' back':'');overlay.style.width=old.offsetWidth+'px';overlay.style.height=old.offsetHeight+'px';overlay.style.left=old.offsetLeft+'px';overlay.style.transformOrigin=direction>0?'left center':'right center'}}
try{const nums=targets(),css=getComputedStyle(scroll),px=k=>parseFloat(css[k])||0,available=Math.max(1,scroll.clientWidth-px('paddingLeft')-px('paddingRight')),availableHeight=Math.max(1,scroll.clientHeight-px('paddingTop')-px('paddingBottom'));const pages=await Promise.all(nums.map(n=>documentRef.getPage(n)));if(task!==renderEpoch)return;const ratios=pages.map(p=>{const v=p.getViewport({scale:1});return v.height/v.width});const byWidth=Math.max(1,(available-4*(nums.length-1))/nums.length);const base=fullMode()?Math.min(byWidth,availableHeight/Math.max(...ratios)):Math.min(850,byWidth);const w=Math.max(1,Math.floor(base*zoom));const boxes=await Promise.all(pages.map(async (pdfPage,i)=>{const n=nums[i];if(task!==renderEpoch)return null;const raw=pdfPage.getViewport({scale:1}),logical=w/raw.width,dpr=Math.min(2,devicePixelRatio||1),view=pdfPage.getViewport({scale:logical*dpr});const box=document.createElement('div'),canvas=document.createElement('canvas');box.className='manual-page';box.style.width=w+'px';box.setAttribute('role','img');box.setAttribute('aria-label','Manual page '+n);canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);box.append(canvas);const job=pdfPage.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport:view});activeJobs.push(job);await job.promise;return box}));if(task!==renderEpoch)return;book.replaceChildren(...boxes.filter(Boolean));if(overlay){book.append(overlay);overlay.addEventListener('animationend',()=>overlay.remove(),{once:true});setTimeout(()=>overlay.remove(),800)}if(direction){scroll.scrollTop=0;scroll.scrollLeft=0;rustle(direction)}say('');updateTranscript();}catch(e){if(task===renderEpoch){console.warn('Page render:',e);say('This page could not be rendered. Open the searchable PDF instead.')}}finally{if(task===renderEpoch){busy=false;controls()}}}
function go(n,dir=0){if(!doc||busy)return;const target=align(n);if(target===page)return;stopReading();if(sound&&audio?.state==='suspended')audio.resume().catch(()=>{});const direction=dir||Math.sign(target-page);page=target;paint(direction)}
function step(dir){if(!doc||busy)return;const spread=two&&canSpread();let next=page+dir;if(spread){next=dir>0?(page===1?2:page+2):(page<=2?1:page-2)}go(next,dir)}
for(const id of ['prev','prev-bottom'])$(id).onclick=()=>step(-1);for(const id of ['next','next-bottom'])$(id).onclick=()=>step(1);
function jump(){go(Number($('number').value));closeTools(true)}$('go').onclick=jump;$('number').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();jump()}};
function changeZoom(z){if(!doc||busy)return;zoom=Math.min(2.5,Math.max(.75,z));paint(0)}
$('plus').onclick=()=>changeZoom(zoom+.25);$('minus').onclick=()=>changeZoom(zoom-.25);$('fit').onclick=()=>{scroll.scrollLeft=0;scroll.scrollTop=0;changeZoom(1)};
$('layout').onclick=()=>{if(!doc||busy||!canSpread())return;two=!two;page=align(page);paint(0)};
retry.onclick=()=>loadApproved();
function close(){closeTools();if(document.fullscreenElement===root)document.exitFullscreen?.().catch(()=>{});root.classList.remove('manual-fullscreen');stopReading();fullLabel();const home=document.querySelector('#mainNav [data-nav="about"]');home?.click();home?.focus()}
$('close').onclick=close;
$('full').onclick=async()=>{closeTools();if(document.fullscreenElement===root){try{await document.exitFullscreen()}catch(_){say('Use your browser’s full-screen exit control.')}return}if(root.classList.contains('manual-fullscreen')){root.classList.remove('manual-fullscreen');fullLabel();redraw(true);return}try{if(!root.requestFullscreen)throw Error();await root.requestFullscreen()}catch(_){root.classList.add('manual-fullscreen');fullLabel();redraw(true)}};
document.addEventListener('fullscreenchange',()=>{fullLabel();closeTools();redraw(true)});
book.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'){e.preventDefault();go(1)}else if(e.key==='End'&&doc){e.preventDefault();go(doc.numPages)}});
let start=null;book.addEventListener('touchstart',e=>{if(e.touches.length===1&&zoom===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY};else start=null},{passive:true});book.addEventListener('touchend',e=>{if(!start)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)step(dx<0?1:-1)},{passive:true});
book.addEventListener('click',e=>{if(zoom>1||!doc||busy)return;const r=book.getBoundingClientRect(),x=e.clientX-r.left;if(x<r.width*.22)step(-1);else if(x>r.width*.78)step(1)});
let timer,layoutKey='';const measure=()=>{root.style.setProperty('--manual-panel-space',Math.max(96,scroll.clientHeight-12)+'px');return [scroll.clientWidth,fullMode()?scroll.clientHeight:0,fullMode(),canSpread()].join('|')};const redraw=(force=false)=>{const key=measure();if(force!==true&&key===layoutKey)return;layoutKey=key;clearTimeout(timer);timer=setTimeout(()=>{if(doc&&root.closest('.view')?.classList.contains('active')&&scroll.clientWidth>0){page=align(page);paint(0)}},120)};window.addEventListener('resize',()=>redraw());window.visualViewport?.addEventListener('resize',()=>redraw());if(window.ResizeObserver)new ResizeObserver(()=>redraw()).observe(scroll);
const section=root.closest('.view');const openApproved=()=>{if(!section.classList.contains('active')){stopReading();closeTools();if(root.classList.contains('manual-fullscreen')){root.classList.remove('manual-fullscreen');fullLabel()}return;}if(!autoTried){autoTried=true;loadApproved()}else if(doc)redraw(true)};new MutationObserver(openApproved).observe(section,{attributes:true,attributeFilter:['class']});openApproved();
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(options?.open){e.preventDefault();closeTools(true);return}if(root.classList.contains('manual-fullscreen')&&!document.querySelector('dialog[open]')){$('full').click()}});fullLabel();
})();