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
