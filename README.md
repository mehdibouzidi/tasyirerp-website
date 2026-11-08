# Site commercial Tasyir ERP

Site vitrine de **Tasyir ERP**. Un seul objectif : obtenir des demandes de démo.
Le site est statique (HTML, CSS et un peu de JavaScript, sans framework). Le formulaire passe par une petite fonction Cloudflare Pages.

```
public/                     ← tout ce qui est publié
  index.html                page principale (toutes les sections)
  mentions-legales/         mentions légales
  confidentialite/          politique de confidentialité (loi 18-07)
  credits/                  crédits des photos et polices
  merci/                    confirmation après envoi sans JavaScript (non indexée)
  404.html                  page introuvable
  assets/css/site.css       styles (couleurs de la charte en haut du fichier)
  assets/js/site.js         menu mobile, thème, animations et formulaire
  assets/js/theme.js        applique le thème choisi avant l'affichage
  assets/fonts/             Inter et IBM Plex Sans Arabic, auto-hébergées
  assets/logo/              logos et icônes (copiés depuis catering-manager/docs/branding)
  assets/img/               photos des secteurs (WebP)
  assets/og/                image de partage (réseaux sociaux)
  robots.txt, sitemap.xml, site.webmanifest
  _headers                  en-têtes de sécurité et de cache (Cloudflare Pages)
  _redirects                redirections 301
functions/api/demande-demo.js   réception du formulaire (Cloudflare Pages Function)
wrangler.toml                   configuration Cloudflare Pages
A-COMPLETER.md                  liste de ce qu'il faut remplir avant la mise en ligne
```

## Lancer le site en local

Version simple, sans le formulaire :

```bash
cd public && python3 -m http.server 8080
```

Ouvrir http://localhost:8080.

Version complète, avec le formulaire (Node.js 18 ou plus) :

```bash
npm install
```

```bash
npm run dev
```

Pour tester l'envoi en local, créer un fichier `.dev.vars` à la racine (il n'est pas versionné) :

```
FORM_WEBHOOK_URL=https://exemple-de-webhook
```

## Déployer sur Cloudflare Pages

**Option 1 : depuis GitHub (recommandé).**

1. Cloudflare > Workers & Pages > Create > Pages > Connect to Git, choisir ce dépôt.
2. Framework preset : *None*. Build command : laisser vide. Build output directory : `public`.
3. Le dossier `functions/` est détecté tout seul : `/api/demande-demo` est créé.
4. Ajouter les variables du formulaire (voir plus bas), puis relancer un déploiement.
5. Custom domains : ajouter le domaine (par exemple `tasyirerp.com` et `www.tasyirerp.com`).

Chaque push sur la branche principale redéploie le site.

**Option 2 : en ligne de commande.**

```bash
npx wrangler login
```

```bash
npm run deploy
```

## Brancher le formulaire

Le formulaire envoie ses données à `/api/demande-demo`. La fonction :

- ignore les robots (champ piège invisible `site_web` et envoi en moins de 3 secondes) ;
- vérifie les champs obligatoires, l'e-mail, le téléphone et la case de consentement ;
- transmet la demande par e-mail, par webhook, ou les deux.

