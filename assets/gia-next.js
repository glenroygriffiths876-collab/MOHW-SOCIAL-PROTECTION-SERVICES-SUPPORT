/* GIA 5.0: privacy-first guided social-support and referral companion.
 * Uses the November 2026 guide data. Does not determine eligibility, store case data,
 * authenticate users, contact agencies, send messages, or verify live availability.
 */
(() => {
  "use strict";
  const GUIDE_URL = "./data/guide-content.json";
  const PARISH_URL = "./data/gia-parishes.json";
  const PARISHES = ["Not selected","Hanover","St. James","Westmoreland","Trelawny","St. Elizabeth","Manchester","Clarendon","St. Ann","St. Mary","Portland","St. Thomas","St. Catherine","St. Andrew","Kingston"];
  const TOPICS = [
    {id:"food",label:"Food & essentials",pattern:/food|hungr|meal|grocer|basic need|school feed|clothing/i,terms:"food meal school feeding poor relief assistance"},
    {id:"health",label:"Medication & care",pattern:/medic(?:in|at)|\bmeds\b|pharmac|nhf|prescri|treatment|medical|surg|scan|diagnos|dialysis|hospital|clinic|health/i,terms:"NHF compassionate treatment diagnostic medical health"},
    {id:"transport",label:"Getting to appointments",pattern:/transport|bus fare|taxi fare|travel to|getting to|can't get to|cannot get to|reach the clinic/i,terms:"poor relief emergency assistance transport appointment"},
    {id:"income",label:"Financial support",pattern:/cash|money|financial|benefit|path|nis|pension|unemploy|income|bill|poverty|poor|social pension/i,terms:"PATH NIS social pension cash poor relief assistance"},
    {id:"housing",label:"Housing & shelter",pattern:/hous|homeless|shelter|roof|rent|landlord|accommodation|home repairs|building/i,terms:"housing NHT new social housing poor relief"},
    {id:"disability",label:"Disability & caregiving",pattern:/disabil|autis|special need|caregiv|wheelchair|elderly|older person|senior|infirmary/i,terms:"disability senior caregiver infirmary support"},
    {id:"family",label:"Children & family",pattern:/child|baby|pregnan|teen|young mother|school|educat|family|parent|youth/i,terms:"child family protection school education support"},
    {id:"jobs",label:"Skills & employment",pattern:/job|work|employ|heart|training|skill|business|farmer|farm|rada|grant/i,terms:"HEART skills employment grants RADA JBDC"},
    {id:"wellbeing",label:"Emotional support",pattern:/mental|stress|counsel|anxiet|depress|substance|addict|drug use|psycholog/i,terms:"mental health NCDA counselling wellbeing"},
    {id:"safety",label:"Safety & protection",pattern:/abuse|violence|unsafe|neglect|victim|protection|crime|harass|gender.based|domestic|police/i,terms:"victim services child protection bureau gender safety"}
  ];
  const DANGER = /(?:suicid|kill myself|hurt(?:ing)?\s+(?:myself|himself|herself|themselves)|harm(?:ing)?\s+(?:myself|himself|herself|themselves)|(?:want|planning)\s+to\s+die|(?:do not|don.t)\s+want\s+to\s+live|end\s+(?:my|his|her)\s+life|self[ -]?harm|take (?:my|his|her) life|overdos|immediate danger|life[ -]?threatening|unconscious|not breathing|severe bleeding|being attacked|right now.*(?:abuse|violence)|child.*(?:in danger|being abused)|abuse.*(?:happening now|right now))/i;
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
  // Only genuine Google Maps hosts/paths are accepted as confirmed destination links.
  // A general Google Maps SEARCH is generated when no verified pin is provided.
  const validMapsLink = value => {
    try {
      const u=new URL(String(value||"").trim());
      if(u.protocol!=="https:" || u.username || u.password) return false;
      const host=u.hostname.toLowerCase();
      if(host==="maps.app.goo.gl") return true;
      if(host==="goo.gl") return u.pathname.startsWith("/maps/");
      const exactHosts=["google.com","google.com.jm","google.co.uk","google.ca","google.com.au"];
      const base=host.replace(/^(?:www\.|maps\.)/,"");
      return exactHosts.includes(base)&&(/(?:^\/maps(?:\/|$))/.test(u.pathname)||host.startsWith("maps."));
    } catch {return false;}
  };
  const mapsUrl = (destination,parish,provided) => {
    const exact=String(provided||"").trim();
    if(exact && validMapsLink(exact))return exact;
    return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([destination,parish==="Not selected"?"":parish,"Jamaica"].filter(Boolean).join(", "));
  };
  const cleanDocs = value => {
    const input=String(value||"").replace(/\s*[•●]\s*/g,";").replace(/\n+/g,";");
    if(!input.trim()||/not specified/i.test(input))return [];
    return [...new Set(input.split(/;\s*/).map(s=>s.trim().replace(/\.$/,"")).filter(Boolean))].slice(0,18);
  };
  let guide=null, catalog=[], parishDirectory=null;
  const state={
    view:"home", question:"", tone:"", topicIds:[], results:[], page:0, selected:null,
    parish:"Not selected", destination:"", mapsProvided:"", phone:"", ready:new Set(),
    consent:false, outcome:"", next:"", followDate:"", sessionRef:"", lastSource:"",
    recipientMode:"client", customDocs:"", focusTopic:"", originalQuestion:"", guidePage:"", barrier:"", documentNotes:"", role:"", localOfficeUsed:""
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
    (data.decision||[]).forEach(d=>{if(d.situation&&d.options)add("Guide: "+d.situation,{support:d.options,where:d.provider,process:"Contact the relevant provider to confirm the correct referral route."},"decision");});
    const services=Array.from(records.values());
    services.forEach(s=>{
      const metaEntry=Object.entries(data.serviceMetadata||{}).find(([name])=>key(name)===s.id);
      s.meta=metaEntry ? metaEntry[1] : {};
      s.agency=s.meta.agency || (s.kind==="decision" ? (s.where||s.name) : s.name);
      const contactNames=(s.meta.contactAgencies||[]).map(normal);
      s.contacts=(data.contacts||[]).filter(c=>contactNames.some(n=>normal(c.agency).includes(n)||n.includes(normal(c.agency))));
    });
    (data.contacts||[]).forEach(c=>{
      if(services.some(s=>s.contacts.includes(c)))return;
      services.push({id:"agency-"+key(c.agency),name:c.agency,kind:"agency",support:"Contact this agency to discuss available services.",where:"Confirm the office and service with the agency.",bring:"",process:"Contact the responsible agency for the referral process.",targets:[],categories:["Agency contacts"],contacts:[c],meta:{},agency:c.agency,aliases:[]});
    });
    return services;
  }

  const namedServiceAliases = [
    ["PATH",["path","programme of advancement through health"]],
    ["NHF",["nhf","national health fund"]],
    ["NIS",["nis","national insurance scheme"]],
    ["National Housing Trust (NHT)",["nht","national housing trust"]],
    ["HEART / NSTA",["heart","heart nsta","heart trust"]],
    ["Local Government Assistance",["poor relief","municipal corporation assistance"]],
    ["Child Protection and Family Services Agency (CPFSA)",["cpfsa","child protection agency"]],
    ["Victim Services Branch",["victim services","victim support"]],
    ["NCDA Support",["ncda","national council on drug abuse"]],
    ["New Social Housing Programme (NSHP)",["nshp","new social housing"]]
  ];
  function explicitService(query){
    const q=" "+normal(query)+" ";
    for(const [name,aliases] of namedServiceAliases){
      if(aliases.some(a=>q.includes(" "+normal(a)+" "))){
        const match=catalog.find(s=>key(s.name)===key(name));
        if(match)return match;
      }
    }
    const named=catalog.filter(s=>s.kind!=="decision" && s.name.length>6 &&
      q.includes(" "+normal(s.name)+" "));
    return named.length===1?named[0]:null;
  }
  function extractParish(query){
    const q=" "+normal(query)+" ";
    return PARISHES.find(p=>p!=="Not selected"&&q.includes(" "+normal(p)+" "))||null;
  }
  const friendlyNeeds = ids => ids.map(id=>TOPICS.find(t=>t.id===id)?.label.toLowerCase()).filter(Boolean);
  function sayNeeds(ids){
    const labels=friendlyNeeds(ids);
    if(labels.length===0)return "the person's situation";
    if(labels.length===1)return labels[0];
    if(labels.length===2)return labels.join(" and ");
    return labels.slice(0,-1).join(", ")+", and "+labels.at(-1);
  }
  function topicFocus(id){
    state.focusTopic=id;
    const selected=TOPICS.find(t=>t.id===id);
    const context=(state.originalQuestion||state.question).match(/\b(?:elderly|senior|older person|child|children|student|pregnant|wheelchair|autism|disabled)\b/ig)?.join(" ")||"";
    state.results=scoreServices((selected?.terms||"")+" "+context);
    state.page=0;
    show("results");
  }

  // These are safe process-navigation suggestions, not promises that an agency will accommodate them.
  const BARRIERS = [
    {id:"missing",label:"Missing documents",pattern:/(?:no|missing|lost|lack|without|don.t have|do not have|can.t find|cannot find|expired|stolen).{0,36}(?:id|identification|documents?|paperwork|trn|certificate|passport)|(?:documents?|id).{0,24}(?:missing|lost|expired|stolen)/i,
      advice:"Ask the receiving agency which documents are essential, which alternatives may be accepted, and whether an initial assessment can start while replacements are being obtained.",
      questions:["Which documents are essential for this particular service?","Are substitute documents accepted, and must originals be presented?","Can an initial enquiry or assessment begin before the replacement is ready?"]},
    {id:"travel",label:"Cannot travel",pattern:/(?:can.t|cannot|unable to|no way to|cannot afford to|can.t afford to).{0,25}(?:travel|attend|come|visit|get there)|(?:no|lack of|cannot afford|can.t afford).{0,20}(?:transport|bus fare|taxi fare|wheelchair access)/i,
      advice:"Ask about the nearest appropriate office, accessible appointments, telephone enquiries, authorised representatives, and any locally available transport support. Confirm what is actually offered.",
      questions:["Is there a nearer or accessible point of service?","Is telephone intake or an authorised representative possible?","Does a social worker or community support service know of suitable assistance?"]},
    {id:"cost",label:"Cannot afford costs",pattern:/(?:cannot|can.t|unable to).{0,20}(?:pay|afford)|(?:no money|too expensive|cost too much|fees? too high)/i,
      advice:"Confirm every cost, any existing subsidy or fee-waiver arrangement, and whether the facility social worker can identify appropriate support. Do not promise funding.",
      questions:["What are the actual application, travel, and service costs?","Is any subsidy or fee reduction available for this situation?","Who can assess hardship and suggest another referral route?"]},
    {id:"response",label:"Agency not responding",pattern:/(?:no response|not answering|phone unanswered|phone keeps ringing|no one answered|nobody answers|can't reach|cannot reach|contact not working|office closed|never called back)/i,
      advice:"Confirm the current phone number and hours through an official source. Document contact attempts in the approved record, try an alternative authorised channel, or ask the facility social worker to assist with escalation.",
      questions:["What are the current contact details and hours?","Is there another authorised telephone or email contact?","Who is the appropriate supervisor or referral contact for escalation?"]},
    {id:"unavailable",label:"Service unavailable",pattern:/(?:service unavailable|no space|no vacancies|not taking applicants|application refused|turned away|not eligible|rejected|not accepting|service not offered)/i,
      advice:"Clarify whether the barrier is eligibility, capacity, catchment area or missing documents. Consider another guide-listed option and confirm its suitability before redirecting the person.",
      questions:["Why could the application not proceed?","Is this a temporary capacity issue, catchment restriction or eligibility decision?","Is there another appropriate service or a formal review or appeal route?"]},
    {id:"communication",label:"Communication or accessibility",pattern:/(?:cannot read|can.t read|can't hear|deaf|blind|needs an interpreter|communication difficulty|needs a caregiver|language barrier|cannot understand)/i,
      advice:"Ask the person how they want information provided, whether they consent to caregiver involvement, and what accessibility or interpretation arrangements the receiving service can confirm.",
      questions:["What communication format works best for the person?","May an authorised caregiver or supporter be involved?","Can the agency provide accessible communication or a reasonable accommodation?"]}
  ];
  const barrierFor = (query) => BARRIERS.find(b=>b.pattern.test(query));
  const barrierById = id => BARRIERS.find(b=>b.id===id);
  function viewBarrier(){
    const b=barrierById(state.barrier);
    if(!b) return viewService();
    const name=state.selected?.name||"the service";
    return say("<strong>We can work around this step by step.</strong><p>"+esc(b.advice)+"</p>")+
      "<div class=\"gia2-barrier-panel\"><h4>"+esc(b.label)+" · "+esc(name)+"</h4><p>Questions to ask the receiving agency:</p><ol>"+b.questions.map(q=>"<li>"+esc(q)+"</li>").join("")+"</ol></div>"+
      "<div class=\"gia2-primary-actions\">"+pill("copyBarrier","Copy questions for agency","gia2-primary")+
      (state.selected?pill("refer","Prepare a referral"):pill("services","Browse services"))+
      pill("follow","Record follow-up")+"</div>"+
      "<div class=\"gia2-actions\">"+pill("service","Return to service")+pill("start","New request")+"</div>";
  }
  function barrierText(){
    const b=barrierById(state.barrier);
    return b?["REFERRAL BARRIER — QUESTIONS TO CONFIRM","Service: "+(state.selected?.name||"To be confirmed"),"Barrier: "+b.label,
      "Suggested approach: "+b.advice,"Questions:",...b.questions.map((q,i)=>(i+1)+". "+q),
      "Confirm any alternatives and arrangements directly with the receiving agency before making promises to a patient."].join("\n"):"No barrier chosen.";
  }
  const NEED_ORDER=["safety","health","food","housing","transport","disability","family","income","wellbeing","jobs"];
  function roadmap(){
    const ids=[...new Set(state.topicIds)].sort((a,b)=>NEED_ORDER.indexOf(a)-NEED_ORDER.indexOf(b));
    return ids.map(id=>{
      const t=TOPICS.find(x=>x.id===id);
      const results=scoreServices(t?.terms||"").filter(x=>x.service.kind!=="decision").slice(0,2);
      return {id,label:t?.label||id,results:results.map(x=>x.service)};
    });
  }
  function roadmapText(){
    const r=roadmap();
    return [
      "SOCIAL SUPPORT — MULTIPLE NEEDS PLAN (DRAFT)",
      "Discuss priorities with the person. If anyone is in immediate danger follow emergency or safeguarding procedures first.",
      ...r.flatMap((x,i)=>["\n"+(i+1)+". "+x.label,"Potential starting points: "+(x.results.map(p=>p.name).join(" / ")||"Seek a medical social work assessment"),"Action: Confirm the correct service, local point of contact, documents and availability with the receiving agency."]),
      "\nThis plan suggests enquiries, not eligibility or acceptance. Record actual referrals in the approved system."
    ].join("\n");
  }
  function viewRoadmap(){
    const steps=roadmap();
    return say("<strong>Here’s a simple way to organise the different needs.</strong><p>This is a draft starting sequence—not a clinical assessment or a decision about eligibility. Discuss the priorities with the person and confirm each referral.</p>")+
      "<div class=\"gia2-roadmap\">"+steps.map((x,i)=>"<article><span>"+(i+1)+"</span><div><h4>"+esc(x.label)+"</h4><p>Possible starting points: "+esc(x.results.map(s=>s.name).join(" · ")||"Ask a medical social worker")+"</p><button class=\"gia2-choose\" type=\"button\" data-action=\"focus:"+esc(x.id)+"\">Explore this need →</button></div></article>").join("")+"</div>"+
      "<div class=\"gia2-primary-actions\">"+pill("copyRoadmap","Copy the plan","gia2-primary")+pill("backResults","Back to options")+"</div>";
  }


  const roleIsProvider = ()=>state.role==="provider";
  const contextRole = ()=>roleIsProvider()?"Healthcare or social-service provider":state.role==="client"?"Individual or caregiver":"Choose your role";
  const parishChosen = ()=>state.parish!=="Not selected";
  const parishKnown = ()=>parishChosen() && !!parishDirectory?.parishes?.[state.parish];
  const parishRecord = ()=>parishKnown()?parishDirectory.parishes[state.parish]:null;
  function directoryRoute(s){
    const text=normal(s?.name||"")+" "+normal(s?.agency||"");
    if(/\bnht\b|national housing trust/.test(text))return "nht";
    if(/\bnis\b|national insurance|social pension/.test(text))return "nis";
    if(/\bpath\b|programme of advancement/.test(text))return "path";
    if(/\bnhf\b|national health fund|j a d e p|jadep/.test(text))return "nhf";
    if(/\bheart\b|\bnsta\b|skills training|vocational/.test(text))return "heart";
    if(/local government|poor relief|municipal/.test(text))return "poor-relief";
    if(/police station|police post|constabulary/.test(text+" "+normal(state.destination)))return "police";
    if(/hospital|health|clinic|diagnostic|medical|compassionate fund/.test(text))return "health";
    return "general";
  }
  function mapSearch(title){
    return mapsUrl(title,state.parish,"");
  }
  function linkTo(url,title){
    if(!/^https:\/\//.test(url||""))return "";
    return "<a class=\"gia2-local-link\" href=\""+esc(url)+"\" target=\"_blank\" rel=\"noopener noreferrer\">"+esc(title)+" ↗</a>";
  }
  function contextBar(){
    const options=PARISHES.map(p=>"<option value=\""+esc(p)+"\" "+(p===state.parish?"selected":"")+">"+esc(p==="Not selected"?"Select parish":p)+"</option>").join("");
    return "<div class=\"gia2-context\" id=\"gia2Context\"><div class=\"gia2-context-field\"><label for=\"gia2Role\">I am...</label><select id=\"gia2Role\"><option value=\"\" "+(!state.role?"selected":"")+">Choose my role</option><option value=\"client\" "+(state.role==="client"?"selected":"")+">Seeking help</option><option value=\"provider\" "+(state.role==="provider"?"selected":"")+">Health/social worker</option></select></div>"+
      "<div class=\"gia2-context-field\"><label for=\"gia2ContextParish\">Parish</label><select id=\"gia2ContextParish\">"+options+"</select></div></div>";
  }
  function localOfficeMarkup(office,kind,canSelect){
    if(!office)return "";
    return "<div class=\"gia2-local-office\"><span class=\"gia2-local-tag\">Official directory listing · confirm current details</span>"+
      "<strong>"+esc(office.name)+"</strong><p>"+esc(office.address)+"</p><p>Telephone listed: <a href=\"tel:"+esc(office.phone.replace(/[^\d]/g,""))+"\">"+esc(office.phone)+"</a></p>"+
      (office.scope?"<p class=\"gia2-local-caution\">"+esc(office.scope)+"</p>":"")+
      "<div class=\"gia2-local-actions\">"+linkTo(office.source,"Official agency listing")+linkTo(mapSearch(office.address),"Find address on Maps")+
      (canSelect?pill("useOffice:"+kind,"Use this office in referral"):"")+"</div></div>";
  }
  function parishHelp(s){
    const route=directoryRoute(s);
    if(!parishChosen()){
      return "<div class=\"gia2-local-panel\"><h4>Find support in the right parish</h4><p>Choose a parish at the top. I'll show official local office listings where available and the appropriate health region. Until then these are national programmes, not confirmed local facilities.</p></div>";
    }
    if(!parishKnown()){
      return "<div class=\"gia2-local-panel\"><h4>"+esc(state.parish)+" guidance</h4><p>The local office directory is not available at the moment. You can still use a parish-specific Maps search, but confirm the receiving office with the agency.</p>"+
        linkTo(mapSearch(s?.name||state.destination||"social services office"),"Search "+state.parish+" offices")+"</div>";
    }
    const p=parishRecord();
    const label=esc(state.parish);
    let content="";
    if(route==="nht")content=localOfficeMarkup(p.nht,"nht",true);
    else if(route==="nis")content=localOfficeMarkup(p.mlss,"mlss",true);
    else if(route==="path")content=
      "<p>PATH is administered through MLSS. Please confirm which "+label+" office handles PATH enquiries before directing someone there.</p>"+
      localOfficeMarkup(p.mlss,"mlss",false)+linkTo(parishDirectory.serviceRoutes.path.source,"Official PATH information");
    else if(route==="nhf")content=
      "<p>NHF-approved pharmacies and services vary by facility. Search the official provider directory for "+label+" and check which services the selected location provides.</p>"+
      linkTo(parishDirectory.sources.nhf,"Find NHF providers")+linkTo(parishDirectory.sources.nhfDrugServ,"Find Drug Serv locations");
    else if(route==="heart")content=
      "<p>Training institutions, courses and parish intake arrangements vary. Use the official HEART/NSTA directory to locate a suitable "+label+" option.</p>"+
      linkTo(parishDirectory.sources.heart,"HEART parish contacts")+linkTo(parishDirectory.sources.heartProgrammes,"HEART training programmes");
    else if(route==="poor-relief")content=
      "<p>Ask the "+label+" municipal corporation/poor relief department about the appropriate local assessment and intake route. This guide does not verify a specific office address.</p>"+
      linkTo("https://www.localgovjamaica.gov.jm/","Local Government ministry")+linkTo(mapSearch("Municipal Corporation Poor Relief Office"),"Search local offices on Maps");
    else if(route==="police")content=
      "<p>Police stations and their contact arrangements can differ within "+label+". Confirm the correct station and emergency arrangements through official channels. Do not treat a Maps result as a verified station.</p>"+
      linkTo(mapSearch(state.destination||"Police Station"),"Search police stations on Maps");
    else if(route==="health")content=
      "<p>For public healthcare referrals, "+label+" is served by the <strong>"+esc(p.healthAuthority.name)+"</strong>. Confirm the particular hospital, health centre or social work service before advising travel.</p>"+
      linkTo(parishDirectory.sources.health,"MOHW health authorities")+
      linkTo(mapSearch(s?.kind==="custom" ? state.destination||"public health centre" : s?.name||"health centre"),"Search "+state.parish+" services on Maps");
    else content=
      "<p>This service may operate nationally or through another local agency. Confirm its "+label+" catchment and current service point before travelling.</p>"+
      linkTo(s?.meta?.officialUrl||parishDirectory.sources.health,"Find agency information")+
      linkTo(mapSearch(s?.name||"social services office"),"Search "+state.parish+" on Maps");
    if(route!=="health"&&route!=="general")content+="<p class=\"gia2-local-caution\">For healthcare or social-work handover: "+esc(p.healthAuthority.name)+".</p>";
    return "<section class=\"gia2-local-panel\"><div class=\"gia2-local-heading\"><span>📍</span><div><h4>"+label+" service guidance</h4><p>"+esc(p.healthAuthority.name)+"</p></div></div>"+content+
      "<small>Address or agency page listed in an official directory, not a confirmed appointment, eligibility decision, opening status or GPS pin. Source directory checked 15 November 2026.</small></section>";
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
      const exactNames=[s.name,...s.aliases].map(normal);
      const agency=normal(s.agency);
      const categories=normal(s.categories.join(" "));
      const other=normal([s.support,s.where,s.process,s.bring,s.targets.join(" "),...s.contacts.map(c=>c.agency)].join(" "));
      let score=0, why=[];
      if(q&&exactNames.includes(q)){score+=110;why.push("Exact programme match");}
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
      // Situational matching favours a specific route over generic mentions.
      const n=normal(s.name);
      if(topics.includes("transport") && n==="local government assistance")score+=48;
      if(topics.includes("transport") && n==="mlss emergency assistance")score+=16;
      if(topics.includes("food") && /elderly|older|senior/.test(q) && /meals on wheels/.test(n))score+=48;
      if(topics.includes("food") && /student|school|child/.test(q) && n==="school feeding")score+=46;
      if(topics.includes("food") && /elderly|older|senior/.test(q) && n==="school feeding")score-=25;
      if(topics.includes("disability") && n==="economic empowerment grant")score+=45;
      if(topics.includes("food") && /elderly|older|senior/.test(q) && n==="economic empowerment grant")score-=38;
      if(topics.includes("disability") && n==="local government assistance")score+=24;
      if(topics.includes("disability") && topics.includes("family") && !topics.includes("safety") && n.includes("child protection"))score-=28;
      if(topics.includes("wellbeing") && /substance|addict|drug use/.test(q) && /ncda/.test(n))score+=45;
      if(topics.includes("wellbeing") && /mental|psycholog|depress|anxiet/.test(q) && s.kind==="decision" && /mental health/.test(n))score+=55;
      if(s.kind==="agency")score*=0.65;
      if(s.kind==="decision")score*=0.90;
      return {service:s,score,why};
    }).filter(v=>v.score>1.5).sort((a,b)=>b.score-a.score);
    return scored.slice(0,20);
  }
  function composeDocs(s){
    let list=cleanDocs(s?.bring);
    if(!list.length){
      const matching=guide?.programmes?.find(p=>key(p.name)===s?.id);
      list=cleanDocs(matching?.bring);
    }
    const additions=String(state.customDocs||"").split(/\n|;/).map(x=>x.trim()).filter(Boolean);
    return [...new Set([...list,...additions])].slice(0,24);
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

  const voiceAvailable=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  const voiceButton=()=>voiceAvailable()?'<button type="button" class="gia2-voice" data-action="voice" aria-label="Dictate a question using your microphone" title="Speak your request">🎙</button>':"";
  function dictate(){
    const Engine=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Engine){message("Voice input is not supported by this browser. You can still type your request.");return;}
    const field=$("#gia2Question");
    if(!field){message("Return to Find help to speak a question.");return;}
    let recorder;
    try{
      recorder=new Engine();
      recorder.lang="en-JM";
      recorder.interimResults=false;
      recorder.maxAlternatives=1;
      const button=$(".gia2-voice");
      if(button)button.setAttribute("aria-busy","true");
      recorder.onresult=event=>{
        const transcript=event.results?.[0]?.[0]?.transcript||"";
        if(transcript.trim()){
          field.value=transcript.trim();
          state.question=transcript.trim();
          message("I heard your request. Review it and tap the arrow to continue.");
        }
      };
      recorder.onerror=()=>message("Voice input did not finish. Please try typing instead.");
      recorder.onend=()=>{if(button)button.removeAttribute("aria-busy");};
      recorder.start();
      message("Listening. Voice transcription may be handled by your browser's speech provider; avoid names and private medical details.");
    }catch{message("Microphone input could not start. You can type instead.");}
  }

  function searchForm(){
    return "<form id=\"gia2SearchForm\" class=\"gia2-inputbar\"><label class=\"gia2-visually-hidden\" for=\"gia2Question\">Ask GIA</label><input id=\"gia2Question\" name=\"question\" autocomplete=\"off\" maxlength=\"320\" placeholder=\"e.g. Help with transport to clinic\" value=\""+esc(state.question)+"\" required>"+voiceButton()+"<button class=\"gia2-send\" type=\"submit\" aria-label=\"Find support\">➜</button></form>";
  }
  function viewHome(){
    const role=state.role;
    const title=roleIsProvider()?"Hello, colleague. How can I help with this referral?":"Hello! I'm GIA. How can I help today?";
    const intro=roleIsProvider()?
      "Tell me what a patient or service user needs. I can identify possible programmes, point you to parish contacts, prepare a handover and help plan follow-up.":
      "Tell me what you or someone you care for needs. I'll help you find a possible service, prepare what to bring and work out where to enquire.";
    const choose=!role?
      "<div class=\"gia2-role-choice\"><p>First, who is asking for help?</p><div class=\"gia2-actions\">"+
      pill("role:client","I need help for myself or my family","gia2-primary")+
      pill("role:provider","I work in health or social services")+"</div></div>":"";
    const local=parishChosen()?
      "<p class=\"gia2-context-hint\">📍 Starting with services in <strong>"+esc(state.parish)+"</strong>. You can change parish above.</p>":
      "<p class=\"gia2-context-hint\">📍 Choose your parish above so I can show relevant local offices, not just national programmes.</p>";
    return say("<strong>"+title+"</strong><p>"+intro+"</p>")+choose+local+
      "<div class=\"gia2-feature-grid\">"+
      pill("ask",roleIsProvider()?"Find a referral option":"Find help near me","gia2-feature")+
      pill("refer",roleIsProvider()?"Prepare a referral":"Get visit details","gia2-feature")+
      pill("documents",roleIsProvider()?"Check referral documents":"What should I bring?","gia2-feature")+
      pill("follow",roleIsProvider()?"Plan follow-up":"Check my next step","gia2-feature")+
      "</div>"+searchForm()+
      "<p class=\"gia2-privacy\">"+(roleIsProvider()?
      "Use a non-identifying description. Please do not enter patient names, diagnoses, contact details or records into this chat.":
      "For example: “I need help with food and getting to the clinic.” Please avoid sharing private medical or identifying details.")+"</p>";
  }
  function viewResults(){
    if(state.results.length===0){
      return say("<strong>I haven’t found a clear starting point yet.</strong><p>Could you describe the main need another way? I can also show you broad categories or help you contact a medical social worker.</p>")+
      searchForm()+"<div class=\"gia2-actions\">"+TOPICS.slice(0,5).map(t=>pill("topic:"+t.id,t.label)).join("")+"</div>"+
      "<details class=\"gia2-expand\"><summary>More types of support</summary><div class=\"gia2-actions\">"+TOPICS.slice(5).map(t=>pill("topic:"+t.id,t.label)).join("")+"</div></details>"+options();
    }
    const multi=state.topicIds.length>1;
    const introRole=roleIsProvider()?"Referral possibilities":"Support options";
    const shown=state.results.slice(0,state.page?9:3);
    const narrative=multi?
      "You mentioned "+sayNeeds(state.topicIds)+". These may involve different services, so we can work through them one at a time.":
      (roleIsProvider()?"I found possible referral routes for the need you described.":"I found some possible services to ask about.");
    const chips=multi?
      "<div class=\"gia2-focus\"><p>Which would you like to work on first?</p><div class=\"gia2-actions\">"+
      state.topicIds.map(id=>pill("focus:"+id,TOPICS.find(t=>t.id===id)?.label||id,state.focusTopic===id?"gia2-focus-active":"")).join("")+
      pill("focus:all","All needs",!state.focusTopic?"gia2-focus-active":"")+"</div><div class=\"gia2-plan-row\">"+pill("roadmap","Organise all needs into a plan","gia2-primary")+"</div></div>":"";
    return "<div class=\"gia2-user-bubble\">"+esc(state.originalQuestion||state.question)+"</div>"+
      say("<strong>"+narrative+"</strong><p>These are options to explore, not a determination of eligibility. I’ll help you prepare once you choose one.</p>")+
      chips+
      "<div class=\"gia2-parish-results\">"+(parishChosen()?"📍 Showing guidance for "+esc(state.parish)+". Check each service for local offices and contacts.":"📍 Choose a parish above to see relevant local office listings; the options below are national or guide-based.")+"</div>"+
      "<div class=\"gia2-service-list\">"+shown.map(({service:v})=>{
        const title=v.kind==="decision"?"Guide pathway":v.kind==="agency"?"Agency contact":"Possible service";
        return "<article class=\"gia2-service\"><div><span class=\"gia2-tag\">"+title+"</span><h4>"+esc(v.name)+"</h4><p>"+esc(short(v.support,180))+"</p></div><button type=\"button\" class=\"gia2-choose\" data-service=\""+esc(v.id)+"\">"+(roleIsProvider()?"View referral route":"See how to get help")+" <span>→</span></button></article>";
      }).join("")+"</div>"+
      (state.results.length>3&&!state.page?pill("more","Show more options"):"")+
      "<div class=\"gia2-subtools\">"+pill("ask","Explain a different need")+pill("refer","Prepare a referral")+"</div>"+guidesource();
  }
  function contactActions(s){
    const c=s.contacts?.[0];
    if(!c)return "";
    const details=String(c.details||"");
    const matches=details.match(/(?:\+?1[\s-]?)?\(?876\)?[\s-]?\d{3}[\s-]?\d{4}|(?:1[\s-]?)?888[\s-]?\d{3}[\s-]?\d{4}/);
    const mail=details.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const actions=[];
    if(matches){const ph=matches[0].replace(/[^\d]/g,"");actions.push("<a class=\"gia2-small-link\" href=\"tel:"+esc(ph)+"\">Call number in guide ↗</a>");}
    if(mail)actions.push("<a class=\"gia2-small-link\" href=\"mailto:"+esc(mail[0])+"\">Email agency ↗</a>");
    return actions.length?"<div class=\"gia2-contact-actions\">"+actions.join("")+"</div>":"";
  }
  function viewService(){
    const s=state.selected;
    if(!s)return viewHome();
    const docs=composeDocs(s),contact=s.contacts[0];
    const isPathway=s.kind==="decision";
    const guidance=state.tone==="cost"?"The guide does not establish every fee or eligibility rule. Please confirm current conditions with the receiving agency.":state.tone==="apply"?"Here are the application steps described in the guide. The agency should confirm the current process.":state.tone==="maps"?"I can help you search for the office, but I cannot confirm which local branch is operating.":null;
    return say("<strong>"+esc(s.name)+"</strong><p>"+(isPathway?
      "The guide suggests these possible providers. We should confirm which agency or programme can meet the person's need.":
      (guidance||(roleIsProvider()?"Here is the relevant guide information and local referral route to verify.":"This may be a helpful place to start. Here is what the guide says and how to make enquiries locally.")))+"</p>")+
      "<div class=\"gia2-detail\">"+
      line("What support is described",s.support)+line("Who it may help",s.targets.join("; "))+line("Where to begin",s.where)+line("How it works in the guide",s.process)+
      (docs.length?"<div class=\"gia2-fact\"><b>Documents listed in the guide</b><p>"+esc(short(docs.join("; "),320))+"</p></div>":"")+
      (contact?"<details class=\"gia2-expand\"><summary>Contact details from the guide</summary><p>"+esc(contact.details)+"</p>"+contactActions(s)+"</details>":"")+
      (s.meta.officialUrl&&/^https:\/\//.test(s.meta.officialUrl)?"<a class=\"gia2-link\" href=\""+esc(s.meta.officialUrl)+"\" target=\"_blank\" rel=\"noopener noreferrer\">Open official agency website ↗</a>":"")+
      "</div>"+parishHelp(s)+"<div class=\"gia2-primary-actions\">"+
      pill("refer",roleIsProvider()?"Prepare referral":"Prepare visit details","gia2-primary")+pill("checklist",roleIsProvider()?"Check documents":"What to bring")+pill("plan",roleIsProvider()?"Copy action plan":"Copy next steps")+pill("directions","Find location on Maps")+"</div>"+
      "<details class=\"gia2-barriers\"><summary>Having trouble completing the referral?</summary><div class=\"gia2-actions\">"+BARRIERS.map(b=>pill("barrier:"+b.id,b.label)).join("")+"</div></details>"+
      "<div class=\"gia2-actions\">"+pill("follow","Follow up later")+pill("backResults","Other options")+pill("start","New request")+"</div>"+
      guidesource();
  }
  function guideDocs(s){
    let list=cleanDocs(s?.bring);
    if(!list.length){
      const row=guide?.programmes?.find(p=>key(p.name)===s?.id);
      list=cleanDocs(row?.bring);
    }
    return list;
  }
  function workerDocs(){
    return [...new Set(String(state.customDocs||"").split(/\n|;/).map(x=>x.trim()).filter(Boolean))].slice(0,16);
  }
  function viewDocs(){
    const s=state.selected;
    if(!s){
      return say("<strong>"+(roleIsProvider()?"Let’s check the referral paperwork.":"Let’s see what you need to bring.")+"</strong><p>Search the name of a programme or explore how to obtain a common Jamaican document. Choose your parish above for more relevant local guidance.</p>")+
      searchForm()+"<div class=\"gia2-document-directory\"><h4>Document application guidance in the booklet</h4>"+
      (guide.documents||[]).map(d=>"<details class=\"gia2-expand\" "+(normal(state.question).includes(normal(d.document))?"open":"")+"><summary>"+esc(d.document)+"</summary><p><b>Where:</b> "+esc(d.where)+"</p><p><b>Listed requirements:</b> "+esc(d.requirements)+"</p><p><b>Process:</b> "+esc(d.process)+"</p><p><b>Cost in booklet:</b> "+esc(d.cost)+"</p></details>").join("")+"</div>"+options();
    }
    const base=guideDocs(s),extras=workerDocs(),docs=composeDocs(s);
    return say("<strong>Here’s the preparation list for "+esc(s.name)+".</strong><p>"+(roleIsProvider()?"Check what the person has available and clarify accepted alternatives with the receiving agency.":"Tick what you already have. Ask the agency what you really need to bring, and whether other identification can be used.")+"</p>")+
      (docs.length?"<div class=\"gia2-checklist\">"+
        (base.length?"<div class=\"gia2-check-head\">From the support guide</div>"+base.map((d,i)=>"<label><input type=\"checkbox\" data-doc=\""+i+"\" "+(state.ready.has(i)?"checked":"")+"><span>"+esc(d)+"</span></label>").join(""):"")+
        (extras.length?"<div class=\"gia2-check-head\">Added by the referring worker</div>"+extras.map((d,i)=>"<label><input type=\"checkbox\" data-doc=\""+(base.length+i)+"\" "+(state.ready.has(base.length+i)?"checked":"")+"><span>"+esc(d)+"</span></label>").join(""):"")+
        "</div>":"<p class=\"gia2-muted\">No individual document list is specified for this option in the guide. Ask the receiving agency.</p>")+
      "<div class=\"gia2-checkline\" id=\"gia2DocProgress\">"+state.ready.size+" of "+docs.length+" marked available</div>"+
      "<div class=\"gia2-primary-actions\">"+pill("refer","Prepare WhatsApp information","gia2-primary")+pill("service","Back to service")+"</div>"+
      "<details class=\"gia2-expand\"><summary>Where can I get missing documents?</summary>"+(guide.documents||[]).map(d=>"<div class=\"gia2-mini-doc\"><b>"+esc(d.document)+"</b><p>"+esc(d.where)+" · "+esc(short(d.process,165))+"</p></div>").join("")+"</details>";
  }

  function referralText(){
    const s=state.selected;
    const name=state.destination.trim()||(s?.agency||"Receiving service to confirm");
    const map=mapsUrl(name,state.parish,state.mapsProvided);
    const officialOffice=state.localOfficeUsed===state.parish?"Office chosen from official parish directory; current opening and service must still be confirmed.":"";
    const base=guideDocs(s),extra=workerDocs();
    const list=(arr,offset)=>arr.map((d,i)=>(state.ready.has(offset+i)?"☑ ":"☐ ")+d);
    const locationLine=(state.mapsProvided.trim()&&validMapsLink(state.mapsProvided)?
      "Google Maps link supplied by worker (check destination): ":
      "Google Maps search (confirm exact destination): ")+map;
    if(state.recipientMode==="agency"){
      return [
        "SOCIAL SUPPORT SERVICE ENQUIRY",
        "Good day. I am seeking general referral information about "+(s?.kind==="custom"?name:(s?.name||"your service"))+".",
        "",
        "Proposed destination: "+name,
        "Parish: "+(state.parish==="Not selected"?"To be confirmed":state.parish),
        locationLine,
        officialOffice,
        "",
        "Could you please confirm:",
        "• Whether this is the appropriate service and office",
        "• The current referral/application process and documents required",
        "• Office hours, appointment arrangements, accessibility and any fees",
        base.length?"The support guide lists: "+base.join("; ")+". Please confirm these requirements.":"",
        "",
        "No client-identifying or clinical information is included in this initial enquiry.",
        "Thank you."
      ].filter(Boolean).join("\n");
    }
    return [
      "YOUR SOCIAL SUPPORT VISIT INFORMATION",
      "Hello. Here is the information to help you prepare.",
      "",
      "Service: "+(s?.kind==="custom"?name:(s?.name||"Service to confirm")),
      "Office or destination: "+name,
      "Parish: "+(state.parish==="Not selected"?"Please confirm":state.parish),
      locationLine,
      officialOffice,
      "",
      "DOCUMENT CHECKLIST",
      ...(base.length?["Listed in the support guide (confirm current requirements):",...list(base,0)]:[]),
      ...(extra.length?["Additional documents entered by the referring worker:",...list(extra,base.length)]:[]),
      ...(!base.length&&!extra.length?["Contact the receiving office to confirm the documents required."]:[]),
      "",
      "Before travelling, please confirm the correct office, opening hours, eligibility, appointment arrangements and any costs.",
      s?.meta?.officialUrl ? "Agency website: "+s.meta.officialUrl : "",
      "MOHW Social Support guide: https://glenroygriffiths876-collab.github.io/MOHW-SOCIAL-PROTECTION-SERVICES-SUPPORT/",
      "",
      "Information for preparation only; no appointment, eligibility or benefit has been confirmed."
    ].filter(v=>v!=="").join("\n");
  }
  function actionPlanText(){
    const s=state.selected;
    if(!s)return "Choose a service before preparing next steps.";
    const base=guideDocs(s),extra=workerDocs();
    if(!roleIsProvider()){
      return [
        "MY SOCIAL SUPPORT NEXT STEPS",
        "Parish: "+(parishChosen()?state.parish:"Please choose a parish"),
        "Programme or agency to ask about: "+s.name,
        "Possible help: "+(s.support||"Ask the receiving agency about its services"),
        "Where to start: "+(s.where||"Ask for the correct local office"),
        "What the guide says to bring: "+(base.length?base.join("; "):"Ask the agency"),
        "Other documents noted: "+(extra.length?extra.join("; "):"None"),
        "Before going: Confirm the correct office, documents, opening hours, any costs and whether you need an appointment.",
        "I can ask for help from a trusted person or healthcare worker if needed.",
        "The agency decides eligibility and availability. This is a guide, not an approval."
      ].join("\n\n");
    }
    return [
      "SOCIAL SUPPORT ACTION PLAN — DRAFT",
      "Needs discussed: "+sayNeeds(state.topicIds),
      "Parish: "+(parishChosen()?state.parish:"To establish"),
      "Programme/service to confirm: "+s.name,
      "Relevant agency: "+(s.agency||"Confirm with programme"),
      "Relevant health region: "+(parishRecord()?.healthAuthority?.name||"Select parish"),
      "Possible assistance described: "+(s.support||"See responsible agency"),
      "Guide application process: "+(s.process||"Confirm process with agency"),
      "Guide-listed documents: "+(base.length?base.join("; "):"Not specified"),
      "Worker-entered additional documents: "+(extra.length?extra.join("; "):"None"),
      "Next step: Confirm suitability, parish catchment, accessible location, documentation, service capacity and consent.",
      "Document actual contact, referral and outcome in the approved system.",
      "Source: November 2026 Social Protection Services Support Guide; verify current agency arrangements."
    ].join("\n\n");
  }
  function viewRefer(){
    const s=state.selected;
    if(!s){
      return say("<strong>Who are we connecting the person with?</strong><p>Search a programme, or choose any destination—including a hospital, clinic, police station, PATH office, NHT or NHF service point.</p>")+
      searchForm()+"<div class=\"gia2-actions\">"+pill("custom","Any other destination","gia2-primary")+
      pill("topic:income","PATH / income")+pill("topic:health","NHF / health")+pill("topic:family","Child and family support")+"</div>"+options();
    }
    const base=guideDocs(s),extras=workerDocs(),docs=[...base,...extras];
    const displayName=s.kind==="custom"?(state.destination||"your destination"):s.name;
    return say("<strong>"+(roleIsProvider()?"Let’s prepare a clear referral.":"Let’s prepare your visit information.")+"</strong><p>"+(roleIsProvider()?"Choose who will receive the message, confirm the parish office and review the details before sharing.":"I’ll help you find the right office and prepare a message with directions and documents.")+"</p>")+
      "<div class=\"gia2-form\">"+
      "<label for=\"gia2To\">Recipient’s WhatsApp number</label><input id=\"gia2To\" type=\"tel\" inputmode=\"tel\" autocomplete=\"off\" placeholder=\"876 555 1234\" value=\""+esc(state.phone)+"\">"+
      "<label for=\"gia2Parish\">Destination parish (required)</label><select id=\"gia2Parish\">"+PARISHES.map(p=>"<option "+(p===state.parish?"selected":"")+">"+esc(p)+"</option>").join("")+"</select>"+
      "<label for=\"gia2Destination\">Exact office, clinic or destination</label><input id=\"gia2Destination\" maxlength=\"160\" placeholder=\"e.g. Lucea PATH Office, Hanover\" value=\""+esc(state.destination||"")+"\">"+
      "<details class=\"gia2-expand gia2-optional\"><summary>Location link and document options <span>optional</span></summary>"+
      "<label for=\"gia2Map\">Paste a confirmed Google Maps pin (if you have one)</label><input id=\"gia2Map\" type=\"url\" maxlength=\"650\" placeholder=\"https://maps.app.goo.gl/...\" value=\""+esc(state.mapsProvided)+"\">"+
      "<p class=\"gia2-muted\">Otherwise GIA includes a Google Maps search. It is not a verified office address.</p>"+
      "<label for=\"gia2RecipientMode\">Who will receive this message?</label><select id=\"gia2RecipientMode\"><option value=\"client\" "+(state.recipientMode==="client"?"selected":"")+">Person or caregiver — visit instructions</option><option value=\"agency\" "+(state.recipientMode==="agency"?"selected":"")+">Receiving agency — general enquiry</option></select>"+
      "<label for=\"gia2CustomDocs\">Additional documents confirmed by the agency (one per line)</label><textarea id=\"gia2CustomDocs\" rows=\"2\" maxlength=\"1200\" placeholder=\"e.g. Referral letter\">"+esc(state.customDocs)+"</textarea>"+
      pill("refreshDocs","Update checklist")+
      "</details>"+
      (docs.length?
        "<details class=\"gia2-expand gia2-optional\"><summary>Document checklist <span>"+state.ready.size+" of "+docs.length+" available</span></summary><div class=\"gia2-compact-checks\">"+
        (base.length?"<div class=\"gia2-check-head\">Listed in the support guide</div>"+base.map((d,i)=>"<label><input type=\"checkbox\" data-doc=\""+i+"\" "+(state.ready.has(i)?"checked":"")+"> "+esc(d)+"</label>").join(""):"")+
        (extras.length?"<div class=\"gia2-check-head\">Added by referring worker</div>"+extras.map((d,i)=>"<label><input type=\"checkbox\" data-doc=\""+(base.length+i)+"\" "+(state.ready.has(base.length+i)?"checked":"")+"> "+esc(d)+"</label>").join(""):"")+
        "</div></details>"
        :"<p class=\"gia2-muted\">No programme-specific checklist is available here; ask the receiving agency before travel.</p>")+
      "<details class=\"gia2-expand gia2-parish-referral\"><summary>Local office guidance for "+esc(state.parish==="Not selected"?"your parish":state.parish)+"</summary>"+parishHelp(s)+"</details>"+
      "<label class=\"gia2-consent\"><input id=\"gia2Consent\" type=\"checkbox\" "+(state.consent?"checked":"")+"><span>The recipient agrees to receive this information on WhatsApp, and I have reviewed it for confidential details.</span></label>"+
      "<details class=\"gia2-expand\"><summary>Read the WhatsApp message before sharing</summary><pre id=\"gia2Preview\">"+esc(referralText())+"</pre></details>"+
      "<p class=\"gia2-error\" id=\"gia2Validation\" role=\"status\"></p>"+
      "<div class=\"gia2-primary-actions\">"+pill("openWhatsApp","Open WhatsApp to review","gia2-primary")+pill("copyReferral","Copy message")+pill("map","Check destination on Maps")+"</div>"+
      "<p class=\"gia2-muted\">The message opens inside WhatsApp for you to review and send. GIA does not send it automatically.</p>"+
      "</div><div class=\"gia2-actions\">"+pill("checklist","View full document guidance")+(s.kind==="custom"?"":pill("service","Back to service"))+pill("start","New request")+"</div>";
  }
  function followText(){
    const selected=state.selected?.name||"Service to confirm";
    if(!roleIsProvider()){
      return [
        "MY SUPPORT FOLLOW-UP NOTES",
        "Parish: "+(parishChosen()?state.parish:"Not chosen"),
        "Service: "+selected,
        "What happened: "+(state.outcome||"To confirm"),
        "My next step: "+(state.next||"Decide whom to contact"),
        "Date to check again: "+(state.followDate||"Choose a date"),
        "Keep these notes somewhere safe. GIA does not save cases or set reminders."
      ].join("\n");
    }
    return [
      "SOCIAL SUPPORT FOLLOW-UP NOTE (DRAFT)",
      "Parish: "+(parishChosen()?state.parish:"Not yet selected"),
      "Service: "+selected,
      "Non-identifying reference: "+(state.sessionRef||"Not entered"),
      "Outcome: "+(state.outcome||"To confirm"),
      "Next step and responsible role: "+(state.next||"To be agreed"),
      "Follow-up date: "+(state.followDate||"To be agreed"),
      "Transfer relevant details to the approved record. GIA does not store case records or set reminders."
    ].join("\n");
  }
  function followAdvice(outcome){
    return ({
      "Received assistance":"Confirm the service was useful and record the outcome in your approved system. Further referral may not be necessary.",
      "Appointment arranged":"Confirm the appointment details and whether the person needs help with transport or documents.",
      "Awaiting response":"Check with the receiving agency, note the person contacted and agree when to follow up again.",
      "Could not access service":"Ask whether documents, transport, eligibility, costs or availability prevented access; consider an alternative option.",
      "Declined assistance":"Respect the person's choice. Explain available options without pressure and document appropriately.",
      "Needs changed":"Reassess the current priorities, including any urgent health or safety issues, before redirecting."
    })[outcome]||"Record what happened, the responsible role and the next contact date.";
  }
  function viewFollow(){
    return say("<strong>"+(roleIsProvider()?"Let’s complete the follow-up.":"Let’s see what happened next.")+"</strong><p>"+(roleIsProvider()?"Choose the outcome and a responsible next step. Copy the note into your approved system.":"What happened when you contacted the agency? I can help you write down what to do next.")+"</p>")+
      "<div class=\"gia2-form\">"+
      (roleIsProvider()?"<label for=\"gia2CaseRef\">Reference without identifying details (optional)</label><input id=\"gia2CaseRef\" maxlength=\"50\" placeholder=\"e.g. Referral 014\" value=\""+esc(state.sessionRef)+"\">":"")+
      "<label for=\"gia2Outcome\">What happened?</label><select id=\"gia2Outcome\"><option value=\"\">Choose an outcome</option>"+["Received assistance","Appointment arranged","Awaiting response","Could not access service","Declined assistance","Needs changed"].map(v=>"<option "+(state.outcome===v?"selected":"")+">"+v+"</option>").join("")+"</select>"+
      "<div class=\"gia2-next-tip\" id=\"gia2FollowAdvice\">"+esc(followAdvice(state.outcome))+"</div>"+
      "<label for=\"gia2Next\">"+(roleIsProvider()?"Next step and responsible person/role":"What will you do next?")+"</label><textarea id=\"gia2Next\" maxlength=\"700\" rows=\"3\" placeholder=\"e.g. Referring worker to confirm appointment\">"+esc(state.next)+"</textarea>"+
      "<label for=\"gia2Date\">Date to check again</label><input id=\"gia2Date\" type=\"date\" value=\""+esc(state.followDate)+"\">"+
      "<details class=\"gia2-expand\"><summary>Preview your follow-up note</summary><pre id=\"gia2FollowPreview\">"+esc(followText())+"</pre></details>"+
      "<div class=\"gia2-primary-actions\">"+pill("copyFollow","Copy follow-up note","gia2-primary")+pill("printFollow","Print note")+"</div>"+
      "<p class=\"gia2-muted\">"+(roleIsProvider()?"GIA does not create a case record or reminder. Use your approved record and follow-up system.":"GIA does not save these notes or set a reminder. Keep a copy somewhere safe.")+"</p></div>"+
      "<div class=\"gia2-actions\">"+pill("service","Back to service")+pill("start","New request")+"</div>";
  }
  function viewUrgent(){
    return say("<strong>This may need urgent support.</strong><p>"+(roleIsProvider()?"Follow your facility’s emergency and safeguarding procedures before considering an ordinary referral.":"If someone is in immediate danger, seriously ill, being harmed or at risk of harm, contact emergency services and seek help from a trusted person nearby.")+" Do not delay for a directory search.</p>")+
      "<div class=\"gia2-urgent\"><a href=\"tel:119\">Police emergency: <b>119</b></a><a href=\"tel:110\">Fire / ambulance: <b>110</b></a><a href=\"tel:211\">Child abuse reporting: <b>211</b></a></div>"+
      "<p class=\"gia2-muted\">Use a safe device and private communication method if violence or abuse is involved.</p>"+
      "<div class=\"gia2-actions\">"+pill("start","Back to GIA")+pill("services","Find additional support")+"</div>";
  }
  function render(){
    const content=$("#gia2Content");
    if(!content)return;
    const context=$("#gia2ContextMount");if(context)context.innerHTML=contextBar();
    const names={home:"Here to help",results:"Suggested support",service:"Service details",documents:"Document guidance",refer:"Prepare a referral",follow:"Follow-up",urgent:"Urgent support",barrier:"Solve a referral problem",roadmap:"Plan next steps"};
    $("#gia2Step").textContent=names[state.view]||"Here to help";
    content.innerHTML=state.view==="home"?viewHome():state.view==="results"?viewResults():state.view==="service"?viewService():
      state.view==="documents"?viewDocs():state.view==="refer"?viewRefer():state.view==="follow"?viewFollow():state.view==="urgent"?viewUrgent():state.view==="barrier"?viewBarrier():state.view==="roadmap"?viewRoadmap():viewHome();
    if(["results","service"].includes(state.view)||(state.view==="documents"&&state.selected)){
      content.insertAdjacentHTML("beforeend","<div class=\"gia2-chat-follow\"><label for=\"gia2Question\">Another question? Just ask.</label><form id=\"gia2SearchForm\" class=\"gia2-inputbar\"><input id=\"gia2Question\" name=\"question\" autocomplete=\"off\" maxlength=\"320\" placeholder=\"e.g. What documents do I bring?\" value=\"\">"+voiceButton()+"<button type=\"submit\" class=\"gia2-send\" aria-label=\"Ask GIA\">➜</button></form></div>");
    }
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
    state.selected=s;state.ready=new Set();state.destination=s.kind==="decision"?"":(s.agency||s.name);state.mapsProvided="";state.consent=false;state.tone="";state.localOfficeUsed="";
    show("service");
  }
  function handleAsk(raw){
    const question=String(raw||"").trim();
    if(!question)return;
    const lower=normal(question);
    // Urgent-safety routing always takes priority over programme lookup.
    if(DANGER.test(question)){state.question=question;show("urgent");return;}
    if(/^(?:(?:hi|hello|hey)(?: gia)?|good morning(?: gia)?|good afternoon(?: gia)?|good evening(?: gia)?|what can you do)[!. ]*$/.test(lower)){show("home");return;}
    if(/^(?:start again|reset|new request)$/.test(lower)){act("start");return;}
    const parish=extractParish(question);
    if(parish&&parish!==state.parish){
      state.parish=parish;
      if(state.localOfficeUsed){state.localOfficeUsed="";state.destination=state.selected?.agency||"";state.mapsProvided="";state.consent=false;}
    }
    const numberInText=question.match(/(?:\+?1[\s().-]*)?(?:876|658)[\s().-]*\d{3}[\s().-]*\d{4}/);
    if(numberInText)state.phone=numberInText[0];
    const direct=explicitService(question);
    const wantsDocs=/\b(?:document|documents|paperwork|papers|bring|requirements|application form|birth certificate|trn|passport|national id|identification)\b/i.test(question);
    const obstacle=barrierFor(question);
    const wantsReferral=/\b(?:whats\s?app|send (?:this|that|it|information|referral)|message (?:her|him|them|the client)|share (?:this|it|that)|refer(?:ral)?)\b/i.test(question);
    const wantsFollow=/\b(?:follow[- ]?up|followup|check (?:again|on the referral)|what happened next)\b/i.test(question);
    const wantsMaps=/\b(?:where is|address|directions|location|map|nearest office|closest office)\b/i.test(question);
    const wantsCost=/\b(?:fee|fees|cost|costs|price|free|eligible|eligibility|qualify)\b/i.test(question);
    const wantsApply=/\b(?:apply|application|process|register|sign up|how do i get|how can i get)\b/i.test(question);
    const knownDocument=(guide?.documents||[]).find(d=>{
      const norm=normal(d.document);
      const search=normal(question);
      const term=norm.split(" (")[0];
      return term.length>3 && (" "+search+" ").includes(" "+term+" ");
    });
    if(direct){
      if(state.selected?.id!==direct.id){
        state.selected=direct;state.destination=direct.kind==="decision"?"":direct.agency;state.mapsProvided="";state.ready=new Set();state.customDocs="";state.consent=false;state.localOfficeUsed="";
      }
      state.question=question;
      if(!state.originalQuestion)state.originalQuestion=question;
      if(obstacle){state.barrier=obstacle.id;show("barrier");return;}
      if(wantsReferral){show("refer");return;}
      if(wantsDocs){show("documents");return;}
      if(wantsFollow){show("follow");return;}
      state.tone=wantsCost?"cost":wantsApply?"apply":wantsMaps?"maps":"";
      show("service");return;
    }
    if(wantsReferral && !direct && !state.selected){
      const target=question.match(/\b(?:to|for)\s+(.+?)(?:(?:\s+(?:at|in)\s+)(?:Hanover|St\.? James|Westmoreland|Trelawny|St\.? Elizabeth|Manchester|Clarendon|St\.? Ann|St\.? Mary|Portland|St\.? Thomas|St\.? Catherine|St\.? Andrew|Kingston))?\s*$/i);
      const candidate=(target?.[1]||"")
        .replace(/(?:\+?1[\s().-]*)?(?:876|658)[\s().-]*\d{3}[\s().-]*\d{4}/g,"")
        .replace(/[,;]?\s*(?:and\s+)?(?:the\s+)?(?:phone\s+)?(?:number|telephone|contact)\s*(?:is|:)?\s*$/i,"")
        .replace(/[,;]?\s+(?:in|at)\s+(?:Hanover|St\.?\s*James|Westmoreland|Trelawny|St\.?\s*Elizabeth|Manchester|Clarendon|St\.?\s*Ann|St\.?\s*Mary|Portland|St\.?\s*Thomas|St\.?\s*Catherine|St\.?\s*Andrew|Kingston)\s*$/i,"")
        .trim();
      const useful=/(?:hospital|clinic|health centre|health center|police station|office|infirmary|laboratory|pharmacy|nht|nhf|path|nis)/i.test(candidate);
      if(useful){
        state.selected={id:"custom",name:"Custom destination",kind:"custom",agency:"",support:"",where:"",bring:"",process:"",targets:[],categories:[],contacts:[],meta:{}};
        state.destination=candidate;state.ready=new Set();state.customDocs="";state.mapsProvided="";state.consent=false;state.localOfficeUsed="";
      }
      state.question=question;show("refer");return;
    }
    if(knownDocument && !state.selected){
      state.question=knownDocument.document;show("documents");return;
    }
    if(obstacle){state.question=question;state.barrier=obstacle.id;show("barrier");return;}
    if(wantsFollow && !/another service/.test(lower)){show("follow");return;}
    if(state.selected){
      state.question=question;
      if(wantsReferral){show("refer");return;}
      if(wantsDocs){show("documents");return;}
      if(wantsMaps||wantsCost||wantsApply||/^(tell me more|more details|how does it work|what about it)$/.test(lower)){
        state.tone=wantsCost?"cost":wantsApply?"apply":wantsMaps?"maps":"";
        show("service");return;
      }
    }
    // A new need starts a fresh search without clearing the last selection prematurely.
    state.originalQuestion=question;
    state.question=question;
    state.tone="";state.focusTopic="";
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
    if(get("gia2Parish")!==undefined && state.parish!==get("gia2Parish")){
      state.parish=get("gia2Parish");
      if(state.localOfficeUsed){state.destination=state.selected?.agency||"";state.localOfficeUsed="";state.mapsProvided="";}
    }
    if(get("gia2Destination")!==undefined){
      if(state.localOfficeUsed && state.destination!==get("gia2Destination"))state.localOfficeUsed="";
      state.destination=get("gia2Destination");
    }
    if(get("gia2Map")!==undefined)state.mapsProvided=get("gia2Map");
    if($("#gia2Consent"))state.consent=$("#gia2Consent").checked;
    if(get("gia2Outcome")!==undefined)state.outcome=get("gia2Outcome");
    if(get("gia2Next")!==undefined)state.next=get("gia2Next");
    if(get("gia2Date")!==undefined)state.followDate=get("gia2Date");
    if(get("gia2CaseRef")!==undefined)state.sessionRef=get("gia2CaseRef");
    if(get("gia2CustomDocs")!==undefined)state.customDocs=get("gia2CustomDocs");
    if(get("gia2RecipientMode")!==undefined)state.recipientMode=get("gia2RecipientMode");
    if(get("gia2Question")!==undefined && get("gia2Question").trim())state.question=get("gia2Question");
  }
  function updatePreview(){
    const p=$("#gia2Preview");if(p)p.textContent=referralText();
    const f=$("#gia2FollowPreview");if(f)f.textContent=followText();
    const progress=$("#gia2DocProgress");if(progress)progress.textContent=state.ready.size+" of "+composeDocs(state.selected).length+" marked available";
    const advice=$("#gia2FollowAdvice");if(advice)advice.textContent=followAdvice(state.outcome);
  }
  function launchWhatsApp(){
    preserveInputs();
    const digits=phone(state.phone);
    if(!digits){message("Enter a valid phone number, including the area or country code.",true);$("#gia2To")?.focus();return;}
    if(!parishChosen()){message("Please choose the destination parish first, so the referral does not point to the wrong place.",true);$("#gia2Parish")?.focus();return;}
    if(!state.destination.trim()){message("Enter the office or facility you want the recipient to find.",true);$("#gia2Destination")?.focus();return;}
    if(state.mapsProvided.trim()&&!validMapsLink(state.mapsProvided)){message("That is not a supported Google Maps link. Correct the link or leave it blank to use a Maps search.",true);$("#gia2Map")?.focus();return;}
    if(!state.consent){message("Please confirm the recipient agrees to receive this information and that you have reviewed its contents.",true);$("#gia2Consent")?.focus();return;}
    const url="https://wa.me/"+digits+"?text="+encodeURIComponent(referralText());
    const opened=window.open(url,"_blank","noopener,noreferrer");
    message("WhatsApp should open with the prepared message. Review it there and tap Send yourself. If it did not open, use Copy message.");
  }
  function doPrint(){
    const pre=document.createElement("pre");pre.id="gia2Print";pre.textContent=followText();
    document.body.append(pre);document.body.classList.add("gia2-print");
    try{window.print();}finally{document.body.classList.remove("gia2-print");pre.remove();}
  }
  function act(action){
    preserveInputs();
    if(action==="start"){
      Object.assign(state,{view:"home",question:"",tone:"",topicIds:[],results:[],page:0,selected:null,parish:state.parish,destination:"",mapsProvided:"",phone:"",ready:new Set(),consent:false,outcome:"",next:"",followDate:"",sessionRef:"",customDocs:"",focusTopic:"",originalQuestion:"",barrier:"",recipientMode:"client",localOfficeUsed:""});
      show("home");return;
    }
    if(action==="ask"){state.question="";show("home");$("#gia2Question")?.focus();return;}
    if(action.startsWith("role:")){
      state.role=action.slice(5)==="provider"?"provider":"client";render();return;
    }
    if(action.startsWith("useOffice:")){
      const kind=action.slice(10);
      const profile=parishRecord();
      const office=kind==="nht"?profile?.nht:kind==="mlss"?profile?.mlss:null;
      if(!office){message("Please choose a parish with a listed local office before using this action.",true);return;}
      state.destination=office.name+", "+office.address;
      state.localOfficeUsed=state.parish;
      state.mapsProvided="";
      state.consent=false;
      show("refer");return;
    }
    if(action==="voice"){dictate();return;}
    if(action==="custom"){
      state.recipientMode="client";
      state.selected={id:"custom",name:"Custom destination",kind:"custom",agency:"",support:"",where:"",bring:"",process:"",targets:[],categories:[],contacts:[],meta:{}};
      state.ready=new Set();state.destination="";state.customDocs="";state.mapsProvided="";state.consent=false;state.localOfficeUsed="";show("refer");return;
    }
    if(action==="refreshDocs"){show("refer");return;}
    if(action==="services"){document.querySelector('[data-nav="services"]')?.click();$("#gia2Dialog").close();return;}
    if(action==="documents"||action==="checklist"){show("documents");return;}
    if(action==="refer"){ensureServiceForReferral();return;}
    if(action==="service"){show(state.selected?"service":"home");return;}
    if(action==="follow"){show("follow");return;}
    if(action==="backResults"){show("results");return;}
    if(action==="more"){state.page=1;show("results");return;}
    if(action==="plan"){copy(actionPlanText());return;}
    if(action==="roadmap"){show("roadmap");return;}
    if(action==="copyRoadmap"){copy(roadmapText());return;}
    if(action==="copyBarrier"){copy(barrierText());return;}
    if(action.startsWith("barrier:")){state.barrier=action.slice(8);show("barrier");return;}
    if(action.startsWith("focus:")){
      const id=action.slice(6);
      if(id==="all"){state.focusTopic="";state.results=scoreServices(state.originalQuestion||state.question);state.page=0;show("results");}
      else topicFocus(id);
      return;
    }
    if(action.startsWith("topic:")){
      const topic=TOPICS.find(t=>t.id===action.slice(6));if(topic)handleAsk(topic.terms);return;
    }
    if(action==="directions"||action==="map"){
      if(!parishChosen()){message("Choose the parish above before looking up a local destination.",true);return;}
      if(state.mapsProvided.trim()&&!validMapsLink(state.mapsProvided)){message("That Google Maps link needs correcting. Remove it to use a location search.",true);return;}
      const name=state.destination||state.selected?.agency||"social services";
      const url=mapsUrl(name,state.parish,state.mapsProvided);
      window.open(url,"_blank","noopener,noreferrer");
      message(state.mapsProvided.trim()?"Opening the supplied Maps link.":"Opening a Maps search. Confirm the exact office before travel.");
      return;
    }
    if(action==="openWhatsApp"){launchWhatsApp();return;}
    if(action==="copyReferral"){
      if(!parishChosen()){message("Choose a parish to create parish-specific referral directions.",true);return;}
      if(state.mapsProvided.trim()&&!validMapsLink(state.mapsProvided)){message("Correct or remove the invalid Google Maps link first.",true);return;}
      copy(referralText());return;
    }
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
    dialog.innerHTML="<header class=\"gia2-header\"><img class=\"gia2-avatar\" src=\"./assets/gia-avatar.jpg\" alt=\"\"><div class=\"gia2-heading\"><h2 id=\"gia2Heading\">GIA <span>· Your support guide</span></h2><p id=\"gia2Step\">Here to help</p></div><button type=\"button\" class=\"gia2-close\" id=\"gia2Close\" aria-label=\"Close GIA\">×</button></header><div id=\"gia2ContextMount\"></div><main id=\"gia2Content\" class=\"gia2-content\"></main><footer class=\"gia2-footer\"><span><i class=\"gia2-online\"></i> Guided by the MOHW Social Support directory</span><span class=\"gia2-note\" id=\"gia2Status\" role=\"status\"></span></footer>";
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
      if(e.target.id==="gia2Role"){
        preserveInputs();state.role=e.target.value;render();return;
      }
      if(e.target.id==="gia2Parish"){
        preserveInputs();render();return;
      }
      if(e.target.id==="gia2ContextParish"){
        preserveInputs();
        const before=state.parish;
        state.parish=e.target.value;
        if(before!==state.parish && state.localOfficeUsed){
          state.destination=state.selected?.agency||"";
          state.mapsProvided="";state.localOfficeUsed="";state.consent=false;
        }
        render();return;
      }
      if(e.target.matches("[data-doc]")){
        const i=Number(e.target.dataset.doc);
        if(e.target.checked)state.ready.add(i);else state.ready.delete(i);
        updatePreview();return;
      }
      preserveInputs();updatePreview();
    });
    dialog.addEventListener("input",e=>{
      if(e.target.matches("#gia2To,#gia2Destination,#gia2Map,#gia2Parish,#gia2RecipientMode,#gia2CustomDocs,#gia2CaseRef,#gia2Next,#gia2Date,#gia2Outcome")){
        preserveInputs();updatePreview();
      }
    });
    window.MOHWGIA={
      open:()=>open("home"),
      openReferral:(name)=>{
        const wanted=catalog.find(s=>key(s.name)===key(name)||s.aliases?.some(a=>key(a)===key(name)));
        if(wanted){
          state.selected=wanted;state.destination=wanted.kind==="decision"?"":(wanted.agency||wanted.name);
          state.ready=new Set();state.customDocs="";state.mapsProvided="";state.consent=false;
        }
        open("refer");
      },
      openNeed:(need)=>{open("home");handleAsk(need);}
    };
    render();
  }
  document.addEventListener("DOMContentLoaded",async()=>{
    try{
      const response=await fetch(GUIDE_URL,{cache:"no-store"});
      if(!response.ok)throw new Error("Guide unavailable");
      guide=await response.json();catalog=buildCatalog(guide);
    }catch(error){console.warn("GIA could not load guide data",error);}
    try{
      const response=await fetch(PARISH_URL,{cache:"no-store"});
      if(response.ok)parishDirectory=await response.json();
      else throw new Error("Local directory unavailable");
    }catch(error){console.warn("GIA parish data unavailable; map search remains usable",error);}
    mount();
  },{once:true});
})();
