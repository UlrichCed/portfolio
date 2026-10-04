/**
 * Cloudflare Pages Function : traitement du formulaire de contact.
 * Route : POST /api/contact
 *
 * Envoie le message par email via l'API Resend. La clé API et l'adresse de
 * destination sont des variables d'environnement (jamais exposées au client).
 *
 * Variables à définir dans Cloudflare (Settings → Environment variables) :
 *   RESEND_API_KEY  (secret)          : clé API Resend
 *   CONTACT_TO      (optionnel)       : destinataire (défaut : ulc3d@proton.me)
 *   CONTACT_FROM    (optionnel)       : expéditeur (défaut : onboarding@resend.dev)
 */

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
};
const MAX_BODY_BYTES = 20_000; // largement suffisant pour le formulaire, bloque les charges anormales
const MIN_FILL_MS = 1200; // en dessous, quasi certainement un bot (honeypot temporel)

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: JSON_HEADERS });
}

// Champs utilisés dans des en-têtes d'e-mail (nom → sujet, email → reply-to) :
// on retire TOUT caractère de contrôle, CR/LF compris. Défense en profondeur
// contre une injection d'en-tête, même si l'appel à Resend se fait via un
// champ JSON structuré (donc déjà hors d'atteinte d'une telle injection).
function sanitizeHeaderField(value, maxLen) {
  return String(value || "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLen);
}

// Corps du message : les retours à la ligne sont légitimes (mise en forme),
// seuls les autres caractères de contrôle sont retirés.
function sanitizeMessage(value, maxLen) {
  return String(value || "")
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLen);
}

export async function onRequestPost({ request, env }) {
  // 0. Rejette d'emblée les charges anormalement volumineuses (avant tout parsing)
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  // 0bis. N'accepte que les requêtes same-origin (quand le navigateur envoie
  // Origin). Bloque les soumissions déclenchées depuis un site tiers
  // (abus / spam par appel cross-site), sans gêner les clients sans Origin
  // (tests directs, anciens navigateurs).
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, error: "forbidden_origin" }, 403);
  }

  // 1. Lecture de la charge utile (JSON ou formulaire)
  let data;
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await request.json();
    } else {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
    }
  } catch (_) {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // 2. Anti-spam : pot de miel. Un bot remplit "website" → on ignore en silence.
  if (data && typeof data.website === "string" && data.website.trim() !== "") {
    return json({ ok: true });
  }

  // 2bis. Anti-spam temporel : un formulaire rempli et envoyé en moins d'une
  // seconde et demie est presque toujours un bot. "ts" est posé côté client
  // au chargement de la page (voir js/main.js).
  const startedAt = Number(data && data.ts);
  if (!startedAt || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return json({ ok: true });
  }

  // 3. Nettoyage + validation (bornes strictes, caractères de contrôle retirés)
  const name = sanitizeHeaderField(data.name, 120);
  const email = sanitizeHeaderField(data.email, 200);
  const message = sanitizeMessage(data.message, 5000);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (name.length < 2 || !emailValid || message.length < 5) {
    return json({ ok: false, error: "invalid" }, 400);
  }

  // 4. Configuration
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    // Non configuré : le client basculera sur le repli mailto.
    return json({ ok: false, error: "not_configured" }, 503);
  }
  const to = env.CONTACT_TO || "ulc3d@proton.me";
  const from = env.CONTACT_FROM || "Formulaire du site <onboarding@resend.dev>";

  // 5. Envoi via Resend (le corps est en JSON structuré : aucune injection
  //    d'en-tête SMTP possible, et les caractères de contrôle ont déjà été
  //    retirés par sanitizeHeaderField()/sanitizeMessage() ci-dessus)
  let resp;
  try {
    resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: email,
        subject: "Nouveau contact : " + name,
        text:
          "Nom / Organisation : " + name + "\n" +
          "Email : " + email + "\n\n" +
          message,
      }),
    });
  } catch (_) {
    return json({ ok: false, error: "network" }, 502);
  }

  if (!resp.ok) {
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true });
}