Variables à définir dans Cloudflare Pages > Settings > Variables and Secrets (en *Production*) :

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` (secret) | Clé du service d'e-mail [Resend](https://resend.com) (offre gratuite suffisante) |
| `DEMO_TO_EMAIL` | Adresse qui reçoit les demandes (plusieurs : séparées par des virgules) |
| `DEMO_FROM_EMAIL` | Expéditeur vérifié chez Resend, ex. `Tasyir ERP <site@tasyirerp.com>` |
| `FORM_WEBHOOK_URL` (secret) | Optionnel : URL qui reçoit chaque demande en JSON (Make, Zapier, n8n, Google Sheets via Apps Script, CRM…) |

Sans aucune variable, le formulaire affiche un message d'échec : rien n'est envoyé.

**Utiliser un autre service (Formspree, Getform…)** : remplacer `action="/api/demande-demo"` dans `public/index.html` par l'adresse du service, ou ajouter `data-endpoint="https://…"` sur la balise `<form>`. Ajouter aussi le domaine du service à `connect-src` et `form-action` dans `public/_headers`.

## Modifier les textes

Tous les textes sont dans les fichiers HTML de `public/`. Chaque section de `index.html` est précédée d'un commentaire (`<!-- 2. Problèmes résolus -->`, `<!-- 9. FAQ -->`…).

- **Titre et description Google** : balises `<title>` et `<meta name="description">` en haut de chaque page.
- **FAQ** : la modifier à deux endroits : dans la section HTML et dans le bloc `FAQPage` des données structurées (`<script type="application/ld+json">` en haut de `index.html`).
- **Couleurs** : variables en haut de `public/assets/css/site.css`.
- **Photos** : remplacer les fichiers de `public/assets/img/` en gardant les noms, au format WebP 4:3 (640 px de large, plus une version plus grande), puis mettre à jour la page `credits/`.
- **Image de partage** : `public/assets/og/tasyir-erp-og.png`, 1200 × 630 px.

Règles de contenu à garder : montrer les bénéfices, jamais le fonctionnement interne ; aucun prix ; pas de BTP ; l'option IA toujours présentée comme une option payante. Seule référence client citée : El Afia Catering (hero, section « Client de référence », secteurs, FAQ) ; ne pas inventer de chiffre ni de citation à son sujet.

## Thème sombre et clair

Le site s'affiche en **sombre par défaut** (`data-theme="dark"` sur la balise `<html>` de chaque page). Le bouton lune/soleil de l'en-tête bascule en clair ; le choix du visiteur est gardé dans son navigateur.

- Pour revenir au clair par défaut : retirer `data-theme="dark"` de la balise `<html>` des pages.
- Les couleurs des deux thèmes sont des variables en haut de `site.css` (bloc « thème clair », puis « thème sombre »).

## Animations

- Hero : la petite carte « Clôture de la paie » se rejoue toutes les 6 secondes, avec un bouton pause.
- Problèmes : la grande phrase s'allume mot à mot au défilement.
- Points forts : le circuit des documents et la chaîne s'animent deux fois quand ils apparaissent, puis s'arrêtent.
- Tout s'arrête si le visiteur a demandé à réduire les animations dans son système.

## Nom de domaine

Les adresses absolues utilisent `https://tasyirerp.com`. Si le domaine est différent :

```bash
grep -rl "https://tasyirerp.com" public | xargs sed -i 's#https://tasyirerp.com#https://www.votre-domaine.dz#g'
```

## SEO et performance

- Balises title, description, canonical, Open Graph et Twitter sur chaque page.
- Données structurées : Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList.
- `sitemap.xml` et `robots.txt`. Après la mise en ligne, déclarer le sitemap dans Google Search Console et Bing Webmaster Tools.
- Polices auto-hébergées (`font-display: swap`, préchargement d'Inter), photos WebP en chargement différé, aucun script tiers, aucun cookie.
- En-têtes de sécurité (CSP stricte, HSTS…) dans `public/_headers`.

## Version arabe (à venir)

La structure est prête :

- le CSS utilise des propriétés logiques (`margin-inline`, `inset-inline-start`…) et s'inverse avec `dir="rtl"` ;
- la police IBM Plex Sans Arabic est déclarée ; elle ne se télécharge que si la page contient du texte arabe ;
- `:lang(ar)` applique la police arabe automatiquement.

Pour l'ajouter : copier `public/index.html` vers `public/ar/index.html`, mettre `<html lang="ar" dir="rtl">`, traduire les textes, puis décommenter la balise `hreflang="ar-DZ"` dans la page française, ajouter la réciproque dans la page arabe et ajouter l'adresse au `sitemap.xml`.

## Outil de conception

La page a été conçue avec le skill [taste-skill](https://www.tasteskill.dev/) (dépôt `Leonxlnx/taste-skill`) : règles de rédaction, système visuel unique, contrôles automatiques. Ce skill n'est pas inclus dans le dépôt (40 Mo). Pour l'installer :

```bash
git clone --depth 1 https://github.com/Leonxlnx/taste-skill /tmp/taste-skill
```

```bash
cp -r /tmp/taste-skill/skills/taste-skill ~/.claude/skills/design-taste-frontend
```
