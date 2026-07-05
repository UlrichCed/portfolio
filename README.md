# Site personnel

Site vitrine pour présenter mon profil et mes services en **cybersécurité offensive**
et **cyber renseignement**.
100 % statique (HTML / CSS / JavaScript), sans dépendance externe, sans backend.

## ✨ Points clés

- **Design rouge & noir, sombre et imposant** — pensé pour un profil offensif.
- **Responsive** — s'adapte au mobile, à la tablette et au bureau.
- **Sécurisé par conception** — aucune ressource externe (surface d'attaque minimale),
  politique de sécurité du contenu (CSP), en-têtes HTTP durcis, formulaire sans serveur.
- **Rapide** — police système, aucun framework, un seul fichier CSS + un seul fichier JS.

## 📁 Structure

```
portfolio/
├── index.html        # Toute la structure et le contenu
├── css/style.css     # Le design et le thème
├── js/main.js        # Thème, menu, animations, formulaire
├── _headers          # En-têtes de sécurité (Netlify / Cloudflare)
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
- **Contact** : email déjà renseigné ; ajoute ton lien **LinkedIn** et vérifie le lien GitHub.
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
| Formulaire sans backend (mailto) | `js/main.js` |

## 🌍 Déployer gratuitement

- **Netlify / Cloudflare Pages** : glisse le dossier `portfolio/` — le fichier `_headers`
  est pris en compte automatiquement. **Recommandé** (en-têtes de sécurité complets).
- **GitHub Pages** : active Pages sur le dépôt. La CSP fonctionne via la balise `<meta>`
  (les en-têtes HTTP ne sont pas configurables, mais l'essentiel est couvert).

Pense à activer **HTTPS** chez ton hébergeur (gratuit et automatique chez les trois).
