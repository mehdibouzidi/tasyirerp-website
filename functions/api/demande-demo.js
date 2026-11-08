/**
 * Cloudflare Pages Function — POST /api/demande-demo
 *
 * Reçoit le formulaire de demande de démo, filtre les robots (champ piège + délai minimal),
 * valide les champs puis envoie la demande par e-mail via le serveur SMTP d'OVH.
 *
 * Secrets à déclarer dans Cloudflare Pages > Settings > Variables and Secrets (type « Secret ») :
 *   SMTP_USER       adresse de la boîte OVH qui envoie, ex. contact@tasyirerp.com
 *   SMTP_PASSWORD   mot de passe de cette boîte
 *
 * Facultatif (valeurs par défaut entre parenthèses) :
 *   SMTP_HOST (ssl0.ovh.net) · SMTP_PORT (465) · SMTP_SECURE (tls ; « starttls » pour le port 587)
 *   DEMO_TO_EMAIL (contact@tasyirerp.com ; plusieurs adresses séparées par des virgules)
 *   DEMO_FROM_NAME (Site Tasyir ERP)
 *   FORM_WEBHOOK_URL : reçoit aussi chaque demande en JSON (Make, Zapier, n8n, CRM…)
 */
import { sendMail } from "../../lib/smtp.js";

const LIMITS = { nom: 120, entreprise: 160, secteur: 80, effectif: 40, telephone: 30, email: 160, message: 2000 };
const REQUIRED = ["nom", "entreprise", "secteur", "effectif", "telephone", "email"];
const MIN_FILL_MS = 3000; // un humain met plus de 3 secondes à remplir le formulaire

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(wantsJson, 400, { ok: false, error: "format" });
  }

  // 1. Anti-spam : champ piège rempli ou envoi trop rapide → on fait semblant d'accepter.
  const trap = String(form.get("site_web") || "").trim();
  const started = Number(form.get("t") || 0);
  const tooFast = started > 0 && Date.now() - started < MIN_FILL_MS;
  if (trap || tooFast) return reply(wantsJson, 200, { ok: true });

  // 2. Lecture et validation.
  const data = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    data[key] = String(form.get(key) || "").trim().slice(0, max);
  }
  const consent = form.get("consentement") === "oui";
  const missing = REQUIRED.filter((k) => !data[k]);
  if (missing.length || !consent) return reply(wantsJson, 422, { ok: false, error: "missing", fields: missing });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return reply(wantsJson, 422, { ok: false, error: "email" });
  if (data.telephone.replace(/\D/g, "").length < 9) return reply(wantsJson, 422, { ok: false, error: "telephone" });

  const received = new Date().toISOString();
  const payload = { ...data, consentement: true, recu_le: received, source: new URL(request.url).host };

  // 3. Envoi.
  const jobs = [];
  if (env.SMTP_USER && env.SMTP_PASSWORD) jobs.push(sendEmail(env, payload));
  if (env.FORM_WEBHOOK_URL) jobs.push(sendWebhook(env.FORM_WEBHOOK_URL, payload));
  if (!jobs.length) return reply(wantsJson, 503, { ok: false, error: "not_configured" });

  const results = await Promise.allSettled(jobs);
  const delivered = results.some((r) => r.status === "fulfilled");
  if (!delivered) {
    console.error("demande-demo: échec d'envoi", results.map((r) => r.reason && String(r.reason)));
    return reply(wantsJson, 502, { ok: false, error: "delivery" });
  }
  return reply(wantsJson, 200, { ok: true });
}

export function onRequest() {
  return new Response("Méthode non autorisée", { status: 405, headers: { Allow: "POST" } });
}

function reply(wantsJson, status, body) {
  if (wantsJson) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  // Envoi sans JavaScript : redirection vers une page de confirmation ou retour au formulaire.
  const target = body.ok ? "/merci/" : "/#demo";
  return new Response(null, { status: 303, headers: { Location: target } });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function sendEmail(env, p) {
  const rows = [
    ["Nom", p.nom], ["Entreprise", p.entreprise], ["Secteur", p.secteur], ["Salariés", p.effectif],
    ["Téléphone", p.telephone], ["E-mail", p.email], ["Message", p.message || "—"], ["Reçue le", p.recu_le],
  ];
  const html = `<h2 style="font-family:Arial,sans-serif">Nouvelle demande de démo</h2><table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif">${rows
    .map(([k, v]) => `<tr><th align="left" style="border-bottom:1px solid #ddd">${k}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
    .join("")}</table>`;
  const text = rows.map(([k, v]) => `${k} : ${v}`).join("\n");
  const user = env.SMTP_USER.trim();

  await sendMail({
    host: env.SMTP_HOST || "ssl0.ovh.net",
    port: Number(env.SMTP_PORT || 465),
    secure: env.SMTP_SECURE || "tls",
    user,
    pass: env.SMTP_PASSWORD,
    // OVH n'accepte que l'adresse de la boîte authentifiée comme expéditeur.
    from: `${env.DEMO_FROM_NAME || "Site Tasyir ERP"} <${user}>`,
    to: (env.DEMO_TO_EMAIL || "contact@tasyirerp.com").split(",").map((s) => s.trim()).filter(Boolean),
    replyTo: p.email,
    subject: `Demande de démo — ${p.entreprise} (effectif : ${p.effectif})`,
    text,
    html,
  });
}

async function sendWebhook(url, p) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}
