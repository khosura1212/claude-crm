/* ============================================================================
   CRM ISO \u2014 Shared App Shell
   Injects a persistent sidebar + topbar navigation across all modules and a
   unified light/dark theme toggle. Never touches existing page markup or
   any of the page's own <script> logic \u2014 it only prepends new elements.
   ========================================================================== */
(function(){
  "use strict";

  var MODULES = [
    { group: "Fase 1 \u2014 Market Intelligence & Pipeline", items: [
      { href:"prospek-global.html", icon:"\u{1F30F}", label:"Pipeline Prospek Global", mod:"01" },
      { href:"prospek-lokal.html",  icon:"\u{1F1EE}\u{1F1E9}", label:"Pipeline Prospek Indonesia", mod:"02" }
    ]},
    { group: "Fase 2 \u2014 Lead Gen, Content & RevOps", items: [
      { href:"konten.html",   icon:"\u270D\uFE0F", label:"Content Marketing Engine", mod:"03" },
      { href:"leads.html",    icon:"\u{1F4E5}", label:"Lead Generation Hub", mod:"04" },
      { href:"outreach.html", icon:"\u{1F4E4}", label:"Outreach Engine", mod:"05" },
      { href:"revops.html",   icon:"\u{1F4CA}", label:"RevOps Layer", mod:"06" }
    ]},
    { group: "Fase 3 \u2014 Proposal, Delivery & Client", items: [
      { href:"proposal.html",  icon:"\u{1F4DD}", label:"Proposal & Pricing Suite", mod:"07" },
      { href:"dokumen.html",   icon:"\u{1F4C2}", label:"Document Center", mod:"08" },
      { href:"delivery.html",  icon:"\u{1F680}", label:"Delivery Tracker", mod:"09" },
      { href:"klien.html",     icon:"\u{1F91D}", label:"Client Success", mod:"10" },
      { href:"analytics.html", icon:"\u{1F4C8}", label:"Analytics & Attribution", mod:"11" }
    ]},
    { group: "Fase 4 \u2014 Audit, Knowledge & Settings", items: [
      { href:"audit.html",      icon:"\u{1F50D}", label:"Audit Operations Hub", mod:"12" },
      { href:"kb.html",         icon:"\u{1F4DA}", label:"Knowledge Base", mod:"13" },
      { href:"settings.html",   icon:"\u2699\uFE0F", label:"Settings & Integrations", mod:"14" },
      { href:"arsitektur.html", icon:"\u{1F3D7}\uFE0F", label:"Arsitektur Sistem", mod:"Ref" }
    ]},
    { group: "Fase 5 \u2014 Competitive & Marketing Intel", items: [
      { href:"competitors.html", icon:"\u{1F50E}", label:"Competitor Intelligence", mod:"15" },
      { href:"skills.html",      icon:"\u26A1", label:"Marketing Skills Hub", mod:"16" }
    ]},
    { group: "Fase 6 \u2014 Revenue & Growth Intelligence", items: [
      { href:"forecast.html",   icon:"\u{1F4C8}", label:"Revenue Intelligence", mod:"17" },
      { href:"seo.html",        icon:"\u{1F5FA}\uFE0F", label:"Programmatic SEO Planner", mod:"18" },
      { href:"tim.html",        icon:"\u{1F465}", label:"Team & Capacity Manager", mod:"19" },
      { href:"enrichment.html", icon:"\u{1F52C}", label:"Lead Enrichment Hub", mod:"20" }
    ]}
  ];

  function currentFile(){
    var p = location.pathname.split("/").filter(Boolean);
    var last = p.length ? p[p.length-1] : "index.html";
    return last || "index.html";
  }

  function esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  /* ---------- Theme handling (shared across every page) ------------------ */
  var THEME_KEY = "iso-theme";
  function getTheme(){
    try{ return localStorage.getItem(THEME_KEY) || ""; }catch(e){ return ""; }
  }
  function applyTheme(mode){
    var root = document.documentElement;
    if(mode === "light" || mode === "dark"){
      root.setAttribute("data-theme", mode);
    } else {
      root.removeAttribute("data-theme");
    }
  }
  function toggleTheme(){
    var cur = getTheme();
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var effectiveDark = cur ? cur === "dark" : prefersDark;
    var next = effectiveDark ? "light" : "dark";
    try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
    applyTheme(next);
    updateThemeIcons();
  }
  function updateThemeIcons(){
    var cur = getTheme();
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var effectiveDark = cur ? cur === "dark" : prefersDark;
    document.querySelectorAll(".js-theme-toggle").forEach(function(btn){
      btn.textContent = effectiveDark ? "\u2600\uFE0F" : "\u{1F319}";
      btn.title = effectiveDark ? "Ganti ke mode terang" : "Ganti ke mode gelap";
    });
  }
  applyTheme(getTheme());

  /* ---------- Extract old page title/subtitle before hiding header ------- */
  function extractHeaderInfo(){
    // Scoped deliberately to the chrome header wrapper classes only (not a
    // bare "header h1"/"header p"): some pages (e.g. arsitektur.html) nest an
    // unrelated <header> further down inside page content, and a loose
    // selector would pick up that heading's text instead of the real title.
    var h1 = document.querySelector(".header-text h1, .header-main .header-title, .header-title");
    var sub = document.querySelector(".header-text p, .header-main .header-sub, .header-sub");
    var title = h1 ? h1.textContent.trim() : document.title.split("\u2014")[0].trim();
    var subtitle = sub ? sub.textContent.trim() : "";
    return { title: title || document.title, subtitle: subtitle };
  }

  /* ---------- Build sidebar ------------------------------------------------ */
  function buildSidebar(activeFile){
    var groupsHtml = MODULES.map(function(g){
      var itemsHtml = g.items.map(function(it){
        var active = it.href === activeFile;
        return '<a class="app-nav-link' + (active ? " active" : "") + '" href="' + it.href + '">' +
          '<span class="ic">' + it.icon + '</span>' +
          '<span class="lbl">' + esc(it.label) + '</span>' +
          '<span class="badge-num">' + esc(it.mod) + '</span>' +
        '</a>';
      }).join("");
      return '<div class="app-nav-group"><div class="app-nav-label">' + esc(g.group) + '</div>' + itemsHtml + '</div>';
    }).join("");

    var aside = document.createElement("aside");
    aside.className = "app-sidebar";
    aside.innerHTML =
      '<div class="app-sidebar-brand">' +
        '<div class="mark">ISO</div>' +
        '<div><div class="name">CRM Konsultan ISO</div><div class="sub">arafarnusa.com</div></div>' +
      '</div>' +
      '<div class="app-sidebar-scroll">' +
        '<a class="app-nav-link' + (activeFile === "index.html" ? " active" : "") + '" href="index.html" style="margin-bottom:6px">' +
          '<span class="ic">\u{1F3E0}</span><span class="lbl">Dashboard</span>' +
        '</a>' +
        groupsHtml +
      '</div>' +
      '<div class="app-sidebar-foot"><span>20 Modul CRM</span><span id="crmClock"></span></div>';
    return aside;
  }

  /* ---------- Build topbar -------------------------------------------------- */
  function buildTopbar(info){
    var header = document.createElement("div");
    header.className = "app-topbar";
    header.innerHTML =
      '<button class="app-hamburger js-sidebar-toggle" aria-label="Buka menu">\u2630</button>' +
      '<div class="app-crumb">' +
        '<a class="home" href="index.html">CRM</a>' +
        '<span class="sep">/</span>' +
        '<span class="title">' + esc(info.title) + '</span>' +
        (info.subtitle ? '<span class="sub">' + esc(info.subtitle) + '</span>' : '') +
      '</div>' +
      '<div class="app-topbar-actions">' +
        '<button class="app-icon-btn js-theme-toggle" title="Ganti tema">\u{1F319}</button>' +
        '<a class="app-icon-btn" href="index.html" title="Dashboard" style="text-decoration:none">\u{1F3E0}</a>' +
      '</div>';
    return header;
  }

  function buildOverlay(){
    var ov = document.createElement("div");
    ov.className = "app-overlay js-sidebar-overlay";
    return ov;
  }

  /* ---------- Mini bar for pages that already have their own nav --------- */
  function buildMiniBar(info){
    var bar = document.createElement("div");
    bar.className = "app-mini-bar";
    bar.innerHTML =
      '<a class="home" href="index.html">\u2190 CRM</a>' +
      '<span class="crumb">/</span>' +
      '<span class="title">' + esc(info.title) + '</span>' +
      '<span class="spacer"></span>' +
      '<button class="app-icon-btn js-theme-toggle" title="Ganti tema" style="width:30px;height:30px">\u{1F319}</button>';
    return bar;
  }

  /* ---------- Init ------------------------------------------------------------ */
  function init(){
    var html = document.documentElement;
    var body = document.body;
    if(!body) return;

    var activeFile = currentFile();
    var info = extractHeaderInfo();
    var hasOwnNav = !!document.querySelector(".sidebar, .app > .sidebar, nav.toc, .app[class]  .sidebar");
    // More precise own-nav detection: prospek-global/lokal use <div class="app"><aside class="sidebar">,
    // arsitektur uses <div class="page"><nav class="toc">.
    hasOwnNav = !!document.querySelector("aside.sidebar, nav.toc");

    if(hasOwnNav){
      html.classList.add("crm-mini-bar");
      var mini = buildMiniBar(info);
      body.insertBefore(mini, body.firstChild);
    } else {
      html.classList.add("crm-has-shell");
      var aside = buildSidebar(activeFile);
      var overlay = buildOverlay();
      var topbar = buildTopbar(info);
      body.appendChild(aside);
      body.appendChild(overlay);
      body.insertBefore(topbar, body.firstChild);

      var toggleBtn = topbar.querySelector(".js-sidebar-toggle");
      function closeSidebar(){ html.classList.remove("crm-sidebar-open"); }
      function openSidebar(){ html.classList.add("crm-sidebar-open"); }
      toggleBtn.addEventListener("click", function(){
        html.classList.contains("crm-sidebar-open") ? closeSidebar() : openSidebar();
      });
      overlay.addEventListener("click", closeSidebar);
      aside.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeSidebar); });

      var clockEl = aside.querySelector("#crmClock");
      if(clockEl){
        try{
          clockEl.textContent = new Date().toLocaleDateString("id-ID", { day:"numeric", month:"short" });
        }catch(e){}
      }
    }

    document.querySelectorAll(".js-theme-toggle").forEach(function(btn){
      btn.addEventListener("click", toggleTheme);
    });
    updateThemeIcons();
    if(window.matchMedia){
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateThemeIcons);
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
