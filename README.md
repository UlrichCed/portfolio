# Site personnel

Site vitrine pour présenter mon profil et mes services en **cybersécurité offensive**
et **cyber renseignement**.
Site statique (HTML / CSS / JavaScript), sans dépendance côté client, avec une
fonction serverless Cloudflare pour l'envoi du formulaire de contact.

## ✨ Points clés

- **Design rouge & noir, sombre et imposant** — pensé pour un profil offensif.
- **Responsive** — s'adapte au mobile, à la tablette et au bureau.
- **Sécurisé par conception** — aucune ressource tierce côté client (CSP stricte),
  en-têtes HTTP durcis ; le formulaire passe par une fonction serverless (clé API
  côté serveur, anti-spam, validation).
- **Rapide** — police système, aucun framework, un seul fichier CSS + un seul fichier JS.

## 📁 Structure

```
portfolio/
├── index.html        # Toute la structure et le contenu
├── css/style.css     # Le design et le thème
├── js/main.js        # Menu, animations, envoi du formulaire
├── functions/
│   └── api/contact.js  # Fonction Cloudflare : envoi de l'email (Resend)
├── _headers          # En-têtes de sécurité (Netlify / Cloudflare)
├── SECURITY.md       # Politique de divulgation
├── robots.txt
└── README.md
```

## 🚀 Lancer en local

Le plus simple — ouvrir directement `index.html` dans le navigateur.

Pour un rendu fidèle (la CSP et les modules aiment un vrai serveur), lance un petit serveur local :

```bash
cd portfolio

# Avec Python (déjà installé sur la plupart des machines)
python -m http.server 8080
# puis ouvre http://localhost:8080

# — ou avec Node.js
npx serve .
```

## ✏️ Personnaliser

Tout le texte est en clair dans `index.html`. À adapter en priorité :

- **Titre & accroche** : section `.hero`.
- **Profil / bio** : section `#about`.
- **Opérations (services)** : les cartes de la section `#services`.
- **Arsenal (compétences)** : section `#skills`.
- **Terrain (projets)** : section `#projects` (ajoute tes vraies opérations anonymisées + résultats chiffrés).
- **Contact** : adresse Proton renseignée dans `index.html` et `js/main.js`.
- **Couleur d'accent (rouge)** : variables `--red` / `--red-bright` en haut de `css/style.css`.

## 🔒 Sécurité mise en place

| Protection | Où |
|-----------|-----|
| Content-Security-Policy | balise `<meta>` dans `index.html` + `_headers` |
| Anti-clickjacking (`X-Frame-Options` / `frame-ancestors`) | `_headers` |
| HSTS (forcer HTTPS) | `_headers` |
| `nosniff`, Referrer-Policy, Permissions-Policy | `_headers` |
| Zéro ressource tierce (CDN, polices, trackers) | par conception |
| Liens externes en `rel="noopener noreferrer"` | `index.html` |
| Formulaire : fonction serverless + anti-spam (pot de miel), clé API secrète | `functions/api/contact.js` |
| Le navigateur ne contacte que le site lui-même (`connect-src 'self'`) | par conception |

## 📬 Formulaire de contact (envoi réel vers Proton)

Le formulaire est traité par une **fonction Cloudflare Pages** (`functions/api/contact.js`)
qui envoie l'email via **Resend**. Le navigateur n'appelle que `/api/contact`
(même origine) → la CSP reste stricte, et la clé API n'est jamais exposée.

**Mise en service (une fois) :**

1. Crée un compte gratuit sur **https://resend.com** en t'inscrivant avec
   **holyspyware@proton.me** (indispensable pour recevoir les messages sans
   domaine vérifié).
2. Dans Resend → **API Keys** → crée une clé.
3. Dans **Cloudflare** → ton projet Pages → **Settings → Environment variables**,
   ajoute (en *Secret* pour la clé) :
   - `RESEND_API_KEY` = ta clé Resend
   - `CONTACT_TO` = `holyspyware@proton.me` *(optionnel, valeur par défaut)*
   - `CONTACT_FROM` = `onboarding@resend.dev` *(optionnel ; à changer pour une
     adresse de ton domaine une fois un domaine vérifié dans Resend)*
4. **Redéploie** (Deployments → Create deployment).

> Tant que `RESEND_API_KEY` n'est pas défini, le formulaire **bascule
> automatiquement sur le repli `mailto`** (ouverture du client mail) — le site
> reste donc fonctionnel en attendant.

## 🌍 Déployer gratuitement

- **Netlify / Cloudflare Pages** : glisse le dossier `portfolio/` — le fichier `_headers`
  est pris en compte automatiquement. **Recommandé** (en-têtes de sécurité complets).
- **GitHub Pages** : active Pages sur le dépôt. La CSP fonctionne via la balise `<meta>`
  (les en-têtes HTTP ne sont pas configurables, mais l'essentiel est couvert).

Pense à activer **HTTPS** chez ton hébergeur (gratuit et automatique chez les trois).

## ⚠️ Sécurité du déploiement Cloudflare Pages (important)

Si le projet Cloudflare Pages est connecté **directement à ce dépôt Git** avec
**Build output directory: `/`** (la racine), Cloudflare publie **tout le contenu
du dossier tel quel — y compris le dossier `.git/`**. N'importe qui peut alors
télécharger tout l'historique Git du site (`/.git/config`, `/.git/HEAD`…) avec des
outils comme `GitDumper`. Ce dépôt étant déjà public, l'impact réel est limité,
mais il faut quand même corriger ça :

**La correction — dans Cloudflare Pages → Settings → Builds & deployments :**
- **Build command** :
  ```bash
  mkdir -p dist && for f in * .[!.]*; do case "$f" in dist|.git|functions) continue;; esac; [ -e "$f" ] && cp -r "$f" dist/; done
  ```
  (copie tout dans `dist/`, sauf `.git`, `dist` lui-même, et `functions/` —
  ce dossier n'a pas besoin d'être dans les fichiers publiés : Cloudflare
  Pages détecte les *Functions* directement à la racine du projet, pas dans
  le dossier de build)
- **Build output directory** : `dist` (au lieu de `/`)

Résultat : `.git` et le code source de `functions/api/contact.js` ne sont
plus jamais servis comme fichiers statiques. Toute route inexistante
(y compris `/.git/config`) reçoit automatiquement la page `404.html` du
projet avec un vrai statut **404** — Cloudflare Pages fait ça nativement,
sans configuration `_redirects` (qui n'accepte d'ailleurs pas le code 404,
seulement 200/301/302/303/307/308).

⚠️ **À vérifier après ce déploiement** : que le formulaire de contact
fonctionne toujours (il dépend de la fonction `functions/api/contact.js`).
Si l'envoi cesse de marcher, c'est que Cloudflare a besoin de `functions/`
également dans le dossier de build — retire `|functions` de la commande
ci-dessus et redéploie.
- Redéploie ensuite (Deployments → Create deployment / Retry).

Cette commande copie le site dans un dossier séparé **sans** `.git`, donc il
n'est jamais publié — peu importe la configuration de Cloudflare.

**Pour vérifier toi-même que c'est corrigé :**
```bash
curl -i https://TON-SITE.pages.dev/.git/config
# Doit renvoyer 404 — si tu vois 200 et du texte "[remote \"origin\"]", relance le déploiement.
```
