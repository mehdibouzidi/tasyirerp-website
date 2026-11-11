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
lib/smtp.js                     envoi des e-mails par SMTP (OVH)
wrangler.toml                   configuration Cloudflare Pages
A-COMPLETER.md                  liste de ce qu'il faut remplir avant la mise en ligne
DEPLOIEMENT.md                  mise en ligne de tasyirerp.com : DNS OVH vers Cloudflare, domaine, e-mails
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

Pour tester l'envoi en local : copier `.dev.vars.example` en `.dev.vars` (jamais commité) et y mettre le vrai mot de passe de la boîte OVH.

## Déployer sur Cloudflare Pages

Tout est prêt : `wrangler.toml` (dossier publié `public`, variables du formulaire), `functions/` (formulaire), `_headers` (sécurité et cache), `_redirects`, `404.html`. Aucune étape de build.

### 1. Créer le projet (une seule fois)

1. Cloudflare > Workers & Pages > Create > Pages > **Connect to Git**, choisir le dépôt `tasyirerp-website`.
2. Production branch : la branche principale. Framework preset : **None**. Build command : **vide**. Build output directory : **`public`**.
3. Save and Deploy. Le site est en ligne sur `tasyirerp-website.pages.dev`.
4. Custom domains : ajouter `tasyirerp.com`, puis `www.tasyirerp.com`. Si le domaine est déjà chez Cloudflare, les DNS se règlent tout seuls.
5. Rediriger `www` vers le domaine principal : Rules > Redirect Rules (ou Bulk Redirects), `www.tasyirerp.com/*` vers `https://tasyirerp.com/${1}` en 301.

Ensuite, chaque push sur la branche principale redéploie le site ; chaque autre branche obtient une URL de prévisualisation.

En ligne de commande, sans Git :

```bash
npx wrangler login
```

```bash
npm run deploy
```

### 2. Brancher le formulaire sur contact@tasyirerp.com (SMTP OVH)

Les demandes partent par le serveur SMTP d'OVH, depuis la boîte contact@tasyirerp.com, vers contact@tasyirerp.com. Il suffit de déclarer **deux secrets** :

1. Cloudflare > Workers & Pages > projet `tasyirerp-website` > Settings > **Variables and Secrets** > Add.
2. Type **Secret**, environnement **Production** :
   - `SMTP_USER` = `contact@tasyirerp.com`
   - `SMTP_PASSWORD` = le mot de passe de cette boîte OVH
3. Deployments > dernier déploiement > **Retry deployment** (les secrets s'appliquent au déploiement suivant).
4. Envoyer une demande de test depuis le site : elle arrive sur contact@tasyirerp.com, avec pour objet « Demande de démo — Entreprise (effectif : …) ». « Répondre » écrit directement au prospect.

Ou en ligne de commande :

```bash
npx wrangler pages secret put SMTP_USER
```

```bash
npx wrangler pages secret put SMTP_PASSWORD
```

Valeurs par défaut, à changer seulement si besoin (même écran, en variables) : `SMTP_HOST` = `ssl0.ovh.net`, `SMTP_PORT` = `465`, `SMTP_SECURE` = `tls` (mettre `starttls` avec le port 587), `DEMO_TO_EMAIL` = `contact@tasyirerp.com` (plusieurs adresses séparées par des virgules), `DEMO_FROM_NAME` = `Site Tasyir ERP`.

Bon à savoir :
- OVH n'accepte comme expéditeur que la boîte authentifiée : l'e-mail part de `SMTP_USER`.
- Le port 25 est bloqué par Cloudflare ; le 465 (par défaut) fonctionne.
- Si le mot de passe de la boîte change, mettre à jour le secret `SMTP_PASSWORD` et redéployer.
- Tant que les secrets ne sont pas déclarés, le formulaire affiche « L'envoi n'a pas abouti » : rien n'est envoyé.
- En cas d'échec, le détail (par exemple « authentication failed ») apparaît dans Cloudflare > projet > Deployments > Functions > Real-time logs.

### Formulaire : détails techniques

Le formulaire envoie ses données à `/api/demande-demo` (`functions/api/demande-demo.js`). La fonction :

- ignore les robots (champ piège invisible `site_web` et envoi en moins de 3 secondes) ;
- vérifie les champs obligatoires, l'e-mail, le téléphone et la case de consentement ;
- envoie l'e-mail par SMTP avec `lib/smtp.js`, un petit client sans dépendance basé sur les sockets TCP de Cloudflare (TLS direct sur le port 465, ou STARTTLS sur le 587) ;
- en option, transmet aussi la demande en JSON à `FORM_WEBHOOK_URL` (Make, Zapier, n8n, CRM…).

Sans JavaScript, le visiteur est redirigé vers `/merci/` après l'envoi.

## Modifier les textes

Tous les textes sont dans les fichiers HTML de `public/`. Chaque section de `index.html` est précédée d'un commentaire (`<!-- 2. Problèmes résolus -->`, `<!-- 9. FAQ -->`…).

- **Titre et description Google** : balises `<title>` et `<meta name="description">` en haut de chaque page.
- **FAQ** : la modifier à deux endroits : dans la section HTML et dans le bloc `FAQPage` des données structurées (`<script type="application/ld+json">` en haut de `index.html`).
- **Couleurs** : variables en haut de `public/assets/css/site.css`.
- **Photos** : remplacer les fichiers de `public/assets/img/` en gardant les noms, au format WebP 4:3 (640 px de large, plus une version plus grande), puis mettre à jour la page `credits/`.
- **Image de partage** : `public/assets/og/tasyir-erp-og.png`, 1200 × 630 px.

Règles de contenu à garder : montrer les bénéfices, jamais le fonctionnement interne ; aucun prix ; pas de BTP ; l'option IA toujours présentée comme une option payante. Seule référence client citée : El Afia Catering (hero, section « Client de référence », secteurs, FAQ) ; ne pas inventer de chiffre ni de citation à son sujet.

## Thème sombre et clair

Le site s'affiche en **clair par défaut** (`data-theme="light"` sur la balise `<html>` de chaque page). Le bouton lune/soleil de l'en-tête bascule en sombre ; le choix du visiteur est gardé dans son navigateur.

- Pour passer en sombre par défaut : mettre `data-theme="dark"` sur la balise `<html>` des pages.
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
- Polices auto-hébergées (`font-display: swap`, préchargement d'Inter), photos WebP en chargement différé.
- Google Tag Manager (`GTM-5FDP3SFZ`) chargé sur toutes les pages, sans bandeau de consentement, à la demande du client. Le code est dans `public/assets/js/analytics.js` et dans une balise `<script async>` du `<head>` de chaque page. Les domaines Google sont autorisés dans la CSP de `public/_headers` : si une balise GTM charge un autre service (Meta, LinkedIn, Hotjar…), ajouter son domaine à `script-src`, `connect-src` et `img-src`, sinon le navigateur la bloque. Les balises « HTML personnalisé » de GTM sont bloquées par la CSP (pas de `'unsafe-inline'`).
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
