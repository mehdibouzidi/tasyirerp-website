/* Tasyir ERP — menu mobile et formulaire de demande de démo. Aucun traceur. */
(function () {
  "use strict";

  /* Année du pied de page */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Menu mobile */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    var label = toggle.querySelector(".sr-only");
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Fermer le menu" : "Ouvrir le menu";
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.querySelectorAll(".nav__menu a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (m) {
      if (m.matches) setOpen(false);
    });
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Thème clair / sombre */
  var root = document.documentElement;
  var themeBtn = document.querySelector("[data-theme-toggle]");
  var darkMq = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() {
    var t = root.getAttribute("data-theme");
    return t ? t === "dark" : darkMq.matches;
  }
  function syncTheme() {
    if (!themeBtn) return;
    var d = isDark();
    themeBtn.setAttribute("aria-pressed", d ? "true" : "false");
    var l = themeBtn.querySelector(".sr-only");
    if (l) l.textContent = d ? "Activer le thème clair" : "Activer le thème sombre";
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncTheme();
    });
    darkMq.addEventListener("change", syncTheme);
    syncTheme();
  }

  /* La phrase qui s'allume mot à mot au défilement */
  var stmt = document.querySelector("[data-highlight]");
  if (stmt && !reduced) {
    var walker = document.createTreeWalker(stmt, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var sp = document.createElement("span");
        sp.className = "w";
        sp.textContent = part;
        frag.appendChild(sp);
      });
      n.parentNode.replaceChild(frag, n);
    });
    var words = stmt.querySelectorAll(".w");
    var last = -1, ticking = false;
    var update = function () {
      ticking = false;
      var r = stmt.getBoundingClientRect(), vh = window.innerHeight;
      var start = vh * 0.85, end = vh * 0.45;
      var t = (start - r.top) / Math.max(1, (start - end) + r.height);
      t = Math.min(1, Math.max(0, t));
      var k = Math.round(t * words.length);
      if (k === last) return;
      last = k;
      for (var i = 0; i < words.length; i++) words[i].classList.toggle("is-on", i < k);
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* Petite carte du hero : la clôture de paie se rejoue, avec bouton pause */
  var card = document.querySelector("[data-run]");
  var pauseBtn = document.querySelector("[data-run-toggle]");
  if (card && !reduced) {
    var steps = Array.prototype.slice.call(card.querySelectorAll("li, .runcard__end"));
    var timers = [], paused = false, cycle = null;
    var clear = function () { timers.forEach(clearTimeout); timers = []; };
    var play = function () {
      clear();
      card.classList.add("is-running");
      steps.forEach(function (s) { s.classList.remove("is-on"); });
      steps.forEach(function (s, i) { timers.push(setTimeout(function () { s.classList.add("is-on"); }, 500 + i * 700)); });
    };
    var start = function () { play(); cycle = setInterval(play, 6200); };
    var stop = function () {
      clear(); clearInterval(cycle);
      steps.forEach(function (s) { s.classList.add("is-on"); });
    };
    start();
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        paused = !paused;
        pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        pauseBtn.querySelector(".sr-only").textContent = paused ? "Relancer l'animation" : "Mettre l'animation en pause";
        if (paused) stop(); else start();
      });
    }
  } else if (pauseBtn) {
    pauseBtn.hidden = true;
  }

  /* Cartes animées : le circuit des documents et la chaîne, une fois visibles (2 passages puis arrêt) */
  var flow = document.querySelector("[data-loop]");
  var chain = document.querySelector(".chain");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        if (e.target === chain) chain.classList.add("is-live");
        if (e.target === flow) runFlow();
      });
    }, { threshold: 0.5 });
    if (chain && !reduced) io.observe(chain);
    if (flow) io.observe(flow);
  }
  function runFlow() {
    var items = flow.querySelectorAll("li");
    if (reduced) { items.forEach(function (li) { li.classList.add("is-on"); }); return; }
    if (flow.dataset.running) return;
    flow.dataset.running = "1";
    var n = 0, total = items.length * 2;
    var tick = setInterval(function () {
      var k = n % items.length;
      if (k === 0) items.forEach(function (li) { li.classList.remove("is-on"); });
      items[k].classList.add("is-on");
      n++;
      if (n >= total) { clearInterval(tick); delete flow.dataset.running; }
    }, 520);
  }
  var flowTile = flow && flow.closest(".tile");
  if (flowTile) flowTile.addEventListener("mouseenter", function () { if (!reduced) runFlow(); });

  /* Formulaire de demande de démo */
  var form = document.querySelector("[data-form]");
  if (!form) return;

  var status = form.querySelector("[data-form-status]");
  var timeField = form.querySelector("[data-form-time]");
  if (timeField) timeField.value = String(Date.now());

  var messages = {
    nom: "Écrivez votre nom et prénom.",
    entreprise: "Écrivez le nom de votre entreprise.",
    secteur: "Choisissez votre secteur d'activité.",
    effectif: "Choisissez le nombre de salariés.",
    telephone: "Écrivez un numéro de téléphone (au moins 9 chiffres).",
    email: "Écrivez une adresse e-mail valide, avec un @.",
    consentement: "Cochez la case pour que nous puissions vous recontacter."
  };

  function check(field) {
    var v = (field.type === "checkbox") ? field.checked : field.value.trim();
    var ok = true;
    if (field.required && !v) ok = false;
    if (ok && field.name === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (ok && field.name === "telephone") ok = (v.replace(/\D/g, "").length >= 9);
    return ok;
  }

  function showError(field, ok) {
    var err = document.getElementById(field.getAttribute("aria-describedby"));
    if (ok) {
      field.removeAttribute("aria-invalid");
      if (err) err.textContent = "";
    } else {
      field.setAttribute("aria-invalid", "true");
      if (err) err.textContent = messages[field.name] || "Ce champ est obligatoire.";
    }
  }

  /* Les erreurs disparaissent dès que le champ est corrigé */
  form.addEventListener("input", function (e) {
    var f = e.target;
    if (f.getAttribute("aria-invalid") === "true" && check(f)) showError(f, true);
  });
  form.addEventListener("change", function (e) {
    var f = e.target;
    if (f.getAttribute("aria-invalid") === "true" && check(f)) showError(f, true);
  });

  function setStatus(text, kind) {
    status.textContent = text;
    status.classList.remove("is-ok", "is-error");
    if (kind) status.classList.add(kind);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = Array.prototype.slice.call(form.querySelectorAll("input[name]:not([type=hidden]):not([name=site_web]), select[name], textarea[name]"));
    var invalid = [];
    fields.forEach(function (f) {
      var ok = check(f);
      showError(f, ok);
      if (!ok) invalid.push(f);
    });
    if (invalid.length) {
      setStatus(invalid.length === 1 ? "Un champ est à corriger." : invalid.length + " champs sont à corriger.", "is-error");
      invalid[0].focus();
      return;
    }

    var endpoint = form.getAttribute("data-endpoint") || form.getAttribute("action");
    var data = new FormData(form);
    form.classList.add("is-sending");
    var timer = setTimeout(function () { setStatus("Envoi en cours…"); }, 300);

    fetch(endpoint, { method: "POST", body: data, headers: { "Accept": "application/json" } })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || body.ok === false) throw new Error(body.error || "send");
          return body;
        });
      })
      .then(function () {
        clearTimeout(timer);
        form.reset();
        if (timeField) timeField.value = String(Date.now());
        setStatus("Votre demande de démo est bien envoyée. Nous vous rappelons pour fixer la date.", "is-ok");
      })
      .catch(function () {
        clearTimeout(timer);
        setStatus("L'envoi n'a pas abouti. Vos informations sont conservées : réessayez dans un instant.", "is-error");
      })
      .then(function () { form.classList.remove("is-sending"); });
  });
})();
