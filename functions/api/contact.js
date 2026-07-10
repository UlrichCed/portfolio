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

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: JSON_HEADERS });
}

export async function onRequestPost({ request, env }) {
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

  // 3. Nettoyage + validation (bornes strictes)
  const name = String(data.name || "").trim().slice(0, 120);
  const email = String(data.email || "").trim().slice(0, 200);
  const message = String(data.message || "").trim().slice(0, 5000);
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

  // 5. Envoi via Resend (le corps est en texte : aucune injection d'en-tête possible)
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
