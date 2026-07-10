# Politique de sécurité

Ce dépôt héberge un site vitrine **statique** (HTML/CSS/JS), sans backend,
sans base de données et sans dépendance tierce.

## Signaler une vulnérabilité

Si vous découvrez un problème de sécurité sur ce site, merci de le signaler
de façon responsable, en privé, à&nbsp;:

- **ulc3d@proton.me** (contact chiffré)

Merci de **ne pas** ouvrir d'issue publique avant qu'un correctif ne soit
disponible. Je m'engage à accuser réception sous 48&nbsp;heures.

## Mesures de sécurité en place

- **Content-Security-Policy** stricte (`default-src 'self'`), sans `unsafe-inline`
  ni `unsafe-eval` ; directives inutilisées explicitement à `'none'`.
- **Aucune ressource tierce** (pas de CDN, police, tracker ou analytics) →
  surface d'attaque et chaîne d'approvisionnement minimales.
- **Aucun script inline**, aucun gestionnaire d'événement inline, aucun
  `innerHTML`/`eval` — pas de sink XSS côté client.
- **Aucune donnée collectée** : pas de cookie, pas de `localStorage`, pas de
  formulaire côté serveur (le contact ouvre le client mail local).
- **En-têtes HTTP durcis** (`_headers`) : HSTS, `nosniff`, anti-clickjacking,
  Referrer-Policy, Permissions-Policy, isolation cross-origin.
- Liens externes en `rel="noopener noreferrer"`.

## Hébergement recommandé

Pour que **tous** les en-têtes de sécurité s'appliquent (notamment HSTS et
la protection anti-clickjacking par en-tête), héberger sur **Netlify** ou
**Cloudflare Pages**. Sur GitHub Pages, seule la CSP en balise `<meta>`
s'applique.
