/* Preview-only branded document exports and client visit summary.
   Local-only processing; no case information is transmitted by this script. */
(()=>{'use strict';
const SITE='https://mohw-gia-approved-preview.onrender.com/';
const LOGO='assets/mohw-official-logo.png';
const $=s=>document.querySelector(s);
const get=()=>Object.fromEntries(new FormData($('#refgen-form')).entries());
const date=()=>new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s||'').trim();
const maps=s=>{try{const u=new URL(s);if(u.protocol!=='https:'||u.username||u.password)return '';const h=u.hostname.toLowerCase();return h==='maps.google.com'||h==='www.google.com'&&(u.pathname.startsWith('/maps')||u.pathname==='/maps/search/')||h==='google.com'&&u.pathname.startsWith('/maps')||h==='maps.app.goo.gl'||h==='goo.gl'&&u.pathname.startsWith('/maps')?u.href:''}catch{return ''}};
const directory={programmes:[],parishes:{}};const initDirectory=async()=>{try{const [a,b]=await Promise.all([fetch('data/guide-content.json'),fetch('data/gia-parishes.json')]);if(!a.ok||!b.ok)throw Error('Directory unavailable');const g=await a.json(),p=await b.json();directory.programmes=Array.isArray(g.programmes)?g.programmes:[];directory.parishes=p.parishes||{};directory.metadata=g.serviceMetadata||{}}catch(e){console.warn('Referral directory not loaded',e)}};
const mapSearch=(address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address);
const officeOptions=(parish)=>{const x=directory.parishes[parish]||{};return ['mlss','nht','drugServ','healthDept'].filter(k=>x[k]?.address).map(k=>({key:k,name:x[k].name,address:x[k].address,phone:x[k].phone,scope:x[k].scope}))};
const fields=(kind,d)=>kind==='summary'?[
['Client',d.client],['Parish',d.parish],['What we discussed',d.discussed],['Next step',d.nextstep],['Where to go',d.agency],['Office address / contact',d.location],['When to attend',d.appointment],['What to bring',d.bring],['Directions',maps(d.maplink)||'Ask the worker to confirm the exact office'],['Worker / contact',d.officer],['Additional notes',d.support]
]:[['Client',d.client],['Parish',d.parish],['Support area',d.category],['Receiving organisation',d.agency],['Verified office details',d.location],['Reason for referral',d.reason],['Assistance requested',d.support],['Referring worker',d.officer],['Directions',maps(d.maplink)]];
const titles={referral:'Client Support Referral',summary:'Your Visit Summary & Next Steps'};
const notice='DEMONSTRATION DRAFT — NOT AN OFFICIAL REFERRAL. Confirm office details, required documents and appointments with the receiving organisation.';
const download=(blob,name)=>{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)};
const status=t=>{const n=$('#refgen-status');if(n)n.textContent=t};
const readImage=async()=>{const response=await fetch(LOGO);if(!response.ok)throw Error('Logo unavailable');return await response.arrayBuffer()};
const logoData=async()=>{const data=await readImage();return 'data:image/png;base64,'+btoa([...new Uint8Array(data)].map(c=>String.fromCharCode(c)).join(''))};
const qrData=()=>new Promise((resolve)=>{if(typeof QRCode==='undefined'){resolve('');return;}const host=document.createElement('div');host.style.cssText='position:fixed;left:-9999px;top:-9999px';document.body.append(host);try{new QRCode(host,{text:SITE,width:128,height:128,colorDark:'#15365f',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});setTimeout(()=>{const c=host.querySelector('canvas'),img=host.querySelector('img');let src='';try{src=c?.toDataURL('image/png')||img?.src||''}catch{}host.remove();resolve(src)},60)}catch{host.remove();resolve('')}});
const pageText=(kind,d)=>[titles[kind],notice,'Prepared: '+date(),...fields(kind,d).filter(x=>clean(x[1])).map(([k,v])=>k.toUpperCase()+'\n'+clean(v)),'Guide: '+SITE].join('\n\n');
async function pdf(kind,d){
if(!window.jspdf?.jsPDF)throw Error('PDF export library unavailable. Check connection and retry.');
const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),w=210,m=18,max=277;let y=18;
pdf.setFillColor(22,49,99);pdf.rect(0,0,w,37,'F');pdf.setDrawColor(231,183,69);pdf.setLineWidth(1.3);pdf.line(0,37,w,37);
try{const logo=await logoData();pdf.addImage(logo,'PNG',m,7,39,22)}catch{}
pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(15);pdf.text(titles[kind],66,17);pdf.setFontSize(8);pdf.setFont('helvetica','normal');pdf.text('JAMAICA  |  SOCIAL PROTECTION SERVICES SUPPORT',66,24);
y=47;pdf.setTextColor(138,70,27);pdf.setFont('helvetica','bold');pdf.setFontSize(8);pdf.text('DEMONSTRATION DRAFT  -  NOT AN OFFICIAL REFERRAL',m,y);y+=7;
pdf.setTextColor(70,89,113);pdf.setFont('helvetica','normal');pdf.text('Prepared '+date(),m,y);y+=10;
const newPage=()=>{pdf.addPage();y=19};
for(const [label,value] of fields(kind,d)){if(!clean(value))continue;const lines=pdf.splitTextToSize(clean(value),w-2*m-5);const h=9+lines.length*5.3;if(y+h>max)newPage();pdf.setFillColor(241,246,252);pdf.roundedRect(m,y-4,w-2*m,7,1.5,1.5,'F');pdf.setTextColor(25,73,126);pdf.setFont('helvetica','bold');pdf.setFontSize(9);pdf.text(label.toUpperCase(),m+3,y+1);y+=9;pdf.setFont('helvetica','normal');pdf.setFontSize(10);pdf.setTextColor(28,47,76);pdf.text(lines,m+3,y);if(label==='Directions'&&maps(value))pdf.link(m+3,y-4,w-2*m,Math.max(6,lines.length*5),{url:maps(value)});y+=lines.length*5.3+7}
if(y>236)newPage();y=Math.max(y+4,240);
pdf.setDrawColor(216,228,241);pdf.line(m,y,w-m,y);y+=6;
try{const qr=await qrData();if(qr)pdf.addImage(qr,'PNG',m,y,23,23)}catch{}
pdf.setFont('helvetica','bold');pdf.setFontSize(8);pdf.setTextColor(25,73,126);pdf.text('SCAN TO OPEN THE PUBLIC SUPPORT GUIDE',m+29,y+7);
pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.text(SITE,m+29,y+13);pdf.link(m+29,y+9,150,7,{url:SITE});
pdf.setTextColor(102,113,127);pdf.setFontSize(7);pdf.text(pdf.splitTextToSize(notice,w-2*m),m,282);
download(pdf.output('blob'),'MOHW_'+(kind==='summary'?'Visit_Summary':'Referral')+'_DRAFT.pdf');
}
async function word(kind,d){
if(!window.docx?.Document)throw Error('Word export library unavailable. Check connection and retry.');
const X=window.docx;const p=(t,opt={})=>new X.Paragraph({text:clean(t),spacing:{after:130},...opt});
const children=[];
try{children.push(new X.Paragraph({children:[new X.ImageRun({data:new Uint8Array(await readImage()),transformation:{width:210,height:104}})],spacing:{after:180}}))}catch{}
children.push(p('MINISTRY OF HEALTH & WELLNESS  |  JAMAICA',{bold:true,color:'225B97',size:19}));
children.push(p(titles[kind],{heading:X.HeadingLevel.HEADING_1,spacing:{after:200}}));
children.push(p('DEMONSTRATION DRAFT — NOT AN OFFICIAL REFERRAL',{color:'A65B2C',bold:true,size:18}));
children.push(p('Prepared '+date(),{color:'64758B'}));
for(const [label,value] of fields(kind,d)){if(!clean(value))continue;children.push(p(label.toUpperCase(),{bold:true,color:'1A5B9A',spacing:{before:180,after:80}}));if(label==='Directions'&&maps(value)){children.push(new X.Paragraph({children:[new X.ExternalHyperlink({link:maps(value),children:[new X.TextRun({text:'Open verified map directions',style:'Hyperlink'})]})]}))}else children.push(p(value))}
try{const q=await qrData();if(q){const bytes=Uint8Array.from(atob(q.split(',')[1]),c=>c.charCodeAt(0));children.push(new X.Paragraph({children:[new X.ImageRun({data:bytes,transformation:{width:86,height:86}})]}))}}catch{}
children.push(new X.Paragraph({children:[new X.ExternalHyperlink({link:SITE,children:[new X.TextRun({text:'Open the public Social Support Guide',style:'Hyperlink'})]})]}));
children.push(p(notice,{color:'6B7685',size:16,spacing:{before:200}}));
const file=new X.Document({sections:[{properties:{page:{margin:{top:900,bottom:900,left:950,right:950}}},children}]});
download(await X.Packer.toBlob(file),'MOHW_'+(kind==='summary'?'Visit_Summary':'Referral')+'_DRAFT.docx');
}
function init(){const wrap=$('#refgen');if(!wrap||wrap.dataset.enhanced)return;wrap.dataset.enhanced='yes';const form=$('#refgen-form');if(!form)return;
const directoryBox=document.createElement('div');directoryBox.className='refgen-directory';directoryBox.innerHTML='<div class="refgen-directory-heading"><strong>Find a service</strong><span>Choose a programme and, where listed, an office</span></div><div class="refgen-grid"><label>Programme / service<select id="refgen-programme"><option value="">Choose from Find Services</option></select></label><label>Listed parish office (optional)<select id="refgen-office"><option value="">Choose a listed office</option></select></label></div><p id="refgen-directory-note">Agency and location details will fill automatically when available. Always confirm the office accepts this service.</p>';form.prepend(directoryBox);
const programSelect=directoryBox.querySelector('#refgen-programme'),officeSelect=directoryBox.querySelector('#refgen-office'),note=directoryBox.querySelector('#refgen-directory-note');
const parishSelect=form.querySelector('[name=parish]'),agencyInput=form.querySelector('[name=agency]'),addressInput=form.querySelector('[name=location]');
const refreshOffice=()=>{const options=officeOptions(parishSelect.value);officeSelect.innerHTML='<option value="">Choose a listed office</option>'+options.map(o=>'<option value="'+o.key+'">'+esc(o.name)+' — '+esc(o.address)+'</option>').join('');note.textContent=options.length?'Choose the specific office only if it handles the selected programme. Addresses are listings, not verified GPS pins.':'No parish office listed for this selection; confirm the location manually.'};
parishSelect.addEventListener('change',refreshOffice);
officeSelect.addEventListener('change',()=>{const o=officeOptions(parishSelect.value).find(x=>x.key===officeSelect.value);if(!o)return;agencyInput.value=o.name;addressInput.value=o.address;if(map)map.value=mapSearch(o.address);note.textContent=(o.scope||'Office listing')+' Google Maps will open a search for this address; confirm the correct building before travel.';form.dispatchEvent(new Event('input',{bubbles:true}))});
programSelect.addEventListener('change',()=>{const p=directory.programmes.find(x=>x.name===programSelect.value);if(!p)return;agencyInput.value=directory.metadata?.[p.name]?.agency||p.name;const bring=form.querySelector('[name=bring]'),next=form.querySelector('[name=nextstep]');if(bring&&!bring.value)bring.value=p.bring||'';if(next&&!next.value)next.value=p.process||'';note.textContent='Programme guidance loaded. Choose a listed parish office only if its service scope matches; programme eligibility and document requirements must be confirmed.';form.dispatchEvent(new Event('input',{bubbles:true}))});
initDirectory().then(()=>{programSelect.innerHTML='<option value="">Choose from Find Services</option>'+directory.programmes.map(p=>'<option>'+esc(p.name)+'</option>').join('');refreshOffice()});
const mode=document.createElement('div');mode.className='refgen-modes';mode.innerHTML='<button type="button" class="selected" data-refgen-mode="referral" aria-pressed="true">Referral document</button><button type="button" data-refgen-mode="summary" aria-pressed="false">Client visit summary</button>';form.before(mode);
const extra=document.createElement('div');extra.className='refgen-grid refgen-extra';extra.innerHTML='<label class="full">Verified Google Maps link (optional)<input name="maplink" inputmode="url" type="url" placeholder="https://maps.app.goo.gl/..."></label><div class="refgen-summary-fields full" hidden><div class="refgen-grid"><label class="full">What was discussed<textarea name="discussed" maxlength="800" placeholder="A simple, client-friendly summary"></textarea></label><label class="full">Next step / what to do<textarea name="nextstep" maxlength="600" placeholder="Go to the office and ask for..."></textarea></label><label>When to go / appointment<input name="appointment" maxlength="140" placeholder="Only if confirmed"></label><label>What to bring<textarea name="bring" maxlength="450" placeholder="List only confirmed requirements"></textarea></label></div></div>';form.querySelector('.refgen-grid').after(extra);
const map=extra.querySelector('[name=maplink]');map.addEventListener('change',()=>{if(map.value&&!maps(map.value)){map.setCustomValidity('Use a verified Google Maps link, or leave blank.');map.reportValidity()}else map.setCustomValidity('')});
let kind='referral';const switchMode=next=>{kind=next;mode.querySelectorAll('button').forEach(btn=>{let active=btn.dataset.refgenMode===kind;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active))});extra.querySelector('.refgen-summary-fields').hidden=kind!=='summary';form.querySelector('[name=reason]').required=kind==='referral';form.querySelector('[name=discussed]').required=kind==='summary';form.querySelector('[name=nextstep]').required=kind==='summary';form.querySelector('[name=reason]').closest('label').hidden=kind==='summary';form.querySelector('[name=support]').closest('label').querySelector('textarea').placeholder=kind==='summary'?'Optional reminders or accessibility needs':'E.g. help understanding application steps';$('#refgen-preview').hidden=true;$('#refgen-title').textContent=kind==='summary'?'Client Visit Summary':'Smart Referral Generator'};
mode.addEventListener('click',e=>{const btn=e.target.closest('[data-refgen-mode]');if(btn)switchMode(btn.dataset.refgenMode)});
const preview=$('#refgen-preview');const text=$('#refgen-text');const clone=document.createElement('div');clone.className='refgen-export-note';clone.textContent='Downloads include MOHW branding, a public-guide QR code and a clickable verified directions link when provided. Review every detail before sharing.';preview.querySelector('h3').after(clone);
const oldWord=$('#refgen-word'),oldPdf=$('#refgen-pdf');oldWord.textContent='Download Word (.docx)';oldPdf.textContent='Download PDF';const newWord=oldWord.cloneNode(true),newPdf=oldPdf.cloneNode(true);oldWord.replaceWith(newWord);oldPdf.replaceWith(newPdf);
let approved=null;form.addEventListener('submit',e=>{if(!form.reportValidity())return;approved=get();setTimeout(()=>{text.textContent=pageText(kind,approved);status('Preview ready. Confirm the receiving office and all details before sharing.')},0)},true);
const run=async fn=>{if(!approved||!form.reportValidity()){status('Preview the completed form before exporting.');return}try{status('Preparing your branded document...');await fn(kind,approved);status('Document generated on your device. Check the downloaded file.')}catch(e){status('Export could not complete: '+e.message)}};
newWord.addEventListener('click',()=>run(word));newPdf.addEventListener('click',()=>run(pdf));
const oldShare=$('#refgen-share'),newShare=oldShare.cloneNode(true);oldShare.replaceWith(newShare);newShare.textContent='Share client reminder';newShare.addEventListener('click',async()=>{if(!approved){status('Preview the form before sharing.');return;}const message=pageText(kind,approved);try{if(navigator.share){await navigator.share({title:titles[kind],text:message});status('Choose WhatsApp or another available app. Review the recipient before sending.')}else if(navigator.clipboard){await navigator.clipboard.writeText(message);status('Reminder copied. Paste it into WhatsApp after checking the recipient.')}else status('Sharing unavailable. Copy the document text manually.')}catch(e){if(e.name!=='AbortError')status('Sharing unavailable. Download the document instead.')}});
form.addEventListener('input',()=>{approved=null;preview.hidden=true});mode.addEventListener('click',()=>{approved=null});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,200));else setTimeout(init,200);
})();
