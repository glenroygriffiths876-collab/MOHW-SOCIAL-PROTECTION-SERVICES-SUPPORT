/* MOHW Social Support — image-layover referral experience
 * The generated premium screenshots are retained EXACTLY as the art layer.
 * No new card layout and no moving UI. Only the step image and its real
 * source-derived guidance switch while every control retains the same coords.
 */
(()=>{
'use strict';
const view=document.getElementById('view-referrals');if(!view)return;
const $=(s,root=document)=>root.querySelector(s);
const pct=(n,max)=>(n/max*100).toFixed(5)+'%';
const DX=1536,DY=1024;
const M={w:896,h:1412};
const images=[
 'assets/referral-photo-1-listen.webp',
 'assets/referral-photo-2-safety.webp',
 'assets/referral-photo-3-match.webp',
 'assets/referral-photo-4-prepare.webp',
 'assets/referral-photo-5-connect.webp',
 'assets/referral-photo-6-followup.webp'
];
const sceneOriginals=[
 'assets/referral-listening.webp','assets/referral-safety.webp','assets/referral-match.webp',
 'assets/referral-preparing.webp','assets/referral-warmhandoff.webp','assets/referral-followup.webp'
];
const labels=[
 'Identify the need','Check urgency and safety','Match the person to a service',
 'Prepare for the referral','Make a warm referral where possible','Document and follow up'
];
let active=0;
const root=document.createElement('div');
root.id='referral-artwork-overlay';
root.setAttribute('role','region');
root.setAttribute('aria-label','MOHW Social Support illustrated referral pathway');
const desktop=document.createElement('div');desktop.className='rlo-desktop rlo-art';
const original=document.createElement('img');
original.src='assets/referrals-overlay-desktop.webp';original.alt='';original.className='rlo-base';
original.setAttribute('aria-hidden','true');original.decoding='async';
desktop.append(original);
const mobile=document.createElement('div');mobile.className='rlo-mobile rlo-art';
function pane(className,viewBox){
 const div=document.createElement('div');div.className='rlo-pane '+className;
 div.innerHTML='<svg class="rlo-mobile-image" xmlns="http://www.w3.org/2000/svg" viewBox="'+viewBox.join(' ')+'" aria-hidden="true" focusable="false"><image href="assets/referrals-overlay-mobile.webp" width="896" height="1412"/></svg>';
 mobile.append(div);return div;
}
const mobHero=pane('rlo-m-hero',[0,0,896,455]);
const mobSteps=pane('rlo-m-steps',[0,455,335,620]);
const mobDetail=pane('rlo-m-detail',[325,455,571,620]);
const mobFooter=pane('rlo-m-footer',[0,1075,896,337]);
root.append(desktop,mobile);
view.append(root);
view.classList.add('referral-overlay-enabled');
const alertText='For immediate danger, serious medical distress, suspected abuse, suicidal thoughts, severe neglect or child-protection concerns, follow emergency and safeguarding procedures first.';
function logo(place,x,y,w,h,baseW,baseH){
 const im=document.createElement('img');im.className='rlo-official-logo';
 im.src='assets/mohw-official-logo.png';
 im.alt='Ministry of Health & Wellness official logo';
 Object.assign(im.style,{left:pct(x,baseW),top:pct(y,baseH),width:pct(w,baseW),height:pct(h,baseH)});
 place.append(im);return im;
}
logo(desktop,64,1,278,64,DX,DY);
logo(mobHero,32,0,278,59,M.w,455);
function photo(place,src){
 const img=document.createElement('img');img.className='rlo-photo';
 img.src=src;img.alt='Jamaican community-support illustration for '+labels[0];img.decoding='async';
 place.append(img);return img;
}
const desktopPhoto=photo(desktop,images[0]),mobilePhoto=photo(mobDetail,images[0]);
const dCopy=document.createElement('div');
dCopy.className='rlo-screen rlo-d-copy';
dCopy.innerHTML='<div class="rlo-d-text"><span class="rlo-d-label">Step 1 of 6</span><h2 class="rlo-d-title">Identify the need</h2><p class="rlo-d-lead">Ask what is affecting the person’s care or wellbeing.</p></div><div class="rlo-d-remember"><strong>Remember</strong><p>Listen without judgement and respect the person’s priorities.</p></div>';
desktop.append(dCopy);
const mCopy=document.createElement('div');
mCopy.className='rlo-screen rlo-m-copy';
mCopy.innerHTML='<span class="rlo-m-step">Step 1 of 6</span><h2 class="rlo-m-title">Identify the need</h2><p class="rlo-m-lead">Ask what is affecting the person’s care or wellbeing.</p>';
mobDetail.append(mCopy);
const mRemember=document.createElement('div');
mRemember.className='rlo-screen rlo-m-remember';
mRemember.innerHTML='<strong>Remember</strong><p>Listen without judgement and respect the person’s priorities.</p>';
mobDetail.append(mRemember);
const safety=document.createElement('div');
safety.className='rlo-screen rlo-d-safety';safety.textContent=alertText;desktop.append(safety);
function hotspot(place,label,kind,arg,x,y,w,h,baseW,baseH){
 const b=document.createElement('button');b.type='button';b.className='rlo-hot';b.setAttribute('aria-label',label);
 Object.assign(b.style,{left:pct(x,baseW),top:pct(y,baseH),width:pct(w,baseW),height:pct(h,baseH)});
 b.addEventListener('click',()=>act(kind,arg));place.append(b);return b;
}
function route(id){
 const native=$('#mainNav [data-nav="'+id+'"]');
 if(native){native.click();return true;}return false;
}
function gia(){
 if(window.MOHWGIA?.open){window.MOHWGIA.open();return true;}
 const launcher=$('#gia2Launcher');if(launcher){launcher.click();return true;}return false;
}
function access(){
 const trigger=$('#premium-mobile-access')||$('[data-p2="access"]');
 if(trigger){trigger.click();return true;}return false;
}
function select(index){
 const btn=$('#referralStepNav [data-ref-step="'+index+'"]');
 if(btn){btn.click();active=index;refresh();return true;}
 return false;
}
function act(kind,arg){
 if(kind==='step')return select(Number(arg));
 if(kind==='next')return select((active+1)%6);
 if(kind==='prev')return select(Math.max(0,active-1));
 if(kind==='guide')return select(0);
 if(kind==='full')return fullGuide();
 if(kind==='nav')return route(arg);
 if(kind==='gia')return gia();
 if(kind==='access')return access();
}
function clickableNav(parent,coords,baseW,baseH){
 for(const [name,target,x,y,w,h] of coords)
  hotspot(parent,name,target==='access'?'access':'nav',target,x,y,w,h,baseW,baseH);
}
clickableNav(desktop,[
 ['Home','about',177,70,154,44],['Referrals','referrals',336,70,173,44],
 ['Decision Guide','decision',514,70,197,44],['Find Services','services',715,70,206,44],
 ['Digital Manual','manual',923,70,205,44],['Accessibility & Listening','access',1132,70,212,44]
],DX,DY);
hotspot(desktop,'Start Referral Guide','guide','',177,263,368,60,DX,DY);
const dbounds=[[73,340,222,86],[327,340,199,86],[557,340,211,86],[797,340,207,86],[1034,340,207,86],[1270,340,213,86]];
const dim=document.createElement('div');dim.className='rlo-screen rlo-d-dim-first';desktop.append(dim);
const activeFrame=document.createElement('div');activeFrame.className='rlo-selected-frame';desktop.append(activeFrame);
dbounds.forEach((v,i)=>hotspot(desktop,'Step '+(i+1)+': '+labels[i],'step',i,...v,DX,DY));
const progress=document.createElement('div');progress.className='rlo-screen rlo-progress';
for(let i=0;i<6;i++){const b=document.createElement('button');b.type='button';b.textContent=i+1;b.setAttribute('aria-label','Go to step '+(i+1));b.addEventListener('click',()=>select(i));progress.append(b);}
desktop.append(progress);
hotspot(desktop,'Full wording from the guide','full','',610,650,845,54,DX,DY);
hotspot(desktop,'Previous referral step','prev','',1160,701,144,60,DX,DY);
hotspot(desktop,'Next referral step','next','',1314,701,156,60,DX,DY);
hotspot(desktop,'Find services','nav','services',114,893,339,100,DX,DY);
hotspot(desktop,'Ask GIA','gia','',465,893,324,100,DX,DY);
hotspot(desktop,'Read the digital manual','nav','manual',800,893,357,100,DX,DY);
hotspot(desktop,'Ask GIA virtual guide','gia','',1175,870,177,130,DX,DY);
// The mobile design uses the *same image*, sliced into legible native-aspect
// image panels instead of squeezing the six steps into a tiny portrait screenshot.
clickableNav(mobHero,[
 ['Home','about',17,75,135,83],['Referrals','referrals',156,75,148,83],
 ['Decision Guide','decision',305,75,143,83],['Find Services','services',450,75,145,83],
 ['Digital Manual','manual',596,75,146,83],['Accessibility & Listening','access',743,75,136,83]
],M.w,455);
hotspot(mobHero,'Start Referral Guide','guide','',43,372,372,75,M.w,455);
const mbounds=[[26,21,302,89],[26,112,302,95],[26,209,302,92],[26,310,302,92],[26,410,302,97],[26,511,302,105]];
const mobileFrame=document.createElement('div');mobileFrame.className='rlo-selected-frame';mobSteps.append(mobileFrame);
mbounds.forEach((v,i)=>hotspot(mobSteps,'Step '+(i+1)+': '+labels[i],'step',i,...v,335,620));
hotspot(mobDetail,'Full wording from the guide','full','',24,484,523,48,571,620);
hotspot(mobDetail,'Previous referral step','prev','',24,543,256,66,571,620);
hotspot(mobDetail,'Next referral step','next','',312,543,241,66,571,620);
hotspot(mobFooter,'Find Services','nav','services',20,153,215,115,M.w,337);
hotspot(mobFooter,'Ask GIA','gia','',245,153,217,115,M.w,337);
hotspot(mobFooter,'Digital Manual','nav','manual',464,153,236,115,M.w,337);
hotspot(mobFooter,'Ask GIA virtual guide','gia','',737,152,158,174,M.w,337);
const dialog=document.createElement('dialog');dialog.className='rlo-dialog';
dialog.setAttribute('aria-labelledby','rlo-dialog-title');
dialog.innerHTML='<h2 id="rlo-dialog-title">Full wording from the guide</h2><p id="rlo-dialog-text"></p><button type="button" id="rlo-dialog-close">Close guide</button>';
root.append(dialog);
$('#rlo-dialog-close',dialog).addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
function fullGuide(){
 const source=$('#referralStepPanel .rpx-full-guide p')?.textContent?.trim();
 $('#rlo-dialog-title',dialog).textContent=labels[active];
 $('#rlo-dialog-text',dialog).textContent=source||'Referral guide content is loading.';
 if(!dialog.open)dialog.showModal();
}
const dTitle=$('.rlo-d-title',dCopy),mTitle=$('.rlo-m-title',mCopy);
function copy(el,txt){if(el&&el.textContent!==txt)el.textContent=txt;}
function refresh(){
 const el=$('#referralStepPanel .rpx-feature');
 if(!el)return;
 const actual=Number(el.dataset.rpxActiveStep||1)-1;
 if(actual>=0&&actual<6)active=actual;
 const title=$('#activeReferralStepTitle')?.textContent?.trim()||labels[active];
 const lead=$('#referralStepPanel .rpx-step-lead')?.textContent?.trim()||'';
 const remember=$('#referralStepPanel .rpx-remember p')?.textContent?.trim()||'';
 copy(dTitle,title);copy(mTitle,title);
 copy($('.rlo-d-label',dCopy),'Step '+(active+1)+' of 6');
 copy($('.rlo-m-step',mCopy),'Step '+(active+1)+' of 6');
 copy($('.rlo-d-lead',dCopy),lead);copy($('.rlo-m-lead',mCopy),lead);
 copy($('.rlo-d-remember p',dCopy),remember);copy($('.rlo-m-remember p',mRemember),remember);
 for(const img of [desktopPhoto,mobilePhoto]){
  const src=images[active];if(img.getAttribute('src')!==src)img.setAttribute('src',src);
  img.alt=labels[active]+' — Jamaican social-support scene '+(active+1);
 }
 const rect=dbounds[active];
 Object.assign(activeFrame.style,{left:pct(rect[0],DX),top:pct(rect[1],DY),width:pct(rect[2],DX),height:pct(rect[3],DY)});
 dim.style.display=active===0?'none':'block';
 const mRect=mbounds[active];
 Object.assign(mobileFrame.style,{left:pct(mRect[0],335),top:pct(mRect[1],620),width:pct(mRect[2],335),height:pct(mRect[3],620)});
 [...progress.children].forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
}
new MutationObserver(refresh).observe($('#referralStepPanel'),{childList:true});
function syncVisibility(){
 const on=view.classList.contains('active');
 document.documentElement.classList.toggle('rlo-active',on);
 root.hidden=!on;
}
new MutationObserver(syncVisibility).observe(view,{attributes:true,attributeFilter:['class']});
document.addEventListener('DOMContentLoaded',()=>{syncVisibility();refresh()});
syncVisibility();refresh();
})();
