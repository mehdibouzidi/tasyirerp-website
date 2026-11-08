/**
 * Petit client SMTP pour Cloudflare (Pages Functions / Workers), sans dépendance.
 * Utilise les sockets TCP de Cloudflare (cloudflare:sockets).
 *
 * OVH (MX Plan, E-mail Pro) : hôte ssl0.ovh.net, port 465 (TLS direct) ; identifiant = adresse e-mail complète.
 * Le port 25 est bloqué par Cloudflare : utiliser 465 (secure "tls") ou 587 (secure "starttls").
 */
import { connect } from "cloudflare:sockets";

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(str) {
  const bytes = enc.encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function wrap76(s) { return s.replace(/.{1,76}/g, "$&\r\n"); }
function encodeHeader(value) {
  return /^[\x20-\x7E]*$/.test(value) ? value : "=?UTF-8?B?" + b64(value) + "?=";
}
function clean(v) { return String(v || "").replace(/[\r\n]+/g, " ").trim(); }
function addrOnly(v) { const m = String(v).match(/<([^>]+)>/); return (m ? m[1] : String(v)).trim(); }
function formatAddr(v) {
  const m = String(v).match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m && m[1] ? encodeHeader(m[1].replace(/"/g, "")) + " <" + m[2] + ">" : addrOnly(v);
}

class Conn {
  constructor(socket) { this.attach(socket); this.buf = ""; }
  attach(socket) {
    this.socket = socket;
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
  }
  async read() {
    // Lit une réponse complète (éventuellement sur plusieurs lignes « 250-... » puis « 250 ... »).
    for (;;) {
      const lines = this.buf.split("\r\n");
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i]) || /^\d{3}$/.test(lines[i])) {
          const text = lines.slice(0, i + 1).join("\n");
          this.buf = lines.slice(i + 1).join("\r\n");
          return { code: Number(lines[i].slice(0, 3)), text };
        }
      }
      const { value, done } = await this.reader.read();
      if (done) throw new Error("SMTP : connexion fermée par le serveur");
      this.buf += dec.decode(value, { stream: true });
    }
  }
  async write(line) { await this.writer.write(enc.encode(line + "\r\n")); }
  async cmd(line, expect) {
    await this.write(line);
    return this.expect(expect, line.startsWith("AUTH") || line.length > 60 ? line.split(" ")[0] : line);
  }
  async expect(codes, label) {
    const res = await this.read();
    const ok = Array.isArray(codes) ? codes.includes(res.code) : res.code === codes;
    if (!ok) throw new Error(`SMTP ${label || ""} : ${res.text}`);
    return res;
  }
}

/**
 * @param {object} o
 * @param {string} o.host  ex. "ssl0.ovh.net"
 * @param {number} o.port  465 ou 587
 * @param {"tls"|"starttls"|"off"} o.secure  "off" uniquement pour les tests locaux
 * @param {string} o.user, o.pass
 * @param {string} o.from  ex. "Site Tasyir ERP <contact@tasyirerp.com>" (OVH exige l'adresse du compte)
 * @param {string[]} o.to
 * @param {string} [o.replyTo]
 * @param {string} o.subject, o.text, [o.html]
 */
export async function sendMail(o) {
  const secureTransport = o.secure === "tls" ? "on" : o.secure === "starttls" ? "starttls" : "off";
  const socket = connect({ hostname: o.host, port: Number(o.port) }, { secureTransport, allowHalfOpen: false });
  const c = new Conn(socket);
  const helo = "tasyirerp-website";
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("SMTP : délai dépassé")), 20000));

  const run = (async () => {
    await c.expect(220, "accueil");
    let ehlo = await c.cmd("EHLO " + helo, 250);
    if (o.secure === "starttls") {
      await c.cmd("STARTTLS", 220);
      c.reader.releaseLock(); c.writer.releaseLock();
      c.attach(socket.startTls());
      c.buf = "";
      ehlo = await c.cmd("EHLO " + helo, 250);
    }
    if (o.user) {
      if (/AUTH[ =][^\n]*PLAIN/i.test(ehlo.text)) {
        await c.cmd("AUTH PLAIN " + b64("\0" + o.user + "\0" + o.pass), 235);
      } else {
        await c.cmd("AUTH LOGIN", 334);
        await c.cmd(b64(o.user), 334);
        await c.cmd(b64(o.pass), 235);
      }
    }
    await c.cmd("MAIL FROM:<" + addrOnly(o.from) + ">", 250);
    for (const rcpt of o.to) await c.cmd("RCPT TO:<" + addrOnly(rcpt) + ">", [250, 251]);
    await c.cmd("DATA", 354);

    const domain = addrOnly(o.from).split("@")[1] || "localhost";
    const boundary = "b_" + crypto.randomUUID();
    const headers = [
      "From: " + formatAddr(o.from),
      "To: " + o.to.map(addrOnly).join(", "),
      o.replyTo ? "Reply-To: " + addrOnly(clean(o.replyTo)) : null,
      "Subject: " + encodeHeader(clean(o.subject)),
      "Date: " + new Date().toUTCString().replace("GMT", "+0000"),
      "Message-ID: <" + crypto.randomUUID() + "@" + domain + ">",
      "MIME-Version: 1.0",
      o.html ? `Content-Type: multipart/alternative; boundary="${boundary}"` : "Content-Type: text/plain; charset=UTF-8",
      o.html ? null : "Content-Transfer-Encoding: base64",
    ].filter(Boolean);
    let body;
    if (o.html) {
      body = [
        "--" + boundary,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64", "", wrap76(b64(o.text)),
        "--" + boundary,
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: base64", "", wrap76(b64(o.html)),
        "--" + boundary + "--", "",
      ].join("\r\n");
    } else {
      body = wrap76(b64(o.text));
    }
    // Les lignes base64 ne commencent jamais par « . » : pas de doublement de point nécessaire.
    await c.writer.write(enc.encode(headers.join("\r\n") + "\r\n\r\n" + body + "\r\n.\r\n"));
    await c.expect(250, "envoi du message");
    try { await c.cmd("QUIT", 221); } catch (e) { /* sans importance */ }
  })();

  try {
    await Promise.race([run, timeout]);
  } finally {
    try { await socket.close(); } catch (e) { /* déjà fermée */ }
  }
}
