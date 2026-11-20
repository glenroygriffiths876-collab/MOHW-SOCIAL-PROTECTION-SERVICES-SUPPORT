/* Video-referenced GIA experience. Displays only content from the guide's
   existing data source; never uses AI-video labels as directory facts. */
(function(){
'use strict';
const video=document.getElementById('gia-welcome-video');
const fallback=document.getElementById('gia-video-placeholder');
if(video && fallback){
  let failed=false;
  const showFallback=()=>{
    if(failed)return;
    failed=true;
    video.hidden=true;
    video.setAttribute('aria-hidden','true');
    fallback.hidden=false;
  };
  video.addEventListener('error',showFallback);
  video.querySelector('source')?.addEventListener('error',showFallback);
  video.addEventListener('loadedmetadata',()=>{
    fallback.hidden=true;
    video.hidden=false;
    video.removeAttribute('aria-hidden');
  });
}
const diagram=document.getElementById('premium-referral-diagram');
if(!diagram)return;
const images=[
  ['assets/referral-listening.webp','A social worker listening to a community member'],
  ['assets/referral-safety.webp','A support worker checking immediate safety'],
  ['assets/referral-match.webp','A client and worker choosing suitable services'],
  ['assets/referral-preparing.webp','A support worker preparing documents with a family'],
  ['assets/referral-warmhandoff.webp','A social worker making a warm referral'],
  ['assets/referral-followup.webp','A community worker discussing referral follow-up']
];
const draw=(steps)=>{
  diagram.replaceChildren();
  steps.slice(0,6).forEach((item,i)=>{
    if(!Array.isArray(item)||typeof item[0]!=='string')return;
    const button=document.createElement('button');
    button.type='button';
    button.className='referral-diagram-button';
    button.setAttribute('aria-label','Open referral step '+(i+1)+': '+item[0]);
    const img=document.createElement('img');
    img.src=images[i][0];img.alt=images[i][1];img.loading='lazy';
    const copy=document.createElement('div');
    const num=document.createElement('span');
    num.textContent='STEP '+String(i+1).padStart(2,'0');
    const title=document.createElement('strong');
    title.textContent=item[0];
    copy.append(num,title);
    button.append(img,copy);
    button.addEventListener('click',()=>{
      const target=document.querySelector('#referralStepNav [data-ref-step="'+i+'"]');
      if(target){target.click();document.getElementById('referralJourney')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
      else{document.getElementById('referralJourney')?.scrollIntoView({block:'start'});}
    });
    diagram.append(button);
  });
};
fetch('data/guide-content.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Guide data unavailable');return r.json();}).then(data=>{if(Array.isArray(data.referralSteps))draw(data.referralSteps);}).catch(()=>{
  const p=document.createElement('p');
  p.textContent='The referral overview is temporarily unavailable. The full six-step guide remains below.';
  diagram.replaceChildren(p);
});
})();