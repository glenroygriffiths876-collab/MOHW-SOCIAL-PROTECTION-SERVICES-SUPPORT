/* GIA 2.0: privacy-first guided social-support and referral companion.
 * Uses the November 2026 guide data. Does not determine eligibility, store case data,
 * authenticate users, contact agencies, send messages, or verify live availability.
 */
(() => {
  "use strict";
  const GUIDE_URL = "./data/guide-content.json";
  const PARISHES = ["Not selected","Hanover","St. James","Westmoreland","Trelawny","St. Elizabeth","Manchester","Clarendon","St. Ann","St. Mary","Portland","St. Thomas","St. Catherine","St. Andrew","Kingston"];
  const TOPICS = [
    {id:"food",label:"Food & essentials",pattern:/food|hungr|meal|grocer|basic need|school feed|clothing/i,terms:"food meal school feeding poor relief assistance"},
    {id:"health",label:"Medication & care",pattern:/medicin|pharmac|nhf|prescri|treatment|medical|surg|scan|diagnos|dialysis|hospital|clinic|health/i,terms:"NHF compassionate treatment diagnostic medical health"},
    {id:"transport",label:"Getting to appointments",pattern:/transport|bus fare|taxi fare|travel to|getting to|can't get to|cannot get to|reach the clinic/i,terms:"poor relief emergency assistance transport appointment"},
    {id:"income",label:"Financial support",pattern:/cash|money|financial|benefit|path|nis|pension|unemploy|income|bill|poverty|poor|social pension/i,terms:"PATH NIS social pension cash poor relief assistance"},
    {id:"housing",label:"Housing & shelter",pattern:/hous|homeless|shelter|roof|rent|landlord|accommodation|home repairs|building/i,terms:"housing NHT new social housing poor relief"},
    {id:"disability",label:"Disability & caregiving",pattern:/disabil|autis|special need|caregiv|wheelchair|elderly|older person|senior|infirmary/i,terms:"disability senior caregiver infirmary support"},
    {id:"family",label:"Children & family",pattern:/child|baby|pregnan|teen|young mother|school|educat|family|parent|youth/i,terms:"child family protection school education support"},
    {id:"jobs",label:"Skills & employment",pattern:/job|work|employ|heart|training|skill|business|farmer|farm|rada|grant/i,terms:"HEART skills employment grants RADA JBDC"},
    {id:"wellbeing",label:"Emotional support",pattern:/mental|stress|counsel|anxiet|depress|substance|addict|drug use|psycholog/i,terms:"mental health NCDA counselling wellbeing"},
    {id:"safety",label:"Safety & protection",pattern:/abuse|violence|unsafe|neglect|victim|protection|crime|harass|gender.based|domestic|police/i,terms:"victim services child protection bureau gender safety"}
  ];
  const DANGER = /(?:suicid|kill myself|self.harm|overdos|immediate danger|life.threatening|unconscious|not breathing|severe bleeding|being attacked|right now.*(?:abuse|violence)|child.*(?:in danger|being abused)|abuse.*(?:happening now|right now))/i;
  const ALIASES = {"poor relief":"local government assistance","national health fund card":"nhf","heart nsta trust":"heart / nsta","nht home grant":"national housing trust (nht)","compassionate fund programme":"mohw compassionate fund programme","chase medical assistance":"chase / compassionate medical assistance"};
  const $ = (selector,root=document) => root.querySelector(selector);
  const $$ = (selector,root=document) => Array.from(root.querySelectorAll(selector));
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const normal = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  const words = value => normal(value).split(" ").filter(t=>t.length>2 && !["the","and","for","with","from","who","how","can","are","this","that","need","help","someone","please","about","support","have","would","like","want"].includes(t));
  const phone = value => {
    let p=String(value||"").replace(/[^\d]/g,"");
    if(p.length===10 && /^(876|658)/.test(p))p="1"+p;
    return p.length>=8 && p.length<=15 && p[0]!=="0" ? p : "";
  };
  const mapsUrl = (destination,parish,provided) => {
    const exact=String(provided||"").trim();
    try {const u=new URL(exact);if(u.protocol==="https:" && /^(www\.)?(google\.[a-z.]+|maps\.app\.goo\.gl|maps\.google\.[a-z.]+)$/.test(u.hostname) && (u.hostname.includes("maps")||u.pathname.includes("/maps")))return exact;}catch{}
    return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([destination,parish==="Not selected"?"":parish,"Jamaica"].filter(Boolean).join(", "));
  };
  const cleanDocs = value => {
    const input=String(value||"").replace(/\s*[•●]\s*/g,";").replace(/\n+/g,";");
    if(!input.trim()||/not specified/i.test(input))return [];
    return [...new Set(input.split(/;\s*/).map(s=>s.trim().replace(/\.$/,"")).filter(Boolean))].slice(0,18);
  };
  let guide=null, catalog=[];
  const state={
    view:"home", question:"", tone:"", topicIds:[], results:[], page:0, selected:null,
    parish:"Not selected", destination:"", mapsProvided:"", phone:"", ready:new Set(),
    consent:false, outcome:"", next:"", followDate:"", sessionRef:"", lastSource:"",
    recipientMode:"client"
  };
  const key = value => {
    const n=normal(value);return normal(ALIASES[n]||n).replace(/\s/g,"");
  };
  function buildCatalog(data){
    const records=new Map();
    function add(name,details,kind){
      const k=key(name); if(!k)return;
      let s=records.get(k);
      if(!s){s={id:k,name,kind,support:"",where:"",bring:"",process:"",targets:[],categories:[],contacts:[],meta:{},aliases:[]};records.set(k,s);}
      if(name!==s.name&&!s.aliases.includes(name))s.aliases.push(name);
      if(details){
        for(const f of ["support","where","bring","process"])if(!s[f] && details[f])s[f]=details[f];
        if(details.target&&!s.targets.includes(details.target))s.targets.push(details.target);
        if(details.category&&!s.categories.includes(details.category))s.categories.push(details.category);
      }
      return s;
    }
    (data.programmes||[]).forEach(p=>add(p.name,p,"programme"));
    (data.categories||[]).forEach(p=>add(p.programme,{support:p.benefits,target:p.target,category:p.category},"category"));
    const services=Array.from(records.values());
    services.forEach(s=>{
      const metaEntry=Object.entries(data.serviceMetadata||{}).find(([name])=>key(name)===s.id);
      s.meta=metaEntry ? metaEntry[1] : {};
      s.agency=s.meta.agency || s.name;
      const contactNames=(s.meta.contactAgencies||[]).map(normal);
      s.contacts=(data.contacts||[]).filter(c=>contactNames.some(n=>normal(c.agency).includes(n)||n.includes(normal(c.agency))));
    });
    (data.contacts||[]).forEach(c=>{
      if(services.some(s=>s.contacts.includes(c)))return;
      services.push({id:"agency-"+key(c.agency),name:c.agency,kind:"agency",support:"Contact this agency to discuss available services.",where:"Confirm the office and service with the agency.",bring:"",process:"Contact the responsible agency for the referral process.",targets:[],categories:["Agency contacts"],contacts:[c],meta:{},agency:c.agency,aliases:[]});
    });
    return services;
  }
  function topicMatches(query){
    return TOPICS.filter(t=>t.pattern.test(query)).map(t=>t.id);
  }
  function scoreServices(query){
    const tokens=words(query);
    const q=normal(query);
    const topics=topicMatches(query);
    const extra=topics.flatMap(id=>words(TOPICS.find(t=>t.id===id).terms));
    const scored=catalog.map(s=>{
      const title=normal(s.name+" "+s.aliases.join(" "));
      const agency=normal(s.agency);
      const categories=normal(s.categories.join(" "));
      const other=normal([s.support,s.where,s.process,s.bring,s.targets.join(" "),...s.contacts.map(c=>c.agency)].join(" "));
      let score=0, why=[];
      if(q&&title===q){score+=110;why.push("Exact programme match");}
      if(q&&q.length>3&&(title.includes(q)||agency.includes(q))){score+=52;why.push("Name matches your request");}
      tokens.forEach(t=>{
        if(title.split(" ").includes(t)){score+=15;}
        else if(agency.split(" ").includes(t)){score+=10;}
        else if(categories.split(" ").includes(t)){score+=7;}
        else if(other.includes(t)){score+=2;}
      });
      extra.forEach(t=>{
        if(title.split(" ").includes(t))score+=5;
        else if(categories.includes(t))score+=3;
        else if(other.includes(t))score+=0.5;
      });
      // Avoid listing contact-only records ahead of real programme profiles.
      if(s.kind==="agency")score*=0.65;
      return {service:s,score,why};
    }).filter(v=>v.score>1.5).sort((a,b)=>b.score-a.score);
    return scored.slice(0,14);
  }
  function composeDocs(s){
    let list=cleanDocs(s?.bring);
    if(!list.length){
      const matching=guide?.programmes?.find(p=>key(p.name)===s?.id);
      list=cleanDocs(matching?.bring);
    }
    return list;
  }
  const heading = value => "<h3 class=\"gia2-title\">"+esc(value)+"</h3>";
  const caption = value => "<p class=\"gia2-muted\">"+esc(value)+"</p>";
  const pill = (action,label,klass="") => "<button type=\"button\" class=\"gia2-pill "+klass+"\" data-action=\""+esc(action)+"\">"+esc(label)+"</button>";
  const line = (label,value) => value ? "<div class=\"gia2-fact\"><b>"+esc(label)+"</b><p>"+esc(value)+"</p></div>" : "";
  const short = (value,max=160) => String(value||"").length>max?String(value).slice(0,max-1)+"…":String(value||"");
  function subject(){
    return state.selected?.name||"the selected service";
  }
  function say(v){
    return "<div class=\"gia2-assistant\"><img src=\"./assets/gia-avatar.jpg\" alt=\"\" class=\"gia2-small-avatar\"><div class=\"gia2-bubble\">"+v+"</div></div>";
  }
  function options(){
    return "<div class=\"gia2-actions\">"+pill("start","New request")+pill("services","Browse services")+pill("documents","Documents")+pill("follow","Follow up")+"</div>";
  }
  function guidesource(){
    return "<small class=\"gia2-source\">November 2026 guide · Confirm current arrangements with the agency</small>";
  }
  function searchForm(){
    return "<form id=\"gia2SearchForm\" class=\"gia2-inputbar\"><label class=\"gia2-visually-hidden\" for=\"gia2Question\">Ask GIA</label><input id=\"gia2Question\" name=\"question\" autocomplete=\"off\" maxlength=\"320\" placeholder=\"e.g. Help with transport to clinic\" value=\""+esc(state.question)+"\" required><button class=\"gia2-send\" type=\"submit\" aria-label=\"Find support\">➜</button></form>";
  }
  function viewHome(){
    return say("<strong>Hello! I’m GIA.</strong><p>Tell me what someone needs, and I’ll help you find a sensible next step. We can also prepare a referral together.</p>")+
      "<div class=\"gia2-feature-grid\">"+
      pill("ask","Find the right support","gia2-feature")+pill("refer","Send a WhatsApp referral","gia2-feature")+
      pill("documents","What documents are needed?","gia2-feature")+pill("follow","Follow up on a referral","gia2-feature")+
      "</div>"+searchForm()+"<p class=\"gia2-privacy\">Please do not enter names, diagnoses or other private client details.</p>";
  }
  function viewResults(){
    if(state.results.length===0){
      return say("<strong>I’m not finding a clear match yet.</strong><p>Can you describe the main concern in a few words? For example: help with rent, medication, school or an older relative.</p>")+
      searchForm()+"<div class=\"gia2-actions\">"+TOPICS.slice(0,8).map(t=>pill("topic:"+t.id,t.label)).join("")+"</div>"+options();
    }
    const plural=state.topicIds.length>1;
    const intro=plural?"I noticed several possible needs. Here are a few starting points; we can deal with them one at a time.":"Here are the most relevant starting points I found in the guide.";
    const visible=state.results.slice(0,state.page?9:3);
    return "<div class=\"gia2-user-bubble\">"+esc(state.question)+"</div>"+say("<strong>"+intro+"</strong><p>You can review a service, check documents and prepare the next step without leaving GIA.</p>")+
      "<div class=\"gia2-service-list\">"+visible.map((r,i)=>{
        const s=r.service;
        return "<article class=\"gia2-service\"><div><span class=\"gia2-tag\">"+esc(s.kind==="agency"?"Agency":"Possible support")+"</span><h4>"+esc(s.name)+"</h4><p>"+esc(short(s.support,180))+"</p></div><button type=\"button\" class=\"gia2-choose\" data-service=\""+esc(s.id)+"\">Explore this service <span>→</span></button></article>";
      }).join("")+"</div>"+
      (state.results.length>3&&!state.page?pill("more","Show more options"):"")+
      "<div class=\"gia2-subtools\">"+pill("ask","Change the need")+pill("refer","Prepare a referral")+"</div>"+guidesource();
  }
  function viewService(){
    const s=state.selected;
    if(!s)return viewHome();
    const docs=composeDocs(s);
    const contact=s.contacts[0];
    return say("<strong>"+esc(s.name)+"</strong><p>This may be a useful starting point. Let’s check what it offers and prepare for the next step.</p>")+
      "<div class=\"gia2-detail\">"+
      line("Type of support",s.support)+line("Who it may help",s.targets.join("; "))+line("Where to start",s.where)+line("Guide-listed process",s.process)+
      (docs.length?"<div class=\"gia2-fact\"><b>Documents mentioned</b><p>"+esc(short(docs.join("; "),240))+"</p></div>":"")+
      (contact?"<details class=\"gia2-expand\"><summary>Agency contact details</summary><p>"+esc(contact.details)+"</p></details>":"")+
      (s.meta.officialUrl&&/^https:\/\//.test(s.meta.officialUrl)?"<a class=\"gia2-link\" href=\""+esc(s.meta.officialUrl)+"\" target=\"_blank\" rel=\"noopener noreferrer\">Official agency website ↗</a>":"")+
      "</div><div class=\"gia2-primary-actions\">"+
      pill("refer","Prepare WhatsApp referral","gia2-primary")+pill("checklist","Document checklist")+
      pill("directions","Find office on Google Maps")+pill("follow","Plan a follow-up")+"</div>"+
      "<div class=\"gia2-actions\">"+pill("backResults","Other options")+pill("start","New request")+"</div>"+guidesource();
  }
  function viewDocs(){
    const s=state.selected;
    if(!s){
      return say("<strong>Let’s find the right documents.</strong><p>Which programme or application are you preparing for? You can search by name or by the person’s need.</p>")+searchForm()+
      "<div class=\"gia2-document-directory\"><h4>How to obtain common documents</h4>"+(guide.documents||[]).map((d,i)=>"<details class=\"gia2-expand\"><summary>"+esc(d.document)+"</summary><p><b>Where:</b> "+esc(d.where)+"</p><p><b>What is needed:</b> "+esc(d.requirements)+"</p><p><b>Process:</b> "+esc(d.process)+"</p><p><b>Cost in guide:</b> "+esc(d.cost)+"</p></details>").join("")+"</div>"+options();
    }
    const docs=composeDocs(s);
    return say("<strong>Here is the document checklist for "+esc(s.name)+".</strong><p>Tick what the person already has. The requirements below come from the guide; the agency should confirm current requirements and alternatives.</p>")+
      (docs.length?"<div class=\"gia2-checklist\">"+docs.map((d,i)=>"<label><input type=\"checkbox\" data-doc=\""+i+"\" "+(state.ready.has(i)?"checked":"")+"><span>"+esc(d)+"</span></label>").join("")+"</div>":"<p class=\"gia2-muted\">This guide does not specify individual documents for this entry. Ask the receiving agency for its current checklist.</p>")+
      "<div class=\"gia2-checkline\" id=\"gia2DocProgress\">"+state.ready.size+" of "+docs.length+" marked available</div>"+
      "<div class=\"gia2-primary-actions\">"+pill("refer","Prepare WhatsApp message","gia2-primary")+pill("service","Back to service")+"</div>"+
      "<details class=\"gia2-expand\"><summary>How do I obtain missing documents?</summary>"+(guide.documents||[]).map(d=>"<div class=\"gia2-mini-doc\"><b>"+esc(d.document)+"</b><p>"+esc(d.where)+" · "+esc(short(d.process,175))+"</p></div>").join("")+"</details>";
  }
  function referralText(){
    const s=state.selected;
    const name=state.destination.trim()||(s?.agency||"the receiving agency");
    const map=mapsUrl(name,state.parish,state.mapsProvided);
    const docs=composeDocs(s);
    const checked=docs.map((d,i)=>(state.ready.has(i)?"☑ ":"☐ ")+d);
    return [
      "SOCIAL SUPPORT REFERRAL INFORMATION",
      "Hello. Here is information to help you prepare for your visit.",
      "",
      "Service: "+(s?.name||"Service to confirm"),
      "Where to enquire: "+name,
      "Parish: "+(state.parish==="Not selected"?"Please confirm":state.parish),
      "Google Maps: "+map,
      "",
      "Documents mentioned in the guide:",
      ...(checked.length?checked:["Please confirm the required documents with the agency."]),
      "",
      "Before travelling, please confirm the exact office, opening hours, eligibility, appointment needs and any fees.",
      s?.meta?.officialUrl ? "Agency website: "+s.meta.officialUrl : "",
      "Guide: https://glenroygriffiths876-collab.github.io/MOHW-SOCIAL-PROTECTION-SERVICES-SUPPORT/",
      "",
      "This message is preparation information, not confirmation of an appointment or approval."
    ].filter(v=>v!==null && v!==undefined).join("\n");
  }
  function viewRefer(){
    const s=state.selected;
    if(!s){
      return say("<strong>Absolutely. Which service are you referring someone to?</strong><p>Search for PATH, NHF, NIS, NHT, HEART, a clinic or another agency. I’ll help you prepare a clear message with the documents and a Maps link.</p>")+
      searchForm()+"<div class=\"gia2-actions\">"+pill("topic:income","PATH or income")+pill("topic:health","NHF or treatment")+pill("topic:family","Family services")+"</div>"+options();
    }
    const docs=composeDocs(s);
    const name=state.destination||s.agency||s.name;
    return say("<strong>Let’s prepare the referral for "+esc(s.name)+".</strong><p>Enter the recipient’s WhatsApp number and choose the specific office. I’ll prepare the message, but you decide whether to send it.</p>")+
      "<div class=\"gia2-form\">"+
      "<label for=\"gia2To\">Recipient’s WhatsApp number</label><input id=\"gia2To\" type=\"tel\" inputmode=\"tel\" autocomplete=\"off\" placeholder=\"e.g. 876 555 1234\" value=\""+esc(state.phone)+"\">"+
      "<label for=\"gia2Parish\">Parish for the visit</label><select id=\"gia2Parish\">"+PARISHES.map(v=>"<option "+(v===state.parish?"selected":"")+">"+esc(v)+"</option>").join("")+"</select>"+
      "<label for=\"gia2Destination\">Exact office, clinic or destination (edit as needed)</label><input id=\"gia2Destination\" maxlength=\"160\" value=\""+esc(name)+"\" placeholder=\"Enter the receiving office or facility\">"+
      "<label for=\"gia2Map\">Confirmed Google Maps link (optional)</label><input id=\"gia2Map\" type=\"url\" maxlength=\"650\" placeholder=\"Paste a confirmed Google Maps link\" value=\""+esc(state.mapsProvided)+"\">"+
      "<p class=\"gia2-muted\">Without a confirmed link, GIA generates a Google Maps search—not a verified office pin. Check the correct location before travelling.</p>"+
      (docs.length?"<div class=\"gia2-form-label\">Document preparation <span class=\"gia2-muted\">("+state.ready.size+" of "+docs.length+" available)</span></div><div class=\"gia2-compact-checks\">"+docs.map((d,i)=>"<label><input type=\"checkbox\" data-doc=\""+i+"\" "+(state.ready.has(i)?"checked":"")+"> "+esc(d)+"</label>").join("")+"</div>":"")+
      "<label class=\"gia2-consent\"><input id=\"gia2Consent\" type=\"checkbox\" "+(state.consent?"checked":"")+"> <span>The recipient agrees to receive this information through WhatsApp, and I have reviewed it for sensitive details.</span></label>"+
      "<details class=\"gia2-expand\"><summary>Preview the WhatsApp message</summary><pre id=\"gia2Preview\">"+esc(referralText())+"</pre></details>"+
      "<p class=\"gia2-error\" id=\"gia2Validation\" role=\"status\"></p>"+
      "<div class=\"gia2-primary-actions\">"+pill("openWhatsApp","Open WhatsApp to review","gia2-primary")+pill("copyReferral","Copy referral details")+pill("map","Open Google Maps")+"</div>"+
      "<p class=\"gia2-muted\">GIA does not send WhatsApp messages or collect the recipient’s number on a server. You review and send inside WhatsApp.</p>"+
      "</div><div class=\"gia2-actions\">"+pill("checklist","Review documents")+pill("service","Back to service")+pill("start","Start again")+"</div>";
  }
  function followText(){
    return [
      "SOCIAL SUPPORT FOLLOW-UP NOTE (DRAFT)",
      "Service: "+(state.selected?.name||"Not yet selected"),
      "Non-identifying reference: "+(state.sessionRef||"Not entered"),
      "Outcome: "+(state.outcome||"To confirm"),
      "Next step and responsible role: "+(state.next||"To be agreed"),
      "Follow-up date: "+(state.followDate||"To be agreed"),
      "Note: Transfer relevant details to your approved record. This page does not save case records or set reminders."
    ].join("\n");
  }
  function viewFollow(){
    return say("<strong>Let’s close the loop.</strong><p>What happened after the referral? We can prepare a concise follow-up note for your approved records.</p>")+
      "<div class=\"gia2-form\">"+
      "<label for=\"gia2CaseRef\">Non-identifying reference (optional)</label><input id=\"gia2CaseRef\" maxlength=\"50\" placeholder=\"e.g. referral 014\" value=\""+esc(state.sessionRef)+"\">"+
      "<label for=\"gia2Outcome\">What happened?</label><select id=\"gia2Outcome\"><option value=\"\">Choose an outcome</option>"+["Received assistance","Appointment arranged","Awaiting response","Could not access service","Declined assistance","Needs changed"].map(v=>"<option "+(state.outcome===v?"selected":"")+">"+v+"</option>").join("")+"</select>"+
      "<label for=\"gia2Next\">Next step and responsible role</label><textarea id=\"gia2Next\" maxlength=\"700\" rows=\"3\" placeholder=\"e.g. Referring worker to call the agency to confirm availability\">"+esc(state.next)+"</textarea>"+
      "<label for=\"gia2Date\">Date to check again</label><input id=\"gia2Date\" type=\"date\" value=\""+esc(state.followDate)+"\">"+
      "<details class=\"gia2-expand\"><summary>Preview the follow-up note</summary><pre id=\"gia2FollowPreview\">"+esc(followText())+"</pre></details>"+
      "<div class=\"gia2-primary-actions\">"+pill("copyFollow","Copy follow-up note","gia2-primary")+pill("printFollow","Print note")+"</div>"+
      "<p class=\"gia2-muted\">Nothing is saved here. This is not a case-management record or a reminder.</p></div>"+
      "<div class=\"gia2-actions\">"+pill("service","Back to service")+pill("start","New request")+"</div>";
  }
  function viewUrgent(){
    return say("<strong>This may need urgent support.</strong><p>If there is immediate danger, serious medical distress, abuse in progress or a child at risk, follow your facility’s emergency and safeguarding procedures first. Do not delay for a directory search.</p>")+
      "<div class=\"gia2-urgent\"><a href=\"tel:119\">Police emergency: <b>119</b></a><a href=\"tel:110\">Fire / ambulance: <b>110</b></a><a href=\"tel:211\">Child abuse reporting: <b>211</b></a></div>"+
      "<p class=\"gia2-muted\">Use a safe device and private communication method if violence or abuse is involved.</p>"+
      "<div class=\"gia2-actions\">"+pill("start","Back to GIA")+pill("services","Find additional support")+"</div>";
  }
  function render(){
    const content=$("#gia2Content");
    if(!content)return;
    const names={home:"Here to help",results:"Suggested support",service:"Service details",documents:"Document guidance",refer:"Prepare a referral",follow:"Follow-up",urgent:"Urgent support"};
    $("#gia2Step").textContent=names[state.view]||"Here to help";
    content.innerHTML=state.view==="home"?viewHome():state.view==="results"?viewResults():state.view==="service"?viewService():
      state.view==="documents"?viewDocs():state.view==="refer"?viewRefer():state.view==="follow"?viewFollow():state.view==="urgent"?viewUrgent():viewHome();
    content.scrollTop=0;
  }
  function open(view="home"){
    if(!guide){alert("GIA needs the guide data. Please refresh the page and try again.");return;}
    state.view=view;
    const dialog=$("#gia2Dialog");
    if(!dialog.open)dialog.showModal();
    $("#gia2Launcher").setAttribute("aria-expanded","true");
    document.body.classList.add("gia2-open");
    render();
    $("#gia2Close")?.focus();
  }
  function show(view){state.view=view;render();}
  function chooseService(id){
    const s=catalog.find(c=>c.id===id);
    if(!s)return;
    state.selected=s;state.ready=new Set();state.destination=s.agency||s.name;state.mapsProvided="";state.consent=false;
    show("service");
  }
  function handleAsk(raw){
    const question=String(raw||"").trim();
    if(!question)return;
    state.question=question;
    if(DANGER.test(question)){show("urgent");return;}
    const lower=normal(question);
    if(state.selected && /(?:whats ?app|send|refer(?:ral)?)/i.test(question) && question.length<95){show("refer");return;}
    if(state.selected && /(?:bring|documents?|paperwork|requirements?)/i.test(question) && question.length<95){show("documents");return;}
    if(state.selected && /(?:where|location|map|directions|address|office)/i.test(question) && question.length<70){show("service");return;}
    if(/^(hi|hello|hey|good morning|good evening)[!. ]*$/.test(lower)){show("home");return;}
    if(/^(follow up|followup|check referral)$/.test(lower)){show("follow");return;}
    state.topicIds=topicMatches(question);
    state.results=scoreServices(question);
    state.page=0;state.selected=null;state.ready=new Set();state.destination="";
    show("results");
  }
  function ensureServiceForReferral(){
    if(state.selected){show("refer");return;}
    state.question="";state.topicIds=[];state.results=[];show("refer");
  }
  async function copy(value){
    try{
      await navigator.clipboard.writeText(value);
      message("Copied. Review it before sharing.");
    }catch{
      const text=document.createElement("textarea");text.value=value;text.style.cssText="position:fixed;opacity:0;left:-9999px";
      document.body.append(text);text.select();
      try{document.execCommand("copy");message("Copied. Review it before sharing.");}
      catch{message("Unable to copy on this device. Use the preview to select the text.");}
      text.remove();
    }
  }
  function message(value,error=false){
    const el=$("#gia2Validation")||$("#gia2Status");
    if(el){el.textContent=value;el.classList.toggle("gia2-error",error);}
  }
  function preserveInputs(){
    const get=id=>$("#"+id)?.value;
    if(get("gia2To")!==undefined)state.phone=get("gia2To");
    if(get("gia2Parish")!==undefined)state.parish=get("gia2Parish");
    if(get("gia2Destination")!==undefined)state.destination=get("gia2Destination");
    if(get("gia2Map")!==undefined)state.mapsProvided=get("gia2Map");
    if($("#gia2Consent"))state.consent=$("#gia2Consent").checked;
    if(get("gia2Outcome")!==undefined)state.outcome=get("gia2Outcome");
    if(get("gia2Next")!==undefined)state.next=get("gia2Next");
    if(get("gia2Date")!==undefined)state.followDate=get("gia2Date");
    if(get("gia2CaseRef")!==undefined)state.sessionRef=get("gia2CaseRef");
    if(get("gia2Question")!==undefined)state.question=get("gia2Question");
  }
  function updatePreview(){
    const p=$("#gia2Preview");if(p)p.textContent=referralText();
    const f=$("#gia2FollowPreview");if(f)f.textContent=followText();
    const progress=$("#gia2DocProgress");if(progress)progress.textContent=state.ready.size+" of "+composeDocs(state.selected).length+" marked available";
  }
  function launchWhatsApp(){
    preserveInputs();
    const digits=phone(state.phone);
    if(!digits){message("Enter a valid phone number, including the area or country code.",true);$("#gia2To")?.focus();return;}
    if(!state.destination.trim()){message("Enter the office or facility you want the recipient to find.",true);$("#gia2Destination")?.focus();return;}
    if(!state.consent){message("Please confirm the recipient agrees to receive this information and that you have reviewed its contents.",true);$("#gia2Consent")?.focus();return;}
    const url="https://wa.me/"+digits+"?text="+encodeURIComponent(referralText());
    const opened=window.open(url,"_blank","noopener,noreferrer");
    message("WhatsApp opened for review. GIA has not sent the message.");
  }
  function doPrint(){
    const pre=document.createElement("pre");pre.id="gia2Print";pre.textContent=followText();
    document.body.append(pre);document.body.classList.add("gia2-print");
    try{window.print();}finally{document.body.classList.remove("gia2-print");pre.remove();}
  }
  function act(action){
    preserveInputs();
    if(action==="start"){Object.assign(state,{view:"home",question:"",topicIds:[],results:[],page:0,selected:null,parish:"Not selected",destination:"",mapsProvided:"",phone:"",ready:new Set(),consent:false,outcome:"",next:"",followDate:"",sessionRef:""});show("home");return;}
    if(action==="ask"){state.question="";show("home");$("#gia2Question")?.focus();return;}
    if(action==="services"){document.querySelector('[data-nav="services"]')?.click();$("#gia2Dialog").close();return;}
    if(action==="documents"){show("documents");return;}
    if(action==="checklist"){show("documents");return;}
    if(action==="refer"){ensureServiceForReferral();return;}
    if(action==="service"){show(state.selected?"service":"home");return;}
    if(action==="follow"){show("follow");return;}
    if(action==="backResults"){show("results");return;}
    if(action==="more"){state.page=1;show("results");return;}
    if(action.startsWith("topic:")){
      const topic=TOPICS.find(t=>t.id===action.slice(6));if(topic)handleAsk(topic.terms);return;
    }
    if(action==="directions"||action==="map"){
      const s=state.selected;
      const url=mapsUrl(state.destination||s?.agency||"social services",state.parish,state.mapsProvided);
      window.open(url,"_blank","noopener,noreferrer");message("This is a Maps search. Confirm the exact office before travelling.");return;
    }
    if(action==="openWhatsApp"){launchWhatsApp();return;}
    if(action==="copyReferral"){copy(referralText());return;}
    if(action==="copyFollow"){copy(followText());return;}
    if(action==="printFollow"){doPrint();return;}
  }
  function mount(){
    if($("#gia2Launcher"))return;
    const button=document.createElement("button");
    button.type="button";button.id="gia2Launcher";button.className="gia2-launcher";
    button.setAttribute("aria-label","Open GIA social support assistant");button.setAttribute("aria-expanded","false");
    button.innerHTML="<img src=\"./assets/gia-avatar.jpg\" alt=\"\"><span><b>Ask GIA</b><small>I'm here to help</small></span>";
    const dialog=document.createElement("dialog");
    dialog.id="gia2Dialog";dialog.className="gia2-dialog";dialog.setAttribute("aria-labelledby","gia2Heading");
    dialog.innerHTML="<header class=\"gia2-header\"><img class=\"gia2-avatar\" src=\"./assets/gia-avatar.jpg\" alt=\"\"><div class=\"gia2-heading\"><h2 id=\"gia2Heading\">GIA <span>· Your support guide</span></h2><p id=\"gia2Step\">Here to help</p></div><button type=\"button\" class=\"gia2-close\" id=\"gia2Close\" aria-label=\"Close GIA\">×</button></header><main id=\"gia2Content\" class=\"gia2-content\"></main><footer class=\"gia2-footer\"><span><i class=\"gia2-online\"></i> Guided by the MOHW Social Support directory</span><span class=\"gia2-note\" id=\"gia2Status\" role=\"status\"></span></footer>";
    document.body.append(button,dialog);
    button.addEventListener("click",()=>open());
    $("#gia2Close").addEventListener("click",()=>dialog.close());
    dialog.addEventListener("close",()=>{document.body.classList.remove("gia2-open");button.setAttribute("aria-expanded","false");button.focus();});
    dialog.addEventListener("submit",e=>{
      if(e.target.id!=="gia2SearchForm")return;
      e.preventDefault();preserveInputs();handleAsk(state.question);
    });
    dialog.addEventListener("click",e=>{
      const service=e.target.closest("[data-service]");
      if(service){preserveInputs();chooseService(service.dataset.service);return;}
      const action=e.target.closest("[data-action]");if(action)act(action.dataset.action);
    });
    dialog.addEventListener("change",e=>{
      if(e.target.matches("[data-doc]")){
        const i=Number(e.target.dataset.doc);
        if(e.target.checked)state.ready.add(i);else state.ready.delete(i);
        updatePreview();return;
      }
      preserveInputs();updatePreview();
    });
    dialog.addEventListener("input",e=>{
      if(e.target.matches("#gia2To,#gia2Destination,#gia2Map,#gia2Parish,#gia2CaseRef,#gia2Next,#gia2Date,#gia2Outcome")){
        preserveInputs();updatePreview();
      }
    });
    render();
  }
  document.addEventListener("DOMContentLoaded",async()=>{
    try{
      const response=await fetch(GUIDE_URL,{cache:"no-store"});
      if(!response.ok)throw new Error("Guide unavailable");
      guide=await response.json();catalog=buildCatalog(guide);
    }catch(error){console.warn("GIA could not load guide data",error);}
    mount();
  },{once:true});
})();
