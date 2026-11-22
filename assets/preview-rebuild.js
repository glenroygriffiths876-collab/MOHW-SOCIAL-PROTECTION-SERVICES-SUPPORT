/* Preview-only premium interface. Existing guide, Gia and manual modules are kept intact. */
(function () {
  'use strict';
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]; }); };
  var navigation = ['about','referrals','decision','services','manual','programmes','categories','contacts'];
  var coords = {
    'Hanover':[18.45,-78.17], 'St. James':[18.47,-77.92], 'Westmoreland':[18.22,-78.13],
    'Trelawny':[18.49,-77.65], 'St. Elizabeth':[18.03,-77.85], 'Manchester':[18.04,-77.51],
    'Clarendon':[17.97,-77.24], 'St. Ann':[18.43,-77.20], 'St. Mary':[18.37,-76.89],
    'Portland':[18.18,-76.45], 'St. Thomas':[17.88,-76.41], 'St. Catherine':[17.99,-76.96],
    'St. Andrew':[18.025,-76.805], 'Kingston':[17.965,-76.79]
  };
  var types = {
    mlss:{name:'Benefits & NIS',short:'Social assistance',icon:'♙'},
    nht:{name:'Housing',short:'Housing support',icon:'⌂'},
    drugServ:{name:'Medication',short:'Pharmacy services',icon:'✚'},
    healthDept:{name:'Health services',short:'Health department',icon:'✦'}
  };
  var offices=[], parishInfo=null, map=null, pinsLayer=null, currentParish='ALL', currentType='ALL', query='', viewMode='map', expanded=false;
  var icon = {
    map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></svg>',
    referral:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h6M9 12h6M9 17h3"/><path d="m16 16 2 2 3-3"/></svg>',
    decision:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V3M12 8 5 4M12 13l7-5M5 4h5M19 8v5"/><circle cx="12" cy="3" r="1"/></svg>',
    book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6C9 3 5 3 2 4v15c3-1 7 0 10 2 3-2 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    access:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="6.5" r="1"/><path d="M5.5 10.5h13M12 10.5v6.5m-4 5 4-5 4 5"/></svg>'
  };
  function navigate(id) {
    if (navigation.indexOf(id) < 0) return;
    if (typeof window.showView === 'function') window.showView(id);
    else {
      var button = $('#mainNav button[data-nav="' + id + '"]');
      if (button) button.click();
      else { $$('.view').forEach(function (v) {v.classList.toggle('active',v.id==='view-'+id);}); location.hash=id; }
    }
    if (id === 'services' && map) setTimeout(function () {map.invalidateSize();},180);
    if (id === 'services' && !map) setTimeout(activateMap,150);
  }
  function tool(action) {
    if(action==='gia') { if (window.MOHWGIA && window.MOHWGIA.open) window.MOHWGIA.open(); else $('#gia2Launcher')?.click(); return; }
    if(action==='access') { $('[data-p2="access"]')?.click(); return; }
    if(action==='search') { navigate('services'); setTimeout(function(){ $('#preview-search')?.focus(); },200);return; }
    var name = action==='report'?'issue':action==='feedback'?'feedback':action==='download'?'download':'share';
    var button = $('#guideActionDock [data-action="'+name+'"]');
    if (button) button.click(); else if (name==='download')navigate('manual');
    else if(name==='share' && navigator.share)navigator.share({title:'MOHW Social Support Preview',url:location.href}).catch(function(){});
  }
  function card(title, detail, route, tone, symbol) {
    return '<button class="pv-feature pv-'+tone+'" type="button" data-pv-go="'+route+'"><span class="pv-feature-symbol">'+symbol+'</span><span class="pv-feature-copy"><strong>'+title+'</strong><small>'+detail+'</small></span><span class="pv-feature-arrow">'+icon.arrow+'</span></button>';
  }
  function buildHome() {
    var view=$('#view-about'); if(!view || $('#pv-home'))return;
    var home=document.createElement('div'); home.className='pv-home'; home.id='pv-home';
    home.innerHTML=[
      '<div class="pv-home-inner">',
        '<section class="pv-video-panel" aria-label="Meet GIA introduction">',
          '<div class="pv-video-top"><span class="pv-kicker">✦ YOUR DIGITAL GUIDE</span><span class="pv-video-duration">Watch the welcome</span></div>',
          '<div class="pv-video-player"><video id="pv-gia-video" controls playsinline preload="metadata" poster="assets/mobile-v3/video.webp" aria-label="GIA video introduction"><source src="assets/gia-introduction.mp4" type="video/mp4">Your browser does not support video playback.</video></div>',
          '<div class="pv-video-footer"><div><strong>Meet <em>GIA</em></strong><span>Your virtual guide to MOHW Social Support</span></div><button type="button" data-pv-tool="gia">Ask GIA <b>↗</b></button></div>',
        '</section>',
        '<section class="pv-family-panel" aria-labelledby="pv-heading">',
          '<img class="pv-family-photo" src="assets/about-community.webp" alt="Jamaican community members and a support worker together">',
          '<div class="pv-family-shade"></div>',
          '<div class="pv-family-copy"><span class="pv-kicker">JAMAICA · PEOPLE FIRST</span><h1 id="pv-heading">Find the support<br><em>you need.</em></h1><p>Explore services, make informed referrals and find a caring place to start.</p><button type="button" data-pv-go="services">Explore services <span>→</span></button></div>',
        '</section>',
        '<section class="pv-features" aria-label="Explore the guide">',
          '<div class="pv-section-heading"><span>THE SUPPORT HUB</span><h2>How can we help you?</h2></div>',
          '<div class="pv-feature-grid">',
            card('Find services','Search by parish, agency or need','services','green',icon.map),
            card('Make a referral','Six thoughtful steps to connect someone','referrals','gold',icon.referral),
            card('Get help choosing','Explore the best place to start','decision','cyan',icon.decision),
            card('Read the manual','Open the interactive guide','manual','pink',icon.book),
          '</div>',
        '</section>',
        '<div class="pv-ribbon" aria-hidden="true"><i></i><i></i><i></i><i></i></div>',
        '<nav class="pv-explore" aria-label="More ways to explore"><button data-pv-go="programmes">Programmes <span>↗</span></button><button data-pv-go="categories">Categories <span>↗</span></button><button data-pv-go="contacts">Agency contacts <span>↗</span></button></nav>',
        '<nav class="pv-utility" aria-label="Guide actions">',
          '<button data-pv-tool="share" type="button"><span class="pv-utility-icon">↗</span>Share</button>',
          '<button data-pv-tool="report" type="button"><span class="pv-utility-icon">⚑</span>Report</button>',
          '<button data-pv-tool="feedback" type="button"><span class="pv-utility-icon">✉</span>Feedback</button>',
          '<button data-pv-tool="download" type="button"><span class="pv-utility-icon">↓</span>Download</button>',
          '<button data-pv-tool="gia" type="button" class="pv-utility-gia"><img src="assets/gia-avatar.jpg" alt="">GIA</button>',
        '</nav>',
        '<p class="pv-home-note">Concept preview for stakeholder review · Programme details, office hours and eligibility must be confirmed with the responsible agencies.</p>',
      '</div>'
    ].join('');
    view.insertBefore(home,view.firstChild);
  }
  function buildNavigation() {
    var nav=$('#mainNav'); if(!nav)return;
    var access=document.createElement('button');
    access.className='pv-nav-access'; access.type='button'; access.setAttribute('aria-label','Accessibility and listening');
    access.innerHTML=icon.access+'<span>Accessibility</span>';
    access.addEventListener('click',function(){tool('access');});nav.append(access);
    var head=$('.site-header');
    var sub=document.createElement('nav'); sub.className='pv-subnav';sub.setAttribute('aria-label','More guide sections');
    sub.innerHTML='<button data-nav="programmes" type="button">Programmes</button><button data-nav="categories" type="button">Categories</button><button data-nav="contacts" type="button">Agency contacts</button>';
    sub.addEventListener('click',function(e){var b=e.target.closest('button[data-nav]');if(b)navigate(b.dataset.nav);});
    head.append(sub);
    var srch=document.createElement('button');srch.className='pv-search-trigger';srch.type='button';srch.setAttribute('aria-label','Search services');srch.textContent='⌕';srch.addEventListener('click',function(){tool('search');});
    $('.navbar')?.append(srch);
    var label=document.createElement('div'); label.className='pv-preview-label';label.textContent='PREVIEW • NOT LIVE';head.prepend(label);
  }
  function buildDirectory() {
    var page=$('#view-services .page-content');if(!page||$('#pv-directory'))return;
    var section=document.createElement('section');section.id='pv-directory';section.className='pv-directory';section.setAttribute('aria-label','Interactive Jamaica service directory');
    section.innerHTML=[
      '<div class="pv-dir-banner"><div><span class="pv-kicker">FIND SERVICES · JAMAICA</span><h2>Explore Jamaica, <em>find support.</em></h2><p>Search listed offices across Jamaica and open directions to their published addresses.</p></div><span class="pv-dir-count" id="pv-dir-count">Loading directory…</span></div>',
      '<div class="pv-dir-toolbar">',
        '<div class="pv-switch" role="group" aria-label="Directory view"><button id="pv-view-map" class="selected" type="button" aria-pressed="true">⌖ Map</button><button id="pv-view-list" type="button" aria-pressed="false">☷ List</button></div>',
        '<div class="pv-dir-filters"><label>Parish<select id="pv-parish"><option value="ALL">All parishes</option></select></label><label>Service<select id="pv-type"><option value="ALL">All services</option><option value="mlss">Benefits & NIS</option><option value="nht">Housing</option><option value="drugServ">Medication</option><option value="healthDept">Health services</option></select></label></div>',
        '<label class="pv-dir-search"><span>⌕</span><input id="preview-search" type="search" placeholder="Search office, service, parish or town" aria-label="Search directory offices"></label>',
      '</div>',
      '<div class="pv-map-wrapper" id="pv-map-wrapper"><div class="pv-map" id="pv-map" role="region" aria-label="Interactive map showing Jamaican parish directory hubs"></div><div id="pv-map-fallback" class="pv-map-fallback" hidden><p>The map tiles could not load. Use the fully searchable office list below, or open Jamaica in OpenStreetMap.</p><a href="https://www.openstreetmap.org/#map=8/18.13/-77.30" target="_blank" rel="noopener noreferrer">Open Jamaica map ↗</a></div><div class="pv-map-caption">Map pins mark <strong>parish-area hubs</strong>, not exact office entrances. Select a parish to find listed offices and use Directions for an address search. © OpenStreetMap contributors.</div></div>',
      '<div class="pv-dir-results-heading"><div><span>PARISH OFFICE DIRECTORY</span><h3 id="pv-results-title">Available directory listings</h3></div><span id="pv-result-count" role="status" aria-live="polite"></span></div>',
      '<div id="pv-results" class="pv-results"><p>Loading published office listings…</p></div>',
      '<button id="pv-show-more" class="pv-show-more" type="button" hidden>Show more listings ↓</button>',
      '<div class="pv-dir-endnote"><strong>Accuracy & safety</strong><p>Office details come from the source-linked November 2026 directory. The guide does not establish verified GPS coordinates, opening hours, eligibility or availability. Confirm before travelling.</p><button data-pv-go="programmes">View all programmes ↗</button><button data-pv-go="contacts">Agency contacts ↗</button><button data-pv-tool="gia">Ask GIA ↗</button><nav class="pv-dir-utilities" aria-label="Directory quick actions"><button type="button" data-pv-tool="share">↗ Share</button><button type="button" data-pv-tool="report">⚑ Report</button><button type="button" data-pv-tool="feedback">✉ Feedback</button><button type="button" data-pv-tool="download">↓ Manual</button><button type="button" data-pv-tool="gia">✦ GIA</button></nav></div>'
    ].join('');
    page.insertBefore(section,page.firstChild);
  }
  function normal(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
  function googleUrl(s){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.address || (s.name+', '+s.parish+', Jamaica'));}
  function sourceUrl(s){var x=String(s.source||'');return /^https:\/\/[a-z0-9.-]+\//i.test(x)?x:'';}
  function tel(v){return String(v||'').replace(/[^\d+]/g,'');}
  function makeOfficeRecords(data) {
    parishInfo=data.parishes||{};
    offices=[];
    Object.keys(parishInfo).forEach(function(parish){
      var entry=parishInfo[parish];
      Object.keys(types).forEach(function(type){
        var o=entry[type];if(!o || !o.name || !o.address)return;
        offices.push({parish:parish, type:type, region:entry.region||'', name:o.name, address:o.address, phone:o.phone||'',source:o.source||'',scope:o.scope||''});
      });
    });
    var sel=$('#pv-parish'); Object.keys(parishInfo).sort().forEach(function(p){var el=document.createElement('option');el.value=p;el.textContent=p;sel.append(el);});
  }
  function filtered() {
    return offices.filter(function(o) {
      return (currentParish==='ALL'||o.parish===currentParish) &&
        (currentType==='ALL'||o.type===currentType) &&
        (!query || normal([o.name,o.address,o.parish,o.region,o.scope,types[o.type].name].join(' ')).indexOf(normal(query))>=0);
    });
  }
  function officeMarkup(o) {
    var typ=types[o.type],src=sourceUrl(o);
    return '<article class="pv-office-card"><div class="pv-office-header"><span class="pv-office-mark pv-of-'+o.type+'">'+typ.icon+'</span><div><small>'+esc(o.parish)+' · '+esc(typ.name)+'</small><h4>'+esc(o.name)+'</h4></div></div>'+
      '<p class="pv-office-address">⌖ '+esc(o.address)+'</p>'+
      (o.phone?'<a class="pv-phone" href="tel:'+esc(tel(o.phone))+'">☎ '+esc(o.phone)+'</a>':'')+
      '<div class="pv-office-links"><a href="'+esc(googleUrl(o))+'" target="_blank" rel="noopener noreferrer">Directions ↗</a>'+
      (src?'<a href="'+esc(src)+'" target="_blank" rel="noopener noreferrer">Official listing ↗</a>':'')+
      '<button type="button" data-pv-zoom="'+esc(o.parish)+'">View parish</button></div>'+
      '<p class="pv-office-caveat">'+esc(o.scope||'Confirm this office’s services and hours before visiting.')+'</p></article>';
  }
  function render() {
    var list=filtered(), per=expanded?list.length:Math.min(list.length,9);
    $('#pv-dir-count').textContent=list.length+' listings · '+new Set(list.map(function(o){return o.parish;})).size+' parishes';
    $('#pv-results-title').textContent=currentParish==='ALL'?'Browse offices across Jamaica':currentParish+' parish offices';
    $('#pv-result-count').textContent=list.length+' matching '+(list.length===1?'listing':'listings');
    $('#pv-results').innerHTML=list.length?list.slice(0,per).map(officeMarkup).join(''):'<div class="pv-empty">No listings match those filters. Try another parish or a broader search.</div>';
    $('#pv-show-more').hidden=expanded||list.length<=9;
    $('#pv-show-more').textContent='Show all '+list.length+' listings ↓';
    renderPins(list);
  }
  function renderPins(list) {
    if(!map||!window.L)return;
    pinsLayer.clearLayers();
    var parishes={};list.forEach(function(o){parishes[o.parish]=(parishes[o.parish]||0)+1;});
    Object.keys(parishes).forEach(function(parish) {
      if(!coords[parish])return;
      var n=parishes[parish];
      var p=window.L.circleMarker(coords[parish],{radius:11,color:'#fff',weight:3,fillColor:'#f9bd04',fillOpacity:1});
      p.bindPopup('<div class="pv-popup"><strong>'+esc(parish)+'</strong><small>'+n+' listed '+(n===1?'office':'offices')+'</small><p>Parish-area marker, not an exact agency location.</p><button type="button" data-pv-pin="'+esc(parish)+'">View parish listings →</button></div>');
      p.addTo(pinsLayer);
    });
  }
  function activateMap() {
    if(map)return;
    var node=$('#pv-map');if(!node)return;
    if(typeof window.L==='undefined'){node.hidden=true;$('#pv-map-fallback').hidden=false;return;}
    try {
      map=window.L.map(node,{scrollWheelZoom:false,zoomControl:true,minZoom:7,maxZoom:18}).setView([18.13,-77.3],8);
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);
      pinsLayer=window.L.layerGroup().addTo(map);
      renderPins(filtered());
      setTimeout(function(){if(map)map.invalidateSize();},250);
    }catch(e){console.error('Map unavailable',e);node.hidden=true;$('#pv-map-fallback').hidden=false;}
  }
  function focusParish(name) {
    if(!parishInfo || !parishInfo[name])return;
    currentParish=name;$('#pv-parish').value=name;expanded=false;render();
    if(window.MOHWGIA && window.MOHWGIA.setParish)window.MOHWGIA.setParish(name);
    if(map && coords[name]){map.invalidateSize();map.flyTo(coords[name],10,{duration:.6});}
    $('#pv-results-title')?.scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  function setMode(mode){
    viewMode=mode;$('#pv-map-wrapper').hidden=mode==='list';
    $('#pv-view-map').classList.toggle('selected',mode==='map');
    $('#pv-view-list').classList.toggle('selected',mode==='list');
    $('#pv-view-map').setAttribute('aria-pressed',String(mode==='map'));
    $('#pv-view-list').setAttribute('aria-pressed',String(mode==='list'));
    if(mode==='map'){activateMap();setTimeout(function(){map?.invalidateSize();},100);}
  }
  function bind() {
    document.addEventListener('click',function(e){
      var nav=e.target.closest('[data-pv-go]');if(nav){e.preventDefault();navigate(nav.dataset.pvGo);return;}
      var action=e.target.closest('[data-pv-tool]');if(action){e.preventDefault();tool(action.dataset.pvTool);return;}
      var pin=e.target.closest('[data-pv-pin]');if(pin){focusParish(pin.dataset.pvPin);return;}
      var zoom=e.target.closest('[data-pv-zoom]');if(zoom){setMode('map');focusParish(zoom.dataset.pvZoom);$('#pv-map-wrapper').scrollIntoView({block:'nearest'});return;}
    });
    $('#pv-parish').addEventListener('change',function(e){currentParish=e.target.value;expanded=false;render();if(map){if(currentParish==='ALL')map.setView([18.13,-77.3],8);else if(coords[currentParish])map.flyTo(coords[currentParish],10);}});
    $('#pv-type').addEventListener('change',function(e){currentType=e.target.value;expanded=false;render();});
    $('#preview-search').addEventListener('input',function(e){query=e.target.value.trim();expanded=false;render();});
    $('#pv-view-map').addEventListener('click',function(){setMode('map');});
    $('#pv-view-list').addEventListener('click',function(){setMode('list');});
    $('#pv-show-more').addEventListener('click',function(){expanded=true;render();});
    var obs=new MutationObserver(function(){
      if($('#view-services').classList.contains('active')&&viewMode==='map'){
        if(!map)activateMap();
        else setTimeout(function(){map.invalidateSize();},140);
      }
    });
    obs.observe($('#view-services'),{attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',function(){if(map&&$('#view-services').classList.contains('active'))map.invalidateSize();});
  }
  function boot() {
    document.documentElement.classList.add('premium-preview');
    document.body.classList.add('premium-preview');
    buildNavigation();buildHome();buildDirectory();bind();
    fetch('data/gia-parishes.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('Parish directory unavailable');return r.json();}).then(function(data){makeOfficeRecords(data);render(); if($('#view-services').classList.contains('active'))activateMap();}).catch(function(error){
      console.error(error);$('#pv-results').innerHTML='<div class="pv-empty">Parish office data could not load. Try reloading the page.</div>';$('#pv-dir-count').textContent='Directory unavailable';
    });
    // This preview should never claim that a location marker represents a verified agency GPS pin.
    var watch=new MutationObserver(function(){ if($('#view-services').classList.contains('active')&&offices.length && viewMode==='map')activateMap(); });
    watch.observe($('#view-services'),{attributes:true,attributeFilter:['class']});
    window.addEventListener('hashchange',function(){var h=location.hash.replace('#','');if(navigation.indexOf(h)>=0)navigate(h);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();