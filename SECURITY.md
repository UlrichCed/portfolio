# Politique de sécurité

Ce dépôt héberge un site vitrine **statique** (HTML/CSS/JS), sans base de
données, sans compte utilisateur et sans dépendance tierce côté client. Le
seul composant dynamique est une fonction serverless (Cloudflare Pages
Function) qui traite le formulaire de contact.

## Signaler une vulnérabilité

Si vous découvrez un problème de sécurité sur ce site, merci de le signaler
de façon responsable, en privé, à&nbsp;:

- **ulc3d@proton.me** (contact chiffré)

Merci de **ne pas** ouvrir d'issue publique avant qu'un correctif ne soit
disponible. Je m'engage à accuser réception sous 48&nbsp;heures.

## Mesures de sécurité en place

**Front-end**
- **Content-Security-Policy** stricte (`default-src 'self'`), sans
  `unsafe-inline` ni `unsafe-eval` ; directives inutilisées explicitement à
  `'none'` ; appliquée à la fois en en-tête HTTP et en balise `<meta>`.
- **Aucune ressource tierce** (pas de CDN, police, tracker ou analytics) →
  surface d'attaque et chaîne d'approvisionnement minimales (aucune
  dépendance = aucun composant tiers à maintenir à jour).
- **Aucun script inline**, aucun gestionnaire d'événement inline. Le seul
  usage de `innerHTML` (bascule de langue FR/EN) ne manipule que du contenu
  statique défini dans le code source, jamais une donnée venant de
  l'utilisateur ou de l'URL : aucun vecteur XSS.
- Liens externes en `rel="noopener noreferrer"` (anti reverse-tabnabbing).
- **En-têtes HTTP durcis** (`_headers`) : HSTS, `nosniff`, anti-clickjacking
  (`X-Frame-Options` + `frame-ancestors 'none'`), Referrer-Policy stricte,
  Permissions-Policy restrictive, isolation cross-origin (COOP/CORP/COEP).

**Formulaire de contact (`functions/api/contact.js`)**
- Clé API et destinataire en variables d'environnement Cloudflare,
  jamais exposées au client ni commises dans le dépôt.
- Validation stricte côté serveur (longueurs bornées, format e-mail),
  indépendante de la validation côté client.
- Tous les caractères de contrôle (CR/LF compris) sont retirés des champs
  utilisés dans des en-têtes d'e-mail (nom → sujet, email → reply-to) :
  défense en profondeur contre une injection d'en-tête, même si l'appel à
  Resend se fait déjà via un champ JSON structuré.
- Rejet des charges anormalement volumineuses avant même de les analyser
  (`Content-Length` exigé et borné : une requête qui l'omettrait, par
  exemple via `Transfer-Encoding: chunked`, est rejetée d'emblée plutôt que
  de contourner la limite).
- Rejet explicite d'une charge JSON de forme invalide (`null`, tableau,
  nombre...) avant tout accès aux champs, pour éviter une exception non
  gérée sur une entrée malformée.
- Vérification de l'origine de la requête (`Origin`) pour bloquer les
  soumissions déclenchées depuis un site tiers.
- Double anti-spam : pot de miel (champ invisible) + horodatage côté client
  (rejet silencieux des envois trop rapides pour être humains).
- Aucune donnée n'est stockée : le message part directement vers une boîte
  mail, rien n'est journalisé côté serveur.

## Limite connue

La protection anti-abus du formulaire (pot de miel + horodatage) filtre les
bots automatisés courants, mais ne remplace pas une limitation de débit par
adresse IP au niveau de l'infrastructure. Pour une protection complète
contre un abus ciblé et déterminé, activer une règle de **rate limiting**
Cloudflare sur `/api/contact` (Security → WAF → Rate limiting rules) —
cette couche se configure côté tableau de bord Cloudflare, pas dans le code.

## Hébergement recommandé

Pour que **tous** les en-têtes de sécurité s'appliquent (notamment HSTS et
la protection anti-clickjacking par en-tête), héberger sur **Netlify** ou
**Cloudflare Pages**. Sur GitHub Pages, seule la CSP en balise `<meta>`
s'applique.

Voir aussi `README.md` pour la configuration du répertoire de build
(exclusion de `.git/`).
