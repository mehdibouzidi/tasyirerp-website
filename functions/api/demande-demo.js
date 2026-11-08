/**
 * Cloudflare Pages Function — POST /api/demande-demo
 *
 * Reçoit le formulaire de demande de démo, filtre les robots (champ piège + délai minimal),
 * valide les champs puis transmet la demande par l'un des moyens configurés dans
 * Cloudflare Pages > Settings > Environment variables :
 *
 *   Option A — e-mail via Resend (https://resend.com)
 *     RESEND_API_KEY    (secret)  clé API Resend, à créer dans le tableau de bord Cloudflare
 *     DEMO_TO_EMAIL               adresse qui reçoit les demandes (défaut dans wrangler.toml : contact@tasyirerp.com)
 *     DEMO_FROM_EMAIL             expéditeur sur le domaine vérifié chez Resend (défaut : site@tasyirerp.com)
 *     RESEND_API_URL              facultatif, uniquement pour les tests locaux
 *
 *   Option B — webhook (Make, Zapier, n8n, Google Apps Script, CRM…)
 *     FORM_WEBHOOK_URL  (secret)  reçoit la demande en JSON (POST)
 *
 * Les deux options peuvent être actives en même temps. Sans aucune configuration,
 * la fonction répond 503 et le formulaire affiche un message d'échec (rien n'est perdu côté visiteur).
 */

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
  if (env.RESEND_API_KEY && env.DEMO_TO_EMAIL && env.DEMO_FROM_EMAIL) jobs.push(sendEmail(env, payload));
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
  const html = `<h2>Nouvelle demande de démo</h2><table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><th align="left" style="border-bottom:1px solid #ddd">${k}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
    .join("")}</table>`;
  const text = rows.map(([k, v]) => `${k} : ${v}`).join("\n");

  const res = await fetch(env.RESEND_API_URL || "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.DEMO_FROM_EMAIL,
      to: env.DEMO_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: p.email,
      subject: `Demande de démo — ${p.entreprise} (${p.effectif} salariés)`,
      html,
      text,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

async function sendWebhook(url, p) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}
