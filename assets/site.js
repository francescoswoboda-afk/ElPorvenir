(function () {
  "use strict";

  /* ---------------- translations ---------------- */
  var es = {
    "skip": "Ir al contenido",
    "nav.land": "La tierra",
    "nav.story": "Nuestra historia",
    "nav.pecans": "Pecanas",
    "nav.contact": "Contáctanos",
    "menu": "Menú",
    "hero.pos": "sustantivo",
    "hero.def": "el futuro; lo que está por venir.",
    "hero.t1": "Sembramos",
    "hero.t2": "para el futuro.",
    "hero.sub": "Una finca familiar de pecanas en las colinas de Monte Alverne, en el sur de Brasil. Más de veinte años en la agricultura y, desde 2014, una pasión por los frutos secos.",
    "hero.cta1": "Descubre nuestras pecanas",
    "hero.cta2": "Recorre la finca",
    "mq": "Desde 2014 · 72 hectáreas · 35 con pecanos · 4 variedades seleccionadas · Sin deforestación · Abejas en el huerto · ",
    "land.eyebrow": "La tierra",
    "land.title": "Mitad huerto.<br /><em>Mitad naturaleza.</em>",
    "land.p1": "De nuestras 72 hectáreas, 35 están plantadas con pecanos. El resto se conserva: bosque nativo, agua y campo abierto que protegen el entorno natural alrededor del huerto.",
    "land.p2": "Cada cuadrado de este mapa es una hectárea de El Porvenir.",
    "land.leg1": "Huerto de pecanos",
    "land.leg2": "Tierra conservada",
    "stat1": "hectáreas de tierra",
    "stat2": "hectáreas de pecanos",
    "stat3": "variedades, elegidas tras años de pruebas en el campo",
    "stat4": "hectáreas en nuestro plan de expansión a largo plazo",
    "story.eyebrow": "Nuestra historia",
    "story.title": "Antes del primer árbol,<br /><em>estudiamos la tierra.</em>",
    "ch1.t": "Meses de investigación",
    "ch1.p": "Antes de plantar nada, pasamos meses estudiando las regiones donde un huerto de pecanos podría crecer en las mejores condiciones.",
    "ch2.t": "Una tierra sin desmonte",
    "ch2.p": "Elegimos una tierra que no requería deforestación, en Monte Alverne, cerca de Santa Cruz do Sul, donde el suelo y el clima favorecen a los pecanos.",
    "ch3.t": "Cuatro variedades",
    "ch3.p": "Tras años de estudio y pruebas en el campo, seleccionamos cuatro variedades por su adaptabilidad, productividad y resistencia a enfermedades y plagas.",
    "ch4.t": "Flores para las abejas",
    "ch4.p": "Plantas con flores crecen en todo el campo para apoyar a las abejas y la polinización, y para dar más vida al huerto.",
    "ch5.t": "Lo próximo: nuestra miel",
    "ch5.p": "A medida que el proyecto crece, El Porvenir planea producir su propia miel cruda, directamente de la finca.",
    "val.eyebrow": "Lo que defendemos",
    "v1.t": "Respeto por la naturaleza",
    "v1.p": "Trabajamos con el medio ambiente, protegiendo y mejorando lo que la naturaleza nos da.",
    "v2.t": "Familia y comunidad",
    "v2.p": "La finca apoya a las familias locales y crece junto a su comunidad.",
    "v3.t": "Sostenibilidad",
    "v3.p": "No es solo una meta. Es nuestra forma de cultivar, todos los días.",
    "v4.t": "Calidad e integridad",
    "v4.p": "Honestos, transparentes y comprometidos con la excelencia en todo lo que hacemos.",
    "pec.eyebrow": "La pecana",
    "pec.title": "Cosecha del año.<br /><em>Seleccionadas a mano.</em>",
    "pec.p": "Frescas, crujientes y llenas de sabor natural: pecanas brasileñas crudas, cultivadas con responsabilidad por una familia que piensa quedarse aquí por generaciones.",
    "forms.title": "Cinco formas de disfrutarlas",
    "f1.t": "Mitades mammoth",
    "f1.p": "Mitades extra grandes con un sabor rico y mantecoso.",
    "f2.t": "Mitades junior mammoth",
    "f2.p": "Del tamaño perfecto para picar y para recetas.",
    "f3.t": "Granulado",
    "f3.p": "Finamente picadas, para repostería y coberturas.",
    "f4.t": "Harina",
    "f4.p": "Finamente molidas, para recetas saludables y sin gluten.",
    "f5.t": "Nueces enteras",
    "f5.p": "Con cáscara, naturales y listas para ti.",
    "nut.head": "Información nutricional",
    "nut.serv": "Por porción de 28 g",
    "nut.cal": "Calorías",
    "nut.fat": "Grasas, sobre todo monoinsaturadas",
    "nut.pro": "Proteínas",
    "nut.fib": "Fibra",
    "nut.vit": "También aporta",
    "nut.vitv": "Vitamina E",
    "nut.title": "Fruto pequeño.<br /><em>Gran nutrición.</em>",
    "nut.p": "Las pecanas son naturalmente ricas en grasas saludables, fibra, proteína vegetal, vitaminas y minerales, con mucha energía en cada puñado: unas 690 calorías por cada 100 g.",
    "nut.cta": "Consulta por venta mayorista",
    "con.eyebrow": "Contáctanos",
    "con.title": "Cultivemos algo<br /><em>juntos.</em>",
    "con.p": "¿Preguntas sobre la finca, nuestras pecanas o una colaboración? Siempre estamos abiertos a conversaciones que compartan nuestros valores.",
    "con.mail": "Correo",
    "con.where": "La finca",
    "f.name": "Nombre completo",
    "f.email": "Correo electrónico",
    "f.subject": "Asunto",
    "f.msg": "Mensaje",
    "f.send": "Enviar mensaje",
    "foot.p": "Cultivamos para hoy, con respeto por el mañana."
  };
  var titles = {
    en: document.title,
    es: "El Porvenir Farm | Finca sostenible de pecanas en Brasil"
  };

  var textNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var htmlNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-html]"));
  textNodes.forEach(function (n) { n.dataset.en = n.textContent; });
  htmlNodes.forEach(function (n) { n.dataset.en = n.innerHTML; });

  function setLang(lang) {
    textNodes.forEach(function (n) {
      var k = n.getAttribute("data-i18n");
      n.textContent = lang === "es" && es[k] ? es[k] : n.dataset.en;
    });
    htmlNodes.forEach(function (n) {
      var k = n.getAttribute("data-i18n-html");
      n.innerHTML = lang === "es" && es[k] ? es[k] : n.dataset.en;
    });
    document.documentElement.lang = lang;
    document.title = titles[lang];
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    try { localStorage.setItem("ep-lang", lang); } catch (e) {}
  }

  // add a language switch inside the mobile menu
  var mobileNav = document.getElementById("mobile-nav");
  var langClone = document.querySelector(".lang").cloneNode(true);
  langClone.style.display = "flex";
  langClone.style.alignSelf = "flex-start";
  langClone.style.marginTop = "24px";
  langClone.style.color = "var(--cream)";
  mobileNav.appendChild(langClone);

  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });
  var saved = null;
  try { saved = localStorage.getItem("ep-lang"); } catch (e) {}
  if (saved === "es" || (!saved && /^es\b/i.test(navigator.language || ""))) setLang("es");

  /* ---------------- header ---------------- */
  var top = document.getElementById("top");
  var hero = document.getElementById("hero");
  function onScroll() {
    top.classList.toggle("solid", window.scrollY > hero.offsetHeight - 90);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = document.querySelector(".menu-btn");
  function closeMenu() {
    menuBtn.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
    top.style.color = "";
    document.body.style.overflow = "";
  }
  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(open));
    mobileNav.hidden = !open;
    top.style.color = open ? "var(--cream)" : "";
    top.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileNav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  // highlight current section in the nav
  var navLinks = document.querySelectorAll(".nav a");
  var sections = ["land", "story", "pecans", "contact"].map(function (id) { return document.getElementById(id); });
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { secObs.observe(s); });
  }

  /* ---------------- hectare map ---------------- */
  var grid = document.getElementById("hectares");
  var cols = 9, rows = 8, total = 72, planted = 35;
  // pick the 35 cells closest to an off-centre point, so the orchard reads as one block
  var cells = [];
  for (var i = 0; i < total; i++) {
    var x = i % cols, y = Math.floor(i / cols);
    var d = Math.hypot((x - 5.6) * 1.0, (y - 3.2) * 1.15) + ((i * 37) % 11) / 22;
    cells.push({ i: i, d: d });
  }
  var pecanSet = {};
  cells.slice().sort(function (a, b) { return a.d - b.d; }).slice(0, planted).forEach(function (c) { pecanSet[c.i] = true; });
  for (var j = 0; j < total; j++) {
    var el = document.createElement("span");
    el.className = "ha " + (pecanSet[j] ? "pecan" : "wild");
    el.style.transitionDelay = (pecanSet[j] ? 0.25 : 0) + (j % cols) * 0.035 + Math.floor(j / cols) * 0.05 + "s";
    grid.appendChild(el);
  }

  /* ---------------- reveal + counters ---------------- */
  function countUp(el) {
    var to = +el.dataset.to, prefix = el.dataset.prefix || "", start = null, dur = 1600;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = prefix + Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduce) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".count").forEach(function (c) { c.textContent = (c.dataset.prefix || "") + c.dataset.to; });
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        var c = e.target.querySelector(".count");
        if (c) countUp(c);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el, k) {
      if (el.parentElement && el.parentElement.children.length > 1) {
        var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.transitionDelay = Math.min(idx, 5) * 0.08 + "s";
      }
      obs.observe(el);
    });
  }

  /* ---------------- contact form ---------------- */
  var form = document.querySelector(".contact-form");
  var note = form.querySelector(".form-note");
  var live = /(^|\.)elporvenir\.farm$/.test(location.hostname);
  form.addEventListener("submit", function (e) {
    if (!live) {
      e.preventDefault();
      note.textContent = document.documentElement.lang === "es"
        ? "Esta es una vista previa: el formulario se enviará cuando el sitio esté publicado."
        : "This is a preview: the form will send once the site is live.";
    }
  });

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
