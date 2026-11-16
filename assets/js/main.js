/* SAFRC demo — shared site JS
   Everything a visitor chooses sticks on EVERY page — dark/light theme,
   cookie consent, Land Acknowledgment state and the announcement-bar
   dismissal — via a layered store (localStorage + real cookie +
   sessionStorage + window.name) so state survives on http(s), localhost
   and file:// alike. Also: nav + drawer with "where am I" highlighting,
   scroll reveals, marquee, lightbox, counters, accordions, cursor-follow
   CTA boxes, the announcement-bar countdown / 30-minute reappearance,
   newsletter + contact forms, the word-mask hero entrance and the
   --site-top-h header-height variable that keeps hero content safely
   below the fixed header stack on every page. */
(function(){
  "use strict";
  document.documentElement.classList.add("js");
  const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G=window.gsap||null, M=window.Motion||null;
  const hasG=!!(G&&window.ScrollTrigger&&!RM), hasM=!!(M&&M.animate&&!RM);
  if(hasG)G.registerPlugin(window.ScrollTrigger);
  const $=(s,c)=>(c||document).querySelector(s);
  const $$=(s,c)=>Array.from((c||document).querySelectorAll(s));
  const SPRING={type:"spring",stiffness:200,damping:22};
  const refreshScroll=()=>{if(window.ScrollTrigger)window.ScrollTrigger.refresh();};

  /* ---------- layered shared store: one choice, every page ----------
     Read: localStorage -> cookie -> sessionStorage -> window.name.
     Write: all of them, best-effort. window.name travels with the tab
     between pages, so even a browser with storage blocked keeps the
     dark-mode choice while you move around the site. */
  const SKEY=k=>"safrc-"+k;
  function nameMap(){try{var n=window.name||"";return n.indexOf("safrc|")===0?n.slice(6):""}catch(e){return ""}}
  function nameGet(k){try{var q=new RegExp("(?:^|&)"+k+"=([^&]*)").exec(nameMap());return q?decodeURIComponent(q[1]):null}catch(e){return null}}
  function nameSet(k,v){
    try{
      var map=nameMap(),parts=map?map.split("&"):[],kv={};
      parts.forEach(function(p){var i=p.indexOf("=");if(i>0)kv[p.slice(0,i)]=p.slice(i+1)});
      kv[k]=encodeURIComponent(v);
      window.name="safrc|"+Object.keys(kv).map(function(x){return x+"="+kv[x]}).join("&");
    }catch(e){}
  }
  function KGET(k){
    try{var v=localStorage.getItem(SKEY(k));if(v!==null&&v!=="")return v}catch(e){}
    try{var m=document.cookie.match(new RegExp("(?:^|; )"+SKEY(k)+"=([^;]*)"));if(m)return decodeURIComponent(m[1])}catch(e){}
    try{var s=sessionStorage.getItem(SKEY(k));if(s!==null&&s!=="")return s}catch(e){}
    var n=nameGet(k);if(n!==null)return n;
    return null;
  }
  function KSET(k,v){
    v=String(v);
    try{localStorage.setItem(SKEY(k),v)}catch(e){}
    try{document.cookie=SKEY(k)+"="+encodeURIComponent(v)+"; max-age=31536000; path=/; SameSite=Lax"}catch(e){}
    try{sessionStorage.setItem(SKEY(k),v)}catch(e){}
    nameSet(k,v);
  }

  /* ---------- fixed header height → --site-top-h (every page) ----------
     The announcement topbar wraps to different heights per viewport, so
     hero / page-hero padding is computed from the REAL .site-top height
     instead of a hardcoded guess — this is what keeps the "since 1982"
     badge and the hero copy safely BELOW the fixed header on phones. */
  (function headerHeight(){
    const st=$("#siteTop");
    if(!st)return;
    let raf=0;
    const set=()=>{
      const h=st.offsetHeight;
      if(h>0)document.documentElement.style.setProperty("--site-top-h",h+"px");
      if(raf)cancelAnimationFrame(raf);
      raf=requestAnimationFrame(refreshScroll);
    };
    set();
    if(window.ResizeObserver)new ResizeObserver(set).observe(st);
    addEventListener("resize",set,{passive:true});
  })();

  /* ---------- theme: saved for ALL pages ---------- */
  const themeBtns=$$(".theme-toggle");
  function syncThemeUI(){const d=document.documentElement.dataset.theme==="dark";
    themeBtns.forEach(b=>{b.setAttribute("aria-pressed",String(d));
      b.setAttribute("aria-label",d?"Switch to light mode":"Switch to dark mode");});}
  function applyTheme(t){document.documentElement.dataset.theme=t;KSET("theme",t);syncThemeUI();}
  function toggleTheme(e){
    const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
    const r=e.currentTarget.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    if(!RM&&document.startViewTransition){
      const vt=document.startViewTransition(()=>applyTheme(next));
      vt.ready.then(()=>{const rad=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
        document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${rad}px at ${x}px ${y}px)`]},
          {duration:700,easing:"cubic-bezier(.22,1,.36,1)",pseudoElement:"::view-transition-new(root)"});}).catch(()=>{});
    }else{document.documentElement.classList.add("theming");applyTheme(next);
      setTimeout(()=>document.documentElement.classList.remove("theming"),600);}
  }
  themeBtns.forEach(b=>b.addEventListener("click",toggleTheme));syncThemeUI();
  /* keep other open tabs of the same site in sync */
  try{addEventListener("storage",e=>{
    if(e.key===SKEY("theme")&&e.newValue){document.documentElement.dataset.theme=e.newValue;syncThemeUI();}
  });}catch(e){}

  /* ---------- cookie consent: accept once, never shown again ----------
     One global key for the whole site — accepting on ANY page silences
     the banner on every other page and in every other open tab. */
  (function cookieConsent(){
    const b=$("#cookieBanner"); if(!b) return;
    if(KGET("cookie-consent")){ b.remove(); return; }
    setTimeout(()=>{ if(document.body.contains(b)) b.classList.add("show"); },1100);
    $$(".ck-accept",b).forEach(btn=>btn.addEventListener("click",()=>{
      KSET("cookie-consent",btn.dataset.consent||"all");
      b.classList.remove("show");
      setTimeout(()=>{ if(b.parentNode) b.remove(); },650);
    }));
    /* accepted in another tab → hide it here as well */
    try{addEventListener("storage",e=>{
      if(e.key===SKEY("cookie-consent")&&e.newValue){
        b.classList.remove("show");
        setTimeout(()=>{ if(b.parentNode) b.remove(); },400);
      }
    });}catch(e){}
  })();

  /* ---------- announcement topbar — winter registration ----------
     Shows on every page while its campaign window is open (window is
     configured in the <meta name="safrc-ann"> tag in every page head).
     Closing it hides it EVERYWHERE (shared store); 30 minutes later it
     comes back on its own, whatever page you are on. A live countdown
     runs until registration opens, then the message flips to
     "registration open" until the window ends. */
  (function topbar(){
    const tb=$("#topbar"); if(!tb) return;
    const REAPPEAR=30*60*1000;
    const conf={start:NaN,opens:NaN,until:NaN};
    const meta=document.querySelector('meta[name="safrc-ann"]');
    if(meta)(meta.content||"").split(";").forEach(p=>{
      const kv=p.split("=");if(kv[1])conf[kv[0].trim()]=Date.parse(kv[1].trim());});
    const strong=$("strong",tb),count=$("#annCount");
    let dismissed=KGET("topbar");dismissed=(dismissed===null||!isFinite(+dismissed))?NaN:+dismissed;
    const inRange=t=>!((isFinite(conf.start)&&t<conf.start)||(isFinite(conf.until)&&t>conf.until));
    function hideTb(){tb.classList.add("closed");}
    function showTb(){tb.classList.remove("closed");document.documentElement.classList.remove("topbar-off");}
    function fmt(ms){const s=Math.max(0,ms/1e3|0),d=s/86400|0,h=s%86400/3600|0,m=s%3600/60|0;
      return (d?d+"d ":"")+(d||h?h+"h ":"")+m+"m";}
    let iv=null;
    function tick(){
      if(!tb.isConnected){if(iv)clearInterval(iv);return;}
      const now=Date.now();
      if(!inRange(now)){tb.remove();document.documentElement.classList.remove("topbar-off");if(iv)clearInterval(iv);return;}
      if(isFinite(dismissed)&&now-dismissed>=REAPPEAR){dismissed=NaN;showTb();}
      if(isFinite(conf.opens)){
        if(count)count.textContent=now<conf.opens?("opens in "+fmt(conf.opens-now)):"registration open";
        if(strong&&now>=conf.opens&&strong.dataset.openText)strong.textContent=strong.dataset.openText;
      }
    }
    if(!inRange(Date.now())){tb.remove();document.documentElement.classList.remove("topbar-off");return;}
    if(isFinite(dismissed)&&Date.now()-dismissed<REAPPEAR)hideTb();
    else if(isFinite(dismissed))showTb();
    tick(); iv=setInterval(tick,30000);
    const close=$("#topbarClose");
    if(close)close.addEventListener("click",()=>{KSET("topbar",Date.now());dismissed=Date.now();hideTb();});
    /* dismissing it in another tab/page hides it here too */
    try{addEventListener("storage",e=>{
      if(e.key===SKEY("topbar")){
        const v=(e.newValue==null||!isFinite(+e.newValue))?NaN:+e.newValue;
        if(isFinite(v)&&Date.now()-v<REAPPEAR)hideTb();
      }});}catch(e){}
  })();

  /* ---------- active nav: the header tells you where you are ----------
     Highlights the current page's link AND its parent tab, so a sub-page
     (e.g. Early Childhood Programs) keeps the "Programs" tab lit. */
  (function activeNav(){
    const here=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    $$(".nav a[href], .drawer a[href]").forEach(a=>{
      const href=(a.getAttribute("href")||"").split("?")[0].split("#")[0];
      if(!href)return;
      if(href.indexOf("http")===0||href.indexOf("mailto:")===0||href.indexOf("tel:")===0)return;
      const target=href.split("/").pop().toLowerCase();
      if(target&&target===here){
        a.classList.add("is-active");a.setAttribute("aria-current","page");
        const li=a.closest(".has-drop");if(li)li.classList.add("is-current");
      }
    });
  })();

  /* ---------- hero entrance (home + subpages share .hero-title masks) ---------- */
  const title=$(".hero-title");
  if(title&&hasG)G.set(title,{autoAlpha:0});
  let heroStarted=false;
  function startHero(){if(heroStarted)return;heroStarted=true;heroEntrance();}
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(startHero);
  setTimeout(startHero,1500);
  function heroEntrance(){
    if(title&&hasG){
      const words=$$(".hero-title .wi",title),rule=$(".hero-hl",title),kicker=$(".hero-kicker");
      G.set(title,{autoAlpha:1});
      const tl=G.timeline({defaults:{ease:"power3.out"}});
      if(kicker)tl.fromTo(kicker,{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.6,ease:"power3.out"},0);
      if(words.length)tl.fromTo(words,{yPercent:118},{yPercent:0,duration:.95,ease:"power4.out",stagger:.075},.18);
      if(rule)tl.fromTo(rule,{scaleX:0},{scaleX:1,duration:.7,ease:"power2.inOut"},"-=.5");
      const others=$$("[data-hero]:not(.hero-kicker)");
      if(others.length)tl.fromTo(others,{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:.8,stagger:.16},"-=.35");
      refreshScroll();
    }else{ $$("[data-hero]").forEach(el=>el.style.opacity=1); }
  }

  const siteTop=$("#siteTop"),toTop=$("#toTop");let headerHidden=false;
  function setHeader(h){if(h===headerHidden)return;headerHidden=h;
    if(hasG&&siteTop)G.to(siteTop,{yPercent:h?-100:0,duration:.5,ease:"power3.out"});
    else if(siteTop)siteTop.style.transform=h?"translateY(-100%)":"";}
  if(toTop){addEventListener("scroll",()=>toTop.classList.toggle("show",scrollY>700),{passive:true});
    toTop.addEventListener("click",()=>scrollTo({top:0,behavior:RM?"auto":"smooth"}));}

  const revealEls=$$("[data-reveal]");
  if(hasG){
    const ST=window.ScrollTrigger;
    const pb=$("#progressBar");
    if(pb)G.to(pb,{scaleX:1,ease:"none",scrollTrigger:{trigger:document.body,start:"top top",end:"bottom bottom",scrub:.3}});
    const heroBg=$("#heroBg");
    if(heroBg)G.to(heroBg,{yPercent:16,ease:"none",scrollTrigger:{trigger:"#home, .page-hero",start:"top top",end:"bottom top",scrub:true}});
    const heroInner=$("#heroInner");
    if(heroInner)G.to(heroInner,{autoAlpha:0,y:60,ease:"none",scrollTrigger:{trigger:"#home, .page-hero",start:"top top",end:"70% top",scrub:true}});
    if(siteTop)ST.create({start:0,end:"max",onUpdate:self=>{if(!document.body.classList.contains("drawer-open"))setHeader(self.direction===1&&self.scroll()>480);siteTop.classList.toggle("scrolled",self.scroll()>40);}});
    if(revealEls.length){G.set(revealEls,{autoAlpha:0,y:44});
      ST.batch(revealEls,{start:"top 88%",onEnter:b=>G.to(b,{autoAlpha:1,y:0,duration:.9,ease:"power3.out",stagger:.12,overwrite:true})});
      /* safety net: an INSTANT scroll jump (skip link, browser scroll
         restoration on refresh, find-in-page) can outrun the batch and
         leave everything above the viewport stuck invisible. Whatever the
         visitor has already scrolled past must be visible — catch up on
         every scroll frame. */
      let rvRaf=0;
      const rvCheck=()=>{if(rvRaf)return;rvRaf=requestAnimationFrame(()=>{rvRaf=0;
        const vh=innerHeight;
        revealEls.forEach(el=>{
          const r=el.getBoundingClientRect();
          if(r.top<vh*.88&&parseFloat(getComputedStyle(el).opacity)<.9)
            G.to(el,{autoAlpha:1,y:0,duration:.9,ease:"power3.out",overwrite:true});
        });
      });};
      addEventListener("scroll",rvCheck,{passive:true});
      addEventListener("load",()=>setTimeout(rvCheck,300));
      setTimeout(rvCheck,600);
      rvCheck();
    }
    const bandBadge=$("#bandBadge"),bandWords=bandBadge?$$(".band-wi",bandBadge):[],bandRule=bandBadge?$(".band-hl",bandBadge):null;
    if(bandBadge&&bandWords.length){
      if(bandRule)G.set(bandRule,{scaleX:0});
      ST.create({trigger:bandBadge,start:"top 86%",once:true,onEnter:()=>{
        const tl=G.timeline({defaults:{ease:"power4.out"}});
        tl.fromTo(bandWords,{yPercent:118},{yPercent:0,duration:1,stagger:.085},.1);
        if(bandRule)tl.fromTo(bandRule,{scaleX:0},{scaleX:1,duration:.75,ease:"power2.inOut"},"-=.55");
      }});
    }
    const aboutImg=$("#aboutImg");
    if(aboutImg)G.fromTo(aboutImg,{scale:1.18},{scale:1,ease:"none",scrollTrigger:{trigger:".about-media, .split-media",start:"top 85%",end:"bottom 40%",scrub:true}});
    const yearsCount=$("#yearsCount");
    if(yearsCount)yearsCount.dataset.count=Math.max(1,new Date().getFullYear()-1982);
    $$("[data-count]").forEach(el=>{const target=+el.dataset.count;if(!target)return;const o={v:0};
      G.to(o,{v:target,duration:1.6,ease:"power2.out",onUpdate:()=>el.textContent=Math.round(o.v),
        scrollTrigger:{trigger:el,start:"top 92%",once:true}});});
    if($("#trackA")){
      ["trackA","trackB"].forEach((id,i)=>{const t=$("#"+id),n=t.children.length,set=t.innerHTML;
        t.innerHTML=set+set+set+set;Array.from(t.children).slice(n).forEach(el=>{el.setAttribute("aria-hidden","true");el.tabIndex=-1;});
        if(i)G.set(t,{xPercent:-25});
        const tw=G.to(t,{xPercent:i?0:-25,repeat:-1,ease:"none",duration:i?52:46});
        const w=t.closest(".marquee");w.addEventListener("pointerenter",()=>tw.pause());w.addEventListener("pointerleave",()=>tw.play());});
    }
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refreshScroll);
    addEventListener("load",refreshScroll);
  }else{
    revealEls.forEach(el=>el.classList.add("in-view"));
    const yearsCount=$("#yearsCount");
    if(yearsCount)yearsCount.dataset.count=Math.max(1,new Date().getFullYear()-1982);
    $$("[data-count]").forEach(el=>{el.textContent=el.dataset.count;});
    if($("#trackA")){
      ["trackA","trackB"].forEach((id,i)=>{const t=$("#"+id),n=t.children.length,set=t.innerHTML;t.innerHTML=set+set+set+set;
        Array.from(t.children).slice(n).forEach(el=>{el.setAttribute("aria-hidden","true");el.tabIndex=-1;});
        if(!RM){t.classList.add("css-marq");if(i)t.classList.add("rev");}});
    }
  }

  /* ---------- VMV cards + generic accordions ---------- */
  $$(".vmv-card, .acc").forEach(card=>{
    const btn=$(".vmv-toggle",card)||$(".acc-toggle",card),orb=$(".vmv-orb",card);
    if(!btn)return;
    btn.addEventListener("click",()=>{
      const open=btn.getAttribute("aria-expanded")==="true";
      btn.setAttribute("aria-expanded",String(!open));
      card.classList.toggle("is-collapsed",open);
      card.classList.toggle("open",!open);
      if(orb&&hasM)M.animate(orb,{scale:open?.82:1},SPRING);
      setTimeout(refreshScroll,600);
    });
    if(orb&&hasM&&matchMedia("(hover:hover)").matches){
      btn.addEventListener("pointerenter",()=>M.animate(orb,{scale:card.classList.contains("is-collapsed")?.86:1.06},SPRING));
      btn.addEventListener("pointerleave",()=>M.animate(orb,{scale:card.classList.contains("is-collapsed")?.82:1},SPRING));
    }
  });

  /* ---------- Land Acknowledgment: expand state saved for ALL pages ---------- */
  const landBox=$(".land"),landBtn=$(".land-toggle");
  if(landBox&&landBtn){
    function setLand(open){landBtn.setAttribute("aria-expanded",String(open));
      landBox.classList.toggle("is-collapsed",!open);}
    if(KGET("land")==="open")setLand(true);
    landBtn.addEventListener("click",()=>{
      const open=landBtn.getAttribute("aria-expanded")==="true";
      setLand(!open);KSET("land",open?"closed":"open");
      setTimeout(refreshScroll,600);
    });
    try{addEventListener("storage",e=>{
      if(e.key===SKEY("land")&&e.newValue)setLand(e.newValue==="open");});}catch(e){}
  }

  /* ---------- cursor-follow movement for interactive bits ----------
     The big CTA box ("Ready to join us?") and the newsletter box gently
     drift with the cursor; smaller elements tilt like before. */
  if(hasM&&matchMedia("(hover:hover)").matches){
    $$(".btn,.ann-btn,.hero-kicker,.brand,.theme-toggle,.badge-since,.frame,.vmv-card,.vmv-orb,.mini,.ph,.scroll-cue,.to-top,.ig-badge,.form-note,.f-brand img,.vmv-eyebrow,.funders a,.socials a,.band-badge,.hero-title,.hero-sub,.lead-box,.news-panel,.cta-card,.land,.ann-chip,.ann-count,.topbar-close,.ci .ico,#lbImg,.lightbox figcaption a,.info-card,.chip,.res-item,.logo-tile,.avatar,.tl-year,.contact-card,.map-card,.cform,.quote-tile,.badge-more,.find-badge,.guide-card,.step,.apply-panel,.partner-list li,.mini-stats .mini,.partner-grid .frame,.staff-card,.card-link").forEach(b=>{
      const big=b.matches(".news-panel,.cta-card,.guide-card,.cform,.map-card,.badge-more,.find-badge,.apply-panel");
      const [s,kx,ky]=big?[1.014,.02,.03]:
        b.closest(".frame,.vmv-card,.land,.band-badge,.hero-title,.hero-sub,.lead-box,.lightbox,.info-card")?[1.02,.03,.05]:
        b.matches(".vmv-orb,.ph")?[1.04,.1,.14]:[1.05,.22,.35];
      const rest=()=>b.matches(".vmv-orb")&&b.closest(".is-collapsed")?.82:1;
      b.addEventListener("pointermove",e=>{const r=b.getBoundingClientRect();
        M.animate(b,{scale:rest()*s,x:(e.clientX-r.left-r.width/2)*kx,y:(e.clientY-r.top-r.height/2)*ky},SPRING);});
      b.addEventListener("pointerleave",()=>M.animate(b,{scale:rest(),x:0,y:0},SPRING));});
  }

  /* ---------- dropdown menus ---------- */
  document.addEventListener("click",e=>{
    const inDrawer=!!e.target.closest("#drawer");
    const t=e.target.closest(".drop-toggle");
    if(t){const li=t.closest(".has-drop"),open=li.classList.contains("open");
      $$(":scope > .has-drop.open",li.parentElement).forEach(o=>{o.classList.remove("open");$(".drop-toggle",o).setAttribute("aria-expanded","false");});
      li.classList.toggle("open",!open);t.setAttribute("aria-expanded",String(!open));return;}
    /* outside-click closes only the header dropdowns — the drawer keeps its
       pre-opened "you are here" section */
    if(!inDrawer&&!e.target.closest(".has-drop"))$$(".site-top .has-drop.open").forEach(o=>{o.classList.remove("open");$(".drop-toggle",o).setAttribute("aria-expanded","false");});
  });

  /* ---------- mobile drawer ---------- */
  const drawer=$("#drawer"),burger=$("#burger"),navList=$("#navList"),drawerNav=$("#drawerNav");
  if(drawer&&burger&&navList&&drawerNav){
    drawerNav.appendChild(navList.cloneNode(true));
    const dn=$(".nav-list",drawerNav); if(dn)dn.removeAttribute("id");
    /* pre-open the section the visitor is currently in */
    $$(".has-drop.is-current",drawerNav).forEach(li=>{li.classList.add("open");
      const t=$(".drop-toggle",li);if(t)t.setAttribute("aria-expanded","true");});
    function setDrawer(open){document.body.classList.toggle("drawer-open",open);
      document.body.style.overflow=open?"hidden":"";
      drawer.setAttribute("aria-hidden",String(!open));drawer.inert=!open;
      burger.setAttribute("aria-expanded",String(open));if(open)setHeader(false);}
    burger.addEventListener("click",()=>setDrawer(!document.body.classList.contains("drawer-open")));
    const dClose=$("#drawerClose");
    if(dClose)dClose.addEventListener("click",()=>setDrawer(false));
    const scrim=$("#scrim");
    if(scrim)scrim.addEventListener("click",()=>setDrawer(false));
    drawer.addEventListener("click",e=>{if(e.target.closest("a"))setDrawer(false);});
    addEventListener("resize",()=>{if(innerWidth>1080)setDrawer(false);});
  }

  /* ---------- lightbox (home) ---------- */
  const gallery=[...new Set($$(".track img").map(i=>i.src))];
  const lb=$("#lightbox"),lbImg=$("#lbImg");
  if(lb&&lbImg&&gallery.length){
    let lbIndex=0,lbReturn=null;
    function openLb(i){lbIndex=(i+gallery.length)%gallery.length;lbImg.src=gallery[lbIndex];
      lbReturn=document.activeElement;
      lb.hidden=false;requestAnimationFrame(()=>lb.classList.add("open"));
      document.body.style.overflow="hidden";const c=$("#lbClose");if(c)c.focus();}
    function closeLb(){lb.classList.remove("open");document.body.style.overflow="";
      setTimeout(()=>{lb.hidden=true;},RM?0:380);
      if(lbReturn&&lbReturn.focus)lbReturn.focus();}
    $$(".track").forEach(t=>t.addEventListener("click",e=>{const ph=e.target.closest(".ph");
      if(ph)openLb(gallery.indexOf($("img",ph).src));}));
    const c=$("#lbClose");if(c)c.addEventListener("click",closeLb);
    const p=$("#lbPrev");if(p)p.addEventListener("click",()=>openLb(lbIndex-1));
    const n=$("#lbNext");if(n)n.addEventListener("click",()=>openLb(lbIndex+1));
    lb.addEventListener("click",e=>{if(e.target===lb)closeLb();});
    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"){if(!lb.hidden)closeLb();if(document.body.classList.contains("drawer-open")){const dc=$("#drawerClose");if(dc)dc.click();}
        $$(".has-drop.open").forEach(o=>{o.classList.remove("open");$(".drop-toggle",o).setAttribute("aria-expanded","false");});}
      if(!lb.hidden){if(e.key==="ArrowLeft")openLb(lbIndex-1);if(e.key==="ArrowRight")openLb(lbIndex+1);}
    });
  }else{
    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"){$$(".has-drop.open").forEach(o=>{o.classList.remove("open");$(".drop-toggle",o).setAttribute("aria-expanded","false");});
        if(document.body.classList.contains("drawer-open")){const dc=$("#drawerClose");if(dc)dc.click();}}
    });
  }

  /* ---------- newsletter form (home) ---------- */
  const form=$("#newsForm");
  if(form){
    form.addEventListener("submit",e=>{e.preventDefault();
      if(!form.checkValidity()){form.reportValidity();return;}
      form.hidden=true;const s=$("#newsSuccess");if(s)s.hidden=false;
      if(hasM)M.animate(s,{opacity:[0,1],scale:[.9,1]},SPRING);});
  }

  /* ---------- contact form (contact page) ---------- */
  const cform=$("#contactForm");
  if(cform){
    const cs=$("#contactSuccess"),again=$("#contactAgain");
    cform.addEventListener("submit",e=>{e.preventDefault();
      if(!cform.checkValidity()){cform.reportValidity();return;}
      cform.hidden=true;if(cs)cs.hidden=false;
      if(hasM&&cs)M.animate(cs,{opacity:[0,1],scale:[.94,1]},SPRING);
      if(cs)cs.scrollIntoView({behavior:RM?"auto":"smooth",block:"center"});});
    if(again)again.addEventListener("click",()=>{cform.reset();cform.hidden=false;if(cs)cs.hidden=true;});
  }

  /* ---------- zoom lightbox: click a testimonial photo to see it big ----------
     Any element marked [data-zoom] opens in a full overlay with prev/next,
     Escape and outside-click support — same pattern as the home gallery. */
  (function zoomBox(){
    const items=$$("[data-zoom]");
    if(!items.length)return;
    const lb=document.createElement("div");
    lb.className="lightbox";lb.hidden=true;
    lb.setAttribute("role","dialog");lb.setAttribute("aria-modal","true");lb.setAttribute("aria-label","Photo viewer");
    lb.innerHTML='<button class="lb-btn lb-close" aria-label="Close">✕</button>'+
      '<button class="lb-btn lb-prev" aria-label="Previous photo">‹</button>'+
      '<figure><img alt=""><figcaption></figcaption></figure>'+
      '<button class="lb-btn lb-next" aria-label="Next photo">›</button>';
    document.body.appendChild(lb);
    const zimg=$("img",lb),cap=$("figcaption",lb);let zi=0,lz=null;
    function showZ(i){
      zi=(i+items.length)%items.length;const it=items[zi];
      const img=it.tagName==="IMG"?it:$("img",it);if(!img)return;
      zimg.src=img.currentSrc||img.src;zimg.alt=img.alt||"Enlarged photo";
      cap.textContent=img.alt||it.getAttribute("data-zoom")||"";
      cap.style.color="#FFF8E7";cap.style.fontFamily="var(--font-m)";cap.style.fontSize=".8rem";
    }
    function openZ(i){showZ(i);lz=document.activeElement;lb.hidden=false;
      requestAnimationFrame(()=>lb.classList.add("open"));document.body.style.overflow="hidden";
      const c=$(".lb-close",lb);if(c)c.focus();}
    function closeZ(){lb.classList.remove("open");document.body.style.overflow="";
      setTimeout(()=>{lb.hidden=true;},RM?0:380);
      if(lz&&lz.focus)lz.focus();}
    items.forEach((it,i)=>it.addEventListener("click",e=>{
      if(e.target.closest("a"))return;openZ(i);}));
    lb.addEventListener("click",e=>{
      if(e.target===lb||e.target.classList.contains("lb-close"))closeZ();
      if(e.target.classList.contains("lb-prev"))showZ(zi-1);
      if(e.target.classList.contains("lb-next"))showZ(zi+1);});
    document.addEventListener("keydown",e=>{
      if(lb.hidden)return;
      if(e.key==="Escape")closeZ();
      if(e.key==="ArrowLeft")showZ(zi-1);
      if(e.key==="ArrowRight")showZ(zi+1);});
  })();

  const yearEl=$("#year");if(yearEl)yearEl.textContent=new Date().getFullYear();
})();
