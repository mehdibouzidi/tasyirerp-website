# Mise en ligne de tasyirerp.com : OVH + Cloudflare

Répartition retenue :

| Élément | Où |
|---|---|
| Nom de domaine (achat, renouvellement) | OVH, sans changement |
| E-mails contact@tasyirerp.com (réception, envoi, formulaire) | OVH, sans changement |
| DNS (zone) | **Cloudflare** (au lieu d'OVH) |
| Site web | Cloudflare Pages (`tasyirerp-website.pages.dev`) |

Pourquoi déplacer les DNS : Cloudflare Pages ne peut servir `tasyirerp.com` (sans www) que si la zone DNS est chez Cloudflare. Les e-mails continuent de passer par OVH : il suffit de recopier leurs enregistrements, listés plus bas.

État relevé le 8 novembre 2026 : DNS chez OVH (`dns200.anycast.me`, `ns200.anycast.me`), DNSSEC non activé, `tasyirerp.com` et `www` pointent vers l'hébergement OVH 213.186.33.5 (page par défaut).

---

## Étape 1. Ajouter le domaine dans Cloudflare

1. Cloudflare > **Add a domain** (ou « Ajouter un site ») > `tasyirerp.com` > « Quick scan for DNS records » > plan **Free**.
2. Cloudflare importe la zone actuelle. Comparer avec le tableau ci-dessous et corriger.

### Enregistrements à garder (e-mails OVH) : nuage **gris** (« DNS only »)

| Type | Nom | Contenu | Priorité / détails |
|---|---|---|---|
| MX | `@` | `mx0.mail.ovh.net` | 1 |
| MX | `@` | `mx1.mail.ovh.net` | 5 |
| MX | `@` | `mx2.mail.ovh.net` | 50 |
| MX | `@` | `mx3.mail.ovh.net` | 100 |
| TXT | `@` | `v=spf1 include:mx.ovh.com ~all` | |
| CNAME | `ovhmo-selector-1._domainkey` | `ovhmo-selector-1._domainkey.5094535.jm.dkim.mail.ovh.net` | **DNS only** (gris) |
| CNAME | `ovhmo-selector-2._domainkey` | `ovhmo-selector-2._domainkey.5094536.jm.dkim.mail.ovh.net` | **DNS only** (gris) |
| SRV | `_autodiscover._tcp` | `zimbra1.mail.ovh.net` | priorité 0, poids 0, port 443 |

Les deux CNAME DKIM doivent impérativement être en **DNS only** : en mode proxy (nuage orange), la signature des e-mails ne fonctionne plus.

### Enregistrements à supprimer

| Type | Nom | Contenu | Pourquoi |
|---|---|---|---|
| A | `@` | `213.186.33.5` | ancienne page OVH ; Cloudflare Pages le remplacera |
| A | `www` | `213.186.33.5` | idem |
| CNAME ou A | `ftp` | `tasyirerp.com` / `213.186.33.5` | inutile (pas d'hébergement OVH utilisé) |
| TXT | `@` et `www` | `1|www.tasyirerp.com`, `3|welcome` | marqueurs de la page par défaut OVH |

### Enregistrement conseillé en plus

| Type | Nom | Contenu |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@tasyirerp.com` |

Il protège le domaine contre l'usurpation et améliore la délivrabilité des e-mails du formulaire.

3. Cloudflare affiche **deux serveurs de noms** (du type `xxx.ns.cloudflare.com` et `yyy.ns.cloudflare.com`). Les noter.

## Étape 2. Changer les serveurs DNS chez OVH

1. Espace client OVH > **Web Cloud** > **Noms de domaine** > `tasyirerp.com` > onglet **Serveurs DNS**.
2. **Modifier les serveurs DNS** > remplacer `dns200.anycast.me` et `ns200.anycast.me` par les deux serveurs Cloudflare > Appliquer la configuration.
3. Attendre que Cloudflare passe le domaine en **Active** (souvent moins d'une heure, jusqu'à 24 h). Cloudflare envoie un e-mail.

Pendant la bascule, le site et les e-mails continuent de fonctionner : les deux zones contiennent les mêmes enregistrements de messagerie.

## Étape 3. Brancher le domaine sur Cloudflare Pages

1. Cloudflare > Workers & Pages > `tasyirerp-website` > **Custom domains** > Set up a custom domain > `tasyirerp.com` > Activate. Cloudflare crée l'enregistrement tout seul.
2. Recommencer avec `www.tasyirerp.com`.
3. Attendre « Active » sur les deux (certificat HTTPS compris, quelques minutes).

## Étape 4. Rediriger www vers le domaine principal

Cloudflare > `tasyirerp.com` > **Rules** > **Redirect Rules** > Create rule > modèle **« Redirect from WWW to Root »** (ou à la main) :

- Si : Hostname égal à `www.tasyirerp.com`
- Alors : Dynamic redirect, expression `concat("https://tasyirerp.com", http.request.uri.path)`, code **301**, conserver la query string.

## Étape 5. Réglages de sécurité Cloudflare

- SSL/TLS > Overview : **Full (strict)**.
- SSL/TLS > Edge Certificates : **Always Use HTTPS** activé, **Automatic HTTPS Rewrites** activé.
- Les en-têtes de sécurité du site (CSP, HSTS…) sont déjà dans `public/_headers` : rien à ajouter.

## Étape 6. Vérifications

- [ ] https://tasyirerp.com s'affiche, avec le cadenas.
- [ ] https://www.tasyirerp.com redirige vers https://tasyirerp.com.
- [ ] http://tasyirerp.com redirige vers https.
- [ ] Recevoir un e-mail sur contact@tasyirerp.com depuis une adresse extérieure (Gmail par exemple).
- [ ] Envoyer un e-mail depuis contact@tasyirerp.com vers une adresse extérieure.
- [ ] Envoyer une demande depuis le formulaire du site : elle arrive sur contact@tasyirerp.com.

## Étape 7. Référencement

1. Google Search Console > Ajouter une propriété > **Domaine** > `tasyirerp.com`. Google donne un enregistrement TXT : l'ajouter dans Cloudflare (DNS, nom `@`), puis Valider.
2. Search Console > **Sitemaps** > `sitemap.xml` > Envoyer.
3. Bing Webmaster Tools > Importer depuis Google Search Console.

## En cas de problème

- **Les e-mails n'arrivent plus** : vérifier dans Cloudflare > DNS que les 4 MX sont présents, puis les deux CNAME DKIM en « DNS only ».
- **Retour en arrière** : chez OVH, remettre les serveurs DNS `dns200.anycast.me` et `ns200.anycast.me`. L'ancienne zone OVH est conservée.
- **Le formulaire échoue** : il ne dépend pas des DNS (connexion directe à `ssl0.ovh.net`). Voir Cloudflare > projet > Deployments > Functions > Real-time logs.
