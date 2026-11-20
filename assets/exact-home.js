/* MOHW pixel-accurate homepage with real focusable hotspots. */
(()=>{"use strict";
const vw=1448,vh=1086,view=document.getElementById("view-about");if(!view)return;
const box=document.createElement("div");box.id="exact-home";box.hidden=true;
box.setAttribute("role","region");box.setAttribute("aria-label","MOHW Social Support home");
const image=document.createElement("img");image.src="assets/mohw-homepage-exact.png";image.alt="";image.setAttribute("aria-hidden","true");image.className="exact-art";box.append(image);
const sr=document.createElement("h1");sr.className="exact-sr";sr.textContent="Find the support you need. Ministry of Health and Wellness Social Support";box.append(sr);
const notice=document.createElement("span");notice.className="exact-sr";notice.setAttribute("role","status");notice.setAttribute("aria-live","polite");box.append(notice);
const pos=(el,x,y,w,h)=>{el.style.left=x/vw*100+"%";el.style.top=y/vh*100+"%";el.style.width=w/vw*100+"%";el.style.height=h/vh*100+"%";};
const nav=id=>{const x=document.querySelector('.site-header button[data-nav="'+id+'"]')||document.querySelector('#view-about .p2-start [data-nav="'+id+'"]');if(x){x.click();return true;}const a=document.querySelector('.pm-more [data-premium-nav="'+id+'"]');if(a){a.click();return true;}return false;};
const tool=a=>{const x=document.querySelector('#guideActionDock [data-action="'+a+'"]');if(x){x.click();return true;}return false;};
const dialog=document.createElement("dialog");dialog.id="exact-search";dialog.innerHTML='<form method="dialog"><div class="exact-dialog-top"><h2>Find social support services</h2><button type="button" aria-label="Close search" class="exact-close">×</button></div><label for="exact-query">Service or keyword</label><input type="search" id="exact-query" required placeholder="Search services across Jamaica"><button type="submit" class="exact-submit">Find services</button></form>';document.body.append(dialog);
dialog.querySelector(".exact-close").onclick=()=>dialog.close();
dialog.querySelector("form").onsubmit=e=>{e.preventDefault();const value=dialog.querySelector("input").value.trim();if(!value)return;dialog.close();nav("services");const f=document.getElementById("serviceSearch");if(f){f.value=value;f.dispatchEvent(new Event("input",{bubbles:true}));f.focus();}};
const activate=(a,arg)=>{switch(a){
case "nav":return nav(arg);
case "gia":if(window.MOHWGIA?.open){window.MOHWGIA.open();return true;}document.getElementById("gia2Launcher")?.click();return true;
case "access":document.querySelector('[data-p2="access"]')?.click();return true;
case "search":dialog.showModal();dialog.querySelector("input").focus();return true;
case "contact":return nav("contacts");
case "share":return tool("share");
case "report":return tool("issue");
case "message":return tool("feedback");
default:return false;}};
const zones=[
["Home","nav","about",118,112,161,59],["Referrals","nav","referrals",297,111,158,60],["Decision Guide","nav","decision",462,111,208,60],
["Find Services","nav","services",673,111,182,60],["Digital Manual","nav","manual",866,111,215,60],
["Accessibility & listening","access","",1090,111,271,60],["Search the site","search","",1001,23,293,59],
["Share this guide","share","",16,239,100,90],["Report an issue","report","",16,332,100,91],
["Send feedback","message","",16,430,100,91],["Download the manual","nav","manual",16,528,100,91],
["Contact agencies","contact","",16,623,100,91],
["Find services","nav","services",110,737,269,215],["Make a referral","nav","referrals",384,737,259,215],
["Get help choosing","nav","decision",650,737,270,215],["Read the manual","nav","manual",925,737,280,215],
["Open GIA chat assistant","gia","",1218,697,195,294],["MOHW home","nav","about",33,10,730,89]];
for(const [label,action,arg,x,y,w,h] of zones){
const b=document.createElement("button");b.className="exact-hit";b.type="button";b.setAttribute("aria-label",label);b.title=label;pos(b,x,y,w,h);box.append(b);
b.addEventListener("click",()=>{if(!activate(action,arg))notice.textContent="This action is not available.";});
}
const player=document.createElement("div");player.className="exact-player";pos(player,151,444,492,257);
const trigger=document.createElement("button");trigger.type="button";trigger.className="exact-play";trigger.setAttribute("aria-label","Play Gia introduction video");trigger.title="Play Gia introduction video";
const vid=document.createElement("video");vid.className="exact-video";vid.controls=true;vid.playsInline=true;vid.preload="metadata";vid.hidden=true;vid.setAttribute("aria-label","Gia video introduction");
player.append(trigger,vid);box.append(player);
const error=()=>{vid.hidden=true;trigger.hidden=false;vid.removeAttribute("src");vid.load();notice.textContent="Gia video has not been uploaded yet. Open Ask GIA for interactive help.";if(!player.querySelector(".exact-media-error")){const e=document.createElement("div");e.className="exact-media-error";e.innerHTML='<span>Video awaiting upload</span><button type="button">Ask GIA</button>';e.querySelector("button").onclick=()=>activate("gia");player.append(e);}};
trigger.onclick=()=>{player.querySelector(".exact-media-error")?.remove();vid.hidden=false;trigger.hidden=true;vid.src="assets/gia-introduction.mp4";vid.load();vid.play().catch(()=>{if(vid.error)error();else notice.textContent="Use video controls to play.";});};
vid.onerror=error;vid.onended=()=>{vid.hidden=true;trigger.hidden=false;};
view.prepend(box);const media=matchMedia("(min-width:900px)");let available=false;
function sync(){const exact=available&&media.matches&&!document.documentElement.classList.contains("p2-contrast");view.classList.toggle("exact-home-enabled",exact);box.hidden=!exact;document.documentElement.classList.toggle("exact-home-visible",exact&&view.classList.contains("active"));}
const mo=new MutationObserver(sync);mo.observe(view,{attributes:true,attributeFilter:["class"]});mo.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});media.addEventListener?.("change",sync);
image.onload=()=>{available=image.naturalWidth>0;sync();};image.onerror=()=>{available=false;sync();console.warn("Exact home artwork not yet uploaded.");};
if(image.complete&&image.naturalWidth){available=true;sync();}else sync();
})();