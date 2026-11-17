/* ============================================================
   El Porvenir — choreography
   ============================================================ */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, body = doc.body;
  var I18N = window.EP_I18N, IMG = window.EP_IMG || {};
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var isMobile = function () { return window.innerWidth < 820; };
  var animated = hasGsap && !reduced;
  if (!animated) root.classList.add("static");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mixc(a, b, t) { return [lerp(a[0], b[0], t) | 0, lerp(a[1], b[1], t) | 0, lerp(a[2], b[2], t) | 0]; }
  function css(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }

  /* ---------- paper grain, generated once (no images, no blend modes) ---------- */
  (function grain() {
    var c = doc.createElement("canvas"); c.width = c.height = 160; var g = c.getContext("2d"), d = g.createImageData(160, 160);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random(); var dark = v < .5; d.data[i] = d.data[i + 1] = d.data[i + 2] = dark ? 20 : 255; d.data[i + 3] = (Math.abs(v - .5) * 2) * (dark ? 34 : 22); }
    g.putImageData(d, 0, 0); var el = $(".grain"); if (el) el.style.backgroundImage = "url(" + c.toDataURL() + ")";
  })();

  /* ---------- images (embedded once, assigned at runtime) ---------- */
  $$("img[data-img]").forEach(function (im) { if (IMG[im.dataset.img]) im.src = IMG[im.dataset.img]; });

  /* ---------- controls duplicated into the mobile drawer ---------- */
  var drawerFoot = $(".drawer-foot");
  drawerFoot.appendChild($(".langs").cloneNode(true));
  drawerFoot.appendChild($(".sound").cloneNode(true));

  /* ---------- i18n ---------- */
  var lang = "en";
  try { lang = localStorage.getItem("ep-lang") || ""; } catch (e) {}
  if (!I18N[lang]) { var nl = (navigator.language || "en").slice(0, 2); lang = I18N[nl] ? nl : "en"; }
  function tr(k) { return (I18N[lang] && I18N[lang][k]) || I18N.en[k] || ""; }
  function fmt(str) {
    return str.replace(/«(TBD|VERIFY)(?::\s*([^»]*))?»/g, function (_, k, note) {
      return '<mark class="ph" data-k="' + k + '">' + (note ? "<b>" + note + "</b>" : "") + "</mark>";
    });
  }
  function plain(str) { return str.replace(/«(TBD|VERIFY)(?::\s*([^»]*))?»/g, function (_, k, n) { return "[" + k + (n ? ": " + n : "") + "]"; }).replace(/<[^>]+>/g, ""); }
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w"><span>' + w + "</span></span>"; }).join(" ");
    el.setAttribute("aria-label", el.textContent);
  }
  function render() {
    $$("[data-t]").forEach(function (el) {
      var k = el.getAttribute("data-t"), v = tr(k);
      if (el.classList.contains("split")) { el.innerHTML = v; splitWords(el); }
      else el.innerHTML = fmt(v);
    });
    $$("[data-t-aria]").forEach(function (el) { el.setAttribute("aria-label", plain(tr(el.getAttribute("data-t-aria")))); });
    $$("img[data-alt]").forEach(function (el) { el.alt = plain(tr(el.getAttribute("data-alt"))); });
    $$("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    root.lang = lang === "pt" ? "pt-BR" : lang;
    doc.title = tr("meta.title");
    soundLabel();
    if (map) map.relabel(tr);
    $$(".split").forEach(function (el) { if (el.dataset.seen || !animated) el.classList.add("done"); });
    $$(".count[data-to]").forEach(function (el) { el.textContent = num(el.dataset.seen || !animated ? +el.dataset.to : 0); });
  }
  function num(n) { return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : lang).format(n); }
  function setLang(l) {
    if (l === lang) return;
    var cur = currentSection(), sec = doc.getElementById(cur), y = scrollY(), off = sec ? y - sectionTop(sec) : 0;
    lang = l; try { localStorage.setItem("ep-lang", l); } catch (e) {}
    render(); measure();
    if (hasGsap) ScrollTrigger.refresh();
    if (sec) jump(sectionTop(sec) + off);
  }

  /* ---------- scroll engine ---------- */
  var lenis = null;
  if (animated && window.Lenis) {
    lenis = new Lenis({ lerp: .16, wheelMultiplier: 1.35, touchMultiplier: 1.5, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    root.classList.add("lenis");
  }
  function scrollY() { return lenis ? lenis.scroll : window.pageYOffset; }
  function jump(y) { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }
  function goTo(id) {
    var el = doc.getElementById(id); if (!el) return;
    var y = sectionTop(el);
    if (id === "rest") y = sectionTop(el);
    if (lenis) lenis.scrollTo(y, { duration: 1.25, easing: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; }, force: true });
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }
  function sectionTop(el) { var r = el.getBoundingClientRect(); return r.top + scrollY(); }

  /* ---------- layout / keyframes ---------- */
  var IDS = ["home", "about", "values", "land", "nature", "year", "harvest", "gallery", "numbers", "contact", "rest"];
  var NAV = ["home", "about", "land", "year", "harvest", "gallery", "numbers", "contact"];
  var NAV_OF = { values: "about", nature: "land", rest: "contact" };
  var SEC = {}, VH = 0, VW = 0, MAXY = 1, keysPose = [], keysS = [];
  // season at the start and end of each section; tree pose [x, base, H, alpha] for desktop and mobile
  var SEASON = { home: [2, 2], about: [2.05, 2.35], values: [2.38, 2.55], land: [2.58, 2.9], nature: [2.95, 3.98], year: [4, 7.66], harvest: [7.7, 7.92], gallery: [7.96, 8], numbers: [8, 8], contact: [8, 8], rest: [8, 8] };
  var POSE_D = { home: [.5, .9, .94, 1], about: [.5, .9, .94, 0], values: [.88, .97, .62, 0], land: [.8, .96, .7, 0], nature: [.8, .96, .7, 0], year: [.35, .93, .92, 1], harvest: [.95, .97, .45, 0], gallery: [.9, .97, .5, 0], numbers: [.84, .95, .74, 0], contact: [.5, .95, .8, 0], rest: [.5, .93, .8, 1] };
  var POSE_M = { home: [.5, .755, .74, 1], about: [.5, .755, .74, 0], values: [.5, .95, .8, 0], land: [.5, .95, .7, 0], nature: [.5, .95, .7, 0], year: [.5, .56, .52, 1], harvest: [.8, .97, .5, 0], gallery: [.5, .97, .5, 0], numbers: [.55, .95, .8, 0], contact: [.5, .95, .8, 0], rest: [.5, .93, .8, 1] };

  function measure() {
    VH = window.innerHeight; VW = window.innerWidth;
    IDS.forEach(function (id) { var el = doc.getElementById(id); SEC[id] = { el: el, top: sectionTop(el), h: el.offsetHeight }; });
    MAXY = Math.max(1, doc.documentElement.scrollHeight - VH);
    var POSE = isMobile() ? POSE_M : POSE_D;
    keysPose = []; keysS = [];
    IDS.forEach(function (id, i) {
      var s = SEC[id], a = s.top - VH * .35, b = Math.max(a + 1, s.top + s.h - VH * .65);
      if (i === 0) { a = -1e5; b = Math.max(1, s.h * .35); }
      keysPose.push([a, POSE[id]], [b, POSE[id]]);
      var sa = s.top, sb = Math.max(sa + 1, s.top + s.h - VH);
      if (i === 0) sa = -1e5;
      keysS.push([sa, SEASON[id][0]], [sb, SEASON[id][1]]);
    });
    if (map) map.layout();
    trackW = track ? track.scrollWidth : 0;
  }
  function interp(keys, y, out) {
    var n = keys.length;
    if (y <= keys[0][0]) return keys[0][1];
    for (var i = 0; i < n - 1; i++) {
      var A = keys[i], B = keys[i + 1];
      if (y <= B[0]) {
        var t = (y - A[0]) / Math.max(1, B[0] - A[0]); t = t * t * (3 - 2 * t);
        if (typeof A[1] === "number") return lerp(A[1], B[1], t);
        for (var j = 0; j < A[1].length; j++) out[j] = lerp(A[1][j], B[1][j], t);
        return out;
      }
    }
    return keys[n - 1][1];
  }
  function currentSection() {
    var y = scrollY() + VH * .45, cur = "home";
    IDS.forEach(function (id) { if (SEC[id] && y >= SEC[id].top) cur = id; });
    return NAV_OF[cur] || cur;
  }

  /* ---------- tree ---------- */
  var canvas = $("#tree");
  var tree = new window.EPTree(canvas, { mobile: isMobile(), reduced: reduced, seed: 1914 });
  var st = tree.state;
  if (!animated) { st.G = 1; st.seed = 1; }

  /* ---------- map ---------- */
  var map = new window.EPMap($("#map"));
  var landPhoto = $(".land-photo"), mapSvg = $("#map");

  /* ---------- season colours ---------- */
  var PAPER = [hex("#e9ebe4"), hex("#f1efdf"), hex("#f4ecd8"), hex("#f2e3c8")];
  var ACCENT = [hex("#4a6273"), hex("#5a7a28"), hex("#43612a"), hex("#8c521c")];
  function cyc(arr, s) { var m = ((s % 4) + 4) % 4, i = Math.floor(m), f = m - i, e = f * f * (3 - 2 * f); return mixc(arr[i], arr[(i + 1) % 4], smooth(.55, 1, f) * 1 + 0 * e); }
  var lastPaper = "", lastAccent = "";

  /* ---------- sky: one day passes while you scroll ---------- */
  var sky = $(".sky");
  var DAY = [[0, [246, 206, 178], .30], [.14, [250, 232, 196], .16], [.42, [255, 255, 255], 0], [.7, [244, 190, 104], .2], [.84, [236, 150, 92], .26], [1, [236, 150, 92], .2]];
  function dayTint(p) {
    for (var i = 0; i < DAY.length - 1; i++) if (p <= DAY[i + 1][0]) { var t = (p - DAY[i][0]) / (DAY[i + 1][0] - DAY[i][0]); return [mixc(DAY[i][1], DAY[i + 1][1], t), lerp(DAY[i][2], DAY[i + 1][2], t)]; }
    return [DAY[DAY.length - 1][1], DAY[DAY.length - 1][2]];
  }
  var lastSky = "";

  /* ---------- per-frame update ---------- */
  var pose = [0, 0, 0, 0], lastT = 0, seasonForSound = -1, activeId = "", yearArts = $$(".season"), track = $(".track"), trackW = 0;
  var dialNeedle = $(".dial-needle"), yearBar = $(".year-progress i");
  function update(time) {
    var t = time, dt = Math.min(.05, lastT ? t - lastT : .016); lastT = t;
    var y = scrollY();
    // pose & season
    interp(keysPose, y, pose);
    var unit = isMobile() ? Math.min(VH * .62, VW * 1.15) : Math.min(VH * .78, VW * .62);
    st.x = pose[0] * VW; st.base = pose[1] * VH - (y < SEC.values.top ? Math.max(0, y) : 0); st.H = pose[2] * unit; st.alpha = pose[3]; st.sx = isMobile() ? .8 : 1;
    var yr = SEC.year;
    st.s = interp(keysS, y);
    // the orchard at rest + dusk
    var rest = SEC.rest, con = SEC.contact;
    st.O = smooth(rest.top - VH * .75, rest.top + Math.min(VH * .3, rest.h - VH), y);
    var dusk = smooth(con.top - VH * .7, con.top - VH * .05, y);
    st.dusk = dusk;
    body.classList.toggle("dusk", dusk > .5);
    // wind from scroll speed
    var v = lenis ? Math.abs(lenis.velocity || 0) : 0;
    st.wind = lerp(st.wind, 1 + Math.min(1.6, v * .05), .08);
    // colours
    var paper = css(cyc(PAPER, st.s)), accent = css(cyc(ACCENT, st.s));
    if (paper !== lastPaper) { root.style.setProperty("--paper", paper); lastPaper = paper; }
    if (accent !== lastAccent) { root.style.setProperty("--accent", accent); lastAccent = accent; }
    var p = clamp(y / MAXY, 0, 1), dt2 = dayTint(p);
    var skyCss = "linear-gradient(180deg, rgba(20,26,40," + (dusk * .93).toFixed(3) + "), rgba(44,36,46," + (dusk * .9).toFixed(3) + ") 70%, rgba(58,42,36," + (dusk * .88).toFixed(3) + ")), linear-gradient(180deg, rgba(" + dt2[0].join(",") + "," + dt2[1].toFixed(3) + "), rgba(" + dt2[0].join(",") + ",0) 65%)";
    if (skyCss !== lastSky) { sky.style.background = skyCss; lastSky = skyCss; }
    // land: map zoom then the real photo
    var ld = SEC.land, pL = clamp((y - ld.top) / Math.max(1, ld.h - VH), 0, 1);
    var mp = pL < .1 ? 0 : pL < .33 ? smooth(.1, .33, pL) : pL < .38 ? 1 : pL < .58 ? 1 + smooth(.38, .58, pL) : pL < .63 ? 2 : 2 + smooth(.63, .84, pL);
    if (reduced) mp = Math.round(mp);
    map.set(mp);
    var ph = smooth(.8, .9, pL);
    landPhoto.style.opacity = ph; landPhoto.style.visibility = ph > 0 ? "visible" : "hidden";
    mapSvg.style.opacity = 1 - ph;
    if (animated) landPhoto.style.transform = "scale(" + (1.12 - .12 * smooth(.8, 1, pL)) + ")";
    // year
    var pY = clamp((y - yr.top) / Math.max(1, yr.h - VH), 0, 1);
    if (animated) {
      for (var i = 0; i < yearArts.length; i++) {
        var q = pY * 4 - i, o = (i === 0 ? 1 : smooth(0, .1, q)) * (i === 3 ? 1 : 1 - smooth(.9, 1, q));
        var el = yearArts[i];
        el.style.opacity = o.toFixed(3); el.style.visibility = o > .01 ? "visible" : "hidden";
        el.style.transform = (isMobile() ? "" : "translateY(-50%) ") + "translateY(" + ((1 - o) * (q < .5 ? 30 : -30)).toFixed(1) + "px)";
        var nm = el.querySelector(".s-name"); if (nm) nm.style.setProperty("--wght", (240 + 380 * clamp(q, 0, 1)).toFixed(0));
        var soft = i === 3 ? 100 : 30 + 20 * i; if (nm) nm.style.setProperty("--soft", soft);
      }
      yearBar.style.transform = "scaleX(" + pY.toFixed(4) + ")";
      dialNeedle.style.transform = "rotate(" + ((5 + pY * 12) / 12 * 360).toFixed(2) + "deg)";
    }
    // harvest: horizontal track
    if (animated && track) {
      var hv = SEC.harvest, pH = clamp((y - hv.top - VH * .1) / Math.max(1, hv.h - VH * 1.2), 0, 1);
      var e = pH < .5 ? 4 * pH * pH * pH : 1 - Math.pow(-2 * pH + 2, 3) / 2;
      track.style.transform = "translate3d(" + (-(trackW - VW + (isMobile() ? 0 : 60)) * (pH * .35 + e * .65)).toFixed(1) + "px,0,0)";
    }
    // active nav
    var cur = currentSection();
    if (cur !== activeId) setActive(cur);
    // sound follows the season
    if (Math.abs(st.s - seasonForSound) > .05) { seasonForSound = st.s; sound.setSeason(st.s); }
    // cursor
    moveCursor();
    // draw
    if (!doc.hidden) tree.frame(dt, t);
  }

  /* ---------- navigation ---------- */
  var navLinks = $$("[data-nav]"), dots = $$(".dock-strip i");
  function setActive(id) {
    activeId = id;
    navLinks.forEach(function (a) { var on = a.dataset.nav === id; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    var idx = NAV.indexOf(id); dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
  }
  navLinks.forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); var inDrawer = drawer.classList.contains("open"); closeDrawer(); setTimeout(function () { goTo(a.dataset.nav); }, inDrawer ? 120 : 0); if (a.closest(".dock")) a.blur(); });
  });
  // dock: opens when the cursor comes near the right edge; items magnify like the macOS Dock
  var dock = $(".dock"), dockList = $(".dock-list"), dockItems = $$(".dock-list li"), dockOpen = false, dockFocus = false;
  function setDock(o) { if (o === dockOpen) return; dockOpen = o; dock.classList.toggle("open", o); if (!o) dockItems.forEach(function (li) { li.style.setProperty("--m", 1); }); }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || isMobile()) return;
    var near = e.clientX > VW - (dockOpen ? 320 : 90) && Math.abs(e.clientY - VH / 2) < (dockOpen ? VH * .45 : 300);
    setDock(near || dockFocus);
    if (dockOpen) dockItems.forEach(function (li) {
      var r = li.getBoundingClientRect(), cy = r.top + r.height / 2, d = e.clientY - cy;
      li.style.setProperty("--m", (1 + .36 * Math.exp(-(d * d) / (2 * 46 * 46))).toFixed(3));
    });
  }, { passive: true });
  dock.addEventListener("focusin", function () { dockFocus = true; setDock(true); });
  dock.addEventListener("focusout", function () { dockFocus = false; setTimeout(function () { if (!dock.contains(doc.activeElement)) setDock(false); }, 50); });

  // mobile: a tab on the right edge slides the drawer out (tap or swipe)
  var tab = $(".tab"), drawer = $("#drawer"), scrim = $(".drawer-scrim");
  function openDrawer() {
    drawer.hidden = false; scrim.hidden = false; tab.setAttribute("aria-expanded", "true");
    requestAnimationFrame(function () { drawer.classList.add("open"); scrim.classList.add("open"); });
    if (lenis) lenis.stop();
    setTimeout(function () { var a = drawer.querySelector("a.on") || drawer.querySelector("a"); a && a.focus({ preventScroll: true }); }, 300);
  }
  function closeDrawer() {
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open"); scrim.classList.remove("open"); tab.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
    setTimeout(function () { drawer.hidden = true; scrim.hidden = true; }, 600);
  }
  tab.addEventListener("click", function () { drawer.classList.contains("open") ? closeDrawer() : openDrawer(); });
  scrim.addEventListener("click", closeDrawer);
  var tx0 = null;
  tab.addEventListener("touchstart", function (e) { tx0 = e.touches[0].clientX; }, { passive: true });
  tab.addEventListener("touchmove", function (e) { if (tx0 != null && tx0 - e.touches[0].clientX > 24) { tx0 = null; openDrawer(); } }, { passive: true });
  var dx0 = null;
  drawer.addEventListener("touchstart", function (e) { dx0 = e.touches[0].clientX; }, { passive: true });
  drawer.addEventListener("touchmove", function (e) {
    if (dx0 == null) return; var d = e.touches[0].clientX - dx0;
    if (d > 0) drawer.style.transform = "translateX(" + d + "px)";
  }, { passive: true });
  drawer.addEventListener("touchend", function (e) {
    var d = e.changedTouches[0].clientX - (dx0 || 0); dx0 = null; drawer.style.transform = "";
    if (d > 70) closeDrawer();
  });

  /* ---------- language + sound controls ---------- */
  var sound = new window.EPSound();
  function soundLabel() {
    $$(".sound").forEach(function (b) { b.setAttribute("aria-pressed", String(sound.on)); var l = b.querySelector(".sound-label"); if (l) l.textContent = tr(sound.on ? "ui.sound.on" : "ui.sound.off"); });
  }
  doc.addEventListener("click", function (e) {
    var lb = e.target.closest("[data-lang]"); if (lb) { setLang(lb.dataset.lang); return; }
    var sb = e.target.closest(".sound"); if (sb) { sound.toggle(); sound.setSeason(st.s); soundLabel(); return; }
    var cp = e.target.closest(".copy"); if (cp) {
      var txt = cp.dataset.copy;
      var pr; try { pr = navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject(); } catch (er) { pr = Promise.reject(er); }
      pr.then(function () { cp.textContent = tr("ui.copied"); setTimeout(function () { cp.textContent = tr("ui.copy"); }, 1600); }, function () {});
    }
  });

  /* ---------- toast ---------- */
  var toastEl = $(".toast"), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2600); }

  /* ---------- the tree: wind from the cursor, catching pecans, easter eggs ---------- */
  var px = -999, py = -999, lpx = 0, lpy = 0;
  window.addEventListener("pointermove", function (e) {
    var sp = Math.sqrt((e.clientX - lpx) * (e.clientX - lpx) + (e.clientY - lpy) * (e.clientY - lpy));
    lpx = e.clientX; lpy = e.clientY; px = e.clientX; py = e.clientY;
    tree.pointer(px, py, Math.min(sp, 80) * (e.pointerType === "touch" ? 2.4 : 1));
  }, { passive: true });
  window.addEventListener("touchmove", function (e) { var t0 = e.touches[0]; tree.pointer(t0.clientX, t0.clientY, 30); }, { passive: true });
  var trunkHits = [];
  window.addEventListener("pointerdown", function (e) {
    if (e.target.closest("a,button,input,textarea,label,form,.dock,.drawer,.tab,.viewer,.legal-dlg,.wall")) return;
    if (tree.catchAt(e.clientX, e.clientY)) {
      sound.crack();
      toast(tr(tree.caught === 1 ? "ui.caught" : "ui.caughtN").replace("{n}", num(tree.caught)));
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (er) {}
      return;
    }
    if (tree.trunkAt(e.clientX, e.clientY)) {
      var now = performance.now(); trunkHits.push(now); trunkHits = trunkHits.filter(function (h) { return now - h < 1400; });
      if (trunkHits.length >= 3) { trunkHits = []; tree.callBird(); sound.chirpHello(); toast(tr("ui.hummingbird")); }
    }
  });
  var typed = "";
  window.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input,textarea")) return;
    if (e.key && e.key.length === 1) { typed = (typed + e.key.toLowerCase()).slice(-12); if (/(pecan|pecã|pecana|noz)$/.test(typed)) { tree.rain(36); toast(tr("ui.rain")); typed = ""; } }
    if (e.key === "Escape") { closeDrawer(); closeViewer(); closeLegal(); }
  });

  /* ---------- custom cursor ---------- */
  var cursor = $(".cursor"), cDot = $(".c-dot"), cRing = $(".c-ring"), cLabel = $(".c-label"), cx = -100, cy = -100, rx = -100, ry = -100;
  var useCursor = false; // native pointer: always exactly in time
  if (useCursor) root.classList.add("has-cursor");
  var hoverEl = null;
  doc.addEventListener("pointerover", function (e) { hoverEl = e.target; });
  // the cursor is positioned straight from the mouse event (no easing, no waiting for the animation frame)
  function placeCursor(x, y) {
    if (!useCursor) return;
    var t = "translate3d(" + x + "px," + y + "px,0)";
    cDot.style.transform = t; cRing.style.transform = t;
    cLabel.style.transform = t + " translate(-50%,-50%)";
  }
  if (useCursor) window.addEventListener("pointermove", function (e) { placeCursor(e.clientX, e.clientY); }, { passive: true });
  var lastCatch = false;
  function moveCursor() {
    if (!useCursor) {
      var c = finePointer && tree.nutAt(px, py) >= 0;
      if (c !== lastCatch) { lastCatch = c; body.style.cursor = c ? "pointer" : ""; }
      return;
    }
    var mode = "";
    if (hoverEl && hoverEl.closest) {
      if (hoverEl.closest(".wall") && !hoverEl.closest(".frame-btn")) mode = "drag";
      else if (hoverEl.closest("a,button,.frame-btn,[data-lang]")) mode = "link";
    }
    if (!mode && tree.nutAt(px, py) >= 0) mode = "catch";
    if (cursor.dataset.mode !== mode) {
      cursor.dataset.mode = mode; cursor.className = "cursor " + mode;
      cLabel.textContent = mode === "catch" ? "✦" : mode === "drag" ? tr("ui.drag") : "";
    }
  }

  /* ---------- gallery: drag wall + full-screen viewer ---------- */
  var wall = $(".wall"), dragging = false, dragX = 0, dragS = 0, moved = 0;
  wall.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; dragging = true; moved = 0; dragX = e.clientX; dragS = wall.scrollLeft; wall.classList.add("dragging"); });
  window.addEventListener("pointermove", function (e) { if (!dragging) return; var d = e.clientX - dragX; moved = Math.max(moved, Math.abs(d)); wall.scrollLeft = dragS - d; }, { passive: true });
  window.addEventListener("pointerup", function () { if (dragging) { dragging = false; wall.classList.remove("dragging"); } });
  wall.addEventListener("click", function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  var PHOTOS = [{ img: "aerial", cap: "gallery.1" }, { img: "orchard", cap: "gallery.2" }];
  var viewer = $(".viewer"), vImg = $(".viewer-fig img"), vCap = $(".viewer-fig figcaption"), vCount = $(".v-count"), vIdx = 0, vReturn = null;
  function showPhoto(i) {
    vIdx = (i + PHOTOS.length) % PHOTOS.length;
    var ph = PHOTOS[vIdx];
    vImg.style.animation = "none"; void vImg.offsetWidth; vImg.style.animation = "";
    vImg.src = IMG[ph.img] || ""; vImg.alt = plain(tr(ph.cap)); vCap.textContent = plain(tr(ph.cap));
    vCount.textContent = (vIdx + 1) + " / " + PHOTOS.length;
    if (hasGsap && !reduced) gsap.fromTo(vImg, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .7, ease: "expo.out" });
  }
  function openViewer(i) { vReturn = doc.activeElement; viewer.hidden = false; showPhoto(i); if (lenis) lenis.stop(); $(".v-close").focus(); }
  function closeViewer() { if (viewer.hidden) return; viewer.hidden = true; if (lenis) lenis.start(); if (vReturn) vReturn.focus({ preventScroll: true }); }
  $$(".frame-btn").forEach(function (b) { b.addEventListener("click", function () { openViewer(+b.dataset.i); }); });
  $(".v-prev").addEventListener("click", function () { showPhoto(vIdx - 1); });
  $(".v-next").addEventListener("click", function () { showPhoto(vIdx + 1); });
  $(".v-close").addEventListener("click", closeViewer);
  viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
  viewer.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") showPhoto(vIdx - 1);
    if (e.key === "ArrowRight") showPhoto(vIdx + 1);
    if (e.key === "Tab") { var f = $$(".v-btn", viewer), first = f[0], last = f[f.length - 1]; if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  var sx0 = null;
  viewer.addEventListener("touchstart", function (e) { sx0 = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", function (e) { if (sx0 == null) return; var d = e.changedTouches[0].clientX - sx0; sx0 = null; if (Math.abs(d) > 50) showPhoto(vIdx + (d < 0 ? 1 : -1)); });

  /* ---------- legal placeholders ---------- */
  var legal = $(".legal-dlg"), legalRet = null;
  $$(".legal-btn").forEach(function (b) { b.addEventListener("click", function () { legalRet = b; $("#legal-h").textContent = b.textContent; legal.hidden = false; $(".legal-close").focus(); }); });
  function closeLegal() { if (legal.hidden) return; legal.hidden = true; if (legalRet) legalRet.focus(); }
  $(".legal-close").addEventListener("click", closeLegal);
  legal.addEventListener("click", function (e) { if (e.target === legal) closeLegal(); });

  /* ---------- reveals, counters, scene playback ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var el = en.target;
      if (el.classList.contains("scene")) { el.classList.toggle("play", en.isIntersecting); return; }
      if (el.classList.contains("card")) { el.classList.toggle("play", en.isIntersecting); if (en.isIntersecting && el.querySelector(".expand")) growExpand(); if (!el.classList.contains("in")) el.classList.add("in"); return; }
      if (!en.isIntersecting) return;
      if (el.classList.contains("reveal")) { el.classList.add("in"); io.unobserve(el); }
      if (el.classList.contains("split") && animated && !el.dataset.seen) {
        el.dataset.seen = "1";
        gsap.fromTo(el.querySelectorAll(".w > span"), { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, duration: 1.25, ease: "expo.out", stagger: .045, onComplete: function () { el.classList.add("done"); } });
        gsap.fromTo(el, { "--wght": 220 }, { "--wght": 360, duration: 1.8, ease: "power2.out" });
        io.unobserve(el);
      }
      if (el.classList.contains("count") && el.dataset.to && !el.dataset.seen) {
        el.dataset.seen = "1"; var to = +el.dataset.to;
        if (!animated) { el.textContent = num(to); return; }
        var o = { v: 0 };
        gsap.to(o, { v: to, duration: 2.4, ease: "expo.out", onUpdate: function () { el.textContent = num(Math.round(o.v)); } });
        gsap.fromTo(el, { "--wght": 200 }, { "--wght": 320, duration: 2.4, ease: "expo.out" });
        io.unobserve(el);
      }
    });
  }, { threshold: .2, rootMargin: "0px 0px -8% 0px" });

  /* ---------- +200 ha: today's land, then the planned expansion ---------- */
  var expandSvg = $(".expand"), expandDone = false;
  (function buildExpand() {
    var NS = "http://www.w3.org/2000/svg", cols = 20, size = 8.4, gap = 1.4, x0 = (200 - cols * (size + gap)) / 2, y0 = 4;
    for (var i = 0; i < 272; i++) {
      var r = doc.createElementNS(NS, "rect"), c = i % cols, row = Math.floor(i / cols);
      r.setAttribute("x", (x0 + c * (size + gap)).toFixed(1)); r.setAttribute("y", (y0 + row * (size + gap)).toFixed(1));
      r.setAttribute("width", size); r.setAttribute("height", size); r.setAttribute("rx", 1.6);
      r.setAttribute("class", i < 72 ? "on" : "off"); if (animated) r.style.opacity = 0; expandSvg.appendChild(r);
    }
  })();
  function growExpand() {
    if (expandDone || !animated) return; expandDone = true;
    var rs = expandSvg.querySelectorAll("rect");
    gsap.to(rs, { opacity: function (i) { return i < 72 ? .9 : .55; }, duration: .25, stagger: { each: .006 }, ease: "none" });
  }

  /* ---------- contact form: posts to the farm's inbox only on the real domain ---------- */
  var form = $(".msg"), note = $(".msg-note");
  form.addEventListener("submit", function (e) {
    var ok = form.checkValidity();
    if (!ok) { e.preventDefault(); form.reportValidity(); return; }
    if (!/(^|\.)elporvenir\.farm$/.test(location.hostname)) { e.preventDefault(); note.textContent = tr("contact.form.preview"); return; }
    note.textContent = tr("contact.form.sending");
  });

  /* ---------- dial ---------- */
  (function buildDial() {
    var NS = "http://www.w3.org/2000/svg", arcs = $(".dial-arcs"), months = $(".dial-months");
    var cols = ["#4a6273", "#5a7a28", "#43612a", "#8c521c"], starts = [5, 8, 11, 2];
    starts.forEach(function (m, i) {
      var a0 = (m / 12) * Math.PI * 2 - Math.PI / 2 + .06, a1 = ((m + 3) / 12) * Math.PI * 2 - Math.PI / 2 - .06, r = 52;
      var p = doc.createElementNS(NS, "path");
      p.setAttribute("d", "M" + Math.cos(a0) * r + " " + Math.sin(a0) * r + " A" + r + " " + r + " 0 0 1 " + Math.cos(a1) * r + " " + Math.sin(a1) * r);
      p.setAttribute("class", "arc"); p.setAttribute("stroke", cols[i]); arcs.appendChild(p);
    });
    for (var m = 0; m < 12; m++) {
      var a = (m + .5) / 12 * Math.PI * 2 - Math.PI / 2, t = doc.createElementNS(NS, "text");
      t.setAttribute("x", Math.cos(a) * 40); t.setAttribute("y", Math.sin(a) * 40); t.setAttribute("class", "mtxt"); t.dataset.m = m; months.appendChild(t);
    }
  })();
  function dialLabels() { var ms = tr("year.months").split(","); $$(".mtxt").forEach(function (t) { t.textContent = ms[+t.dataset.m]; }); }

  /* ---------- hero intro: a seed falls, cracks, and the tree grows ---------- */
  function intro() {
    var wm = $(".wm-p");
    wm.innerHTML = wm.textContent.split("").map(function (c) { return '<span class="ch">' + c + "</span>"; }).join("");
    $(".hero-line").dataset.seen = "1";
    if (!animated) { $(".hero-line").classList.add("done"); return; }
    var tl = gsap.timeline({ delay: .2 });
    tl.from(".wordmark .ch", { yPercent: 70, opacity: 0, duration: 1.6, ease: "expo.out", stagger: .06 }, 0)
      .from(".wm-el", { opacity: 0, x: -20, duration: 1.4, ease: "expo.out" }, .3)
      .fromTo(".wordmark", { "--wght": 200 }, { "--wght": 300, duration: 3, ease: "power1.out" }, 0)
      .from(".hero-top > *", { opacity: 0, y: 14, duration: 1.2, ease: "expo.out", stagger: .12 }, .5)
      .to(st, { seed: 1, duration: 1.6, ease: "none" }, .4)
      .to(st, { G: 1, duration: 4.6, ease: "power2.inOut" }, 2.0)
      .fromTo(".hero-line .w > span", { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, duration: 1.3, ease: "expo.out", stagger: .04, onComplete: function () { $(".hero-line").classList.add("done"); } }, 3.6)
      .from(".scroll-hint", { opacity: 0, duration: 1 }, 5.2);
  }

  /* ---------- boot ---------- */
  render(); dialLabels();
  measure();
  $$(".reveal,.split,.count,.scene,.card").forEach(function (el) { if (!el.closest(".hero")) io.observe(el); });
  intro();
  var _render = render; render = function () { _render(); dialLabels(); };
  if (hasGsap) {
    gsap.ticker.add(function (time) { if (lenis) lenis.raf(time * 1000); update(time); });
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener("refresh", measure);
  } else {
    (function loop(ts) { update(ts / 1000); requestAnimationFrame(loop); })(0);
  }
  var rT;
  window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(function () { tree.mobile = isMobile(); tree.resize(); measure(); if (hasGsap) ScrollTrigger.refresh(); }, 150); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { measure(); if (hasGsap) ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { measure(); if (location.hash && doc.getElementById(location.hash.slice(1))) setTimeout(function () { goTo(location.hash.slice(1)); }, 300); });
  $(".yr").textContent = new Date().getFullYear();

  window.__ep = { lenis: lenis, goTo: goTo, tree: tree, jump: jump, SEC: SEC };
  // a note for the curious
  try { console.log("%cEl Porvenir", "font: 300 32px Fraunces, serif; color:#43612a", "\nThe tree has secrets. Knock on its trunk three times, or type “pecan”.\nA árvore tem segredos. / El árbol tiene secretos."); } catch (e) {}
})();
