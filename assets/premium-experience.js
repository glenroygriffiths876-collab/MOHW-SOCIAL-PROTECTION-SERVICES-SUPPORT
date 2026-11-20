/* Additive welcome presentation for Gia; preserves the existing GIA dialog and guide tools. */
(()=>{
"use strict";
function ready(fn){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});else fn();}
ready(()=>{
 const home=document.querySelector("#view-about"),tiles=home?.querySelector(".p2-start");
 if(!home||!tiles||home.querySelector(".pm-gia-feature"))return;
 const feature=document.createElement("section");
 feature.className="pm-gia-feature";
 feature.setAttribute("aria-labelledby","pm-gia-title");
 feature.innerHTML='<div class="pm-gia-copy"><span class="pm-kicker">✦ Meet your virtual guide</span><h2 id="pm-gia-title">A warmer welcome with <em>GIA</em>.</h2><p>Discover how to find services across Jamaica, follow the referral steps and read the digital manual. GIA can also guide you through the next step.</p><ul class="pm-gia-tags"><li>Find services</li><li>Referral guidance</li><li>Interactive manual</li></ul><button type="button" class="pm-gia-action" id="pm-ask-gia">Ask GIA for help ↗</button></div><div class="pm-gia-media"><div class="pm-video-frame" id="pm-gia-video-frame"><div class="pm-video-poster" role="img" aria-label="GIA, the MOHW Social Support virtual guide"><span class="pm-video-caption">Meet GIA<small>Your guide to MOHW Social Support</small></span></div><video id="pm-gia-video" playsinline controls preload="metadata" poster="assets/gia-avatar.jpg" aria-label="GIA introduces MOHW Social Support" hidden></video></div><p class="pm-video-disclaimer" id="pm-gia-video-note">GIA is ready to help you navigate the guide.</p></div>';
 tiles.parentNode.insertBefore(feature,tiles);
 document.getElementById("pm-ask-gia").addEventListener("click",()=>{if(window.MOHWGIA?.open)window.MOHWGIA.open();else document.getElementById("gia2Launcher")?.click();});
 const extra=document.createElement("div");
 extra.className="pm-more";extra.setAttribute("aria-label","Explore more support resources");
 extra.innerHTML='<strong>Explore more</strong><button type="button" data-premium-nav="programmes">Programme directory ↗</button><button type="button" data-premium-nav="categories">Service categories ↗</button><button type="button" data-premium-nav="contacts">Contacts and agencies ↗</button>';
 tiles.insertAdjacentElement("afterend",extra);
 extra.addEventListener("click",e=>{const b=e.target.closest("[data-premium-nav]");if(!b)return;const id=b.dataset.premiumNav;const native=document.querySelector('[data-nav="'+id+'"]');if(native){native.click();return;}document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+id));location.hash=id;scrollTo({top:0,behavior:"smooth"});});
 const video=document.getElementById("pm-gia-video"),frame=document.getElementById("pm-gia-video-frame"),note=document.getElementById("pm-gia-video-note");
 // The original HD clip must be hosted as a same-origin file; do not use expiring third-party CDN links.
 const source="assets/gia-introduction.mp4";
 fetch(source,{method:"HEAD",cache:"no-store"}).then(r=>{
   if(!r.ok||!String(r.headers.get("content-type")||"").includes("video"))return;
   video.src=source;video.hidden=false;frame.classList.add("is-ready");
   note.textContent="GIA's introductory video • Play, pause, or use captions if provided.";
 }).catch(()=>{});
});
})();