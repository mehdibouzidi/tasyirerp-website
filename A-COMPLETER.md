# À compléter avant la mise en ligne

Retrouver tous les champs restants :

```bash
grep -rn "\[[A-ZÉÈ]" public --include=*.html
```

Les champs à compléter sont surlignés en jaune sur les pages tant qu'ils ne sont pas remplis.

## 1. Formulaire de demande de démo

- [ ] Choisir où arrivent les demandes : e-mail (Resend) ou webhook. Voir « Brancher le formulaire » dans le README.
- [ ] Renseigner les variables Cloudflare : `RESEND_API_KEY`, `DEMO_TO_EMAIL`, `DEMO_FROM_EMAIL` et/ou `FORM_WEBHOOK_URL`.
- [ ] Faire un envoi de test après la mise en ligne et vérifier la réception.

## 2. Coordonnées (pied de page de `public/index.html`)

- [ ] `[E-MAIL DE CONTACT]`
- [ ] `[TÉLÉPHONE]`
- [ ] `[VILLE, WILAYA]`

## 3. Mentions légales (`public/mentions-legales/index.html`)

- [ ] `[DATE]` de mise à jour
- [ ] `[RAISON SOCIALE]`
- [ ] `[FORME JURIDIQUE, CAPITAL SOCIAL]`
- [ ] `[ADRESSE]` du siège
- [ ] `[NIF/RC]`
- [ ] `[NIS, AI]`
- [ ] `[NOM DU RESPONSABLE]` (directeur de la publication)
- [ ] `[E-MAIL DE CONTACT]` et `[TÉLÉPHONE]`
- [ ] `[HÉBERGEUR]` (Cloudflare par défaut ; ajuster si le site est hébergé ailleurs)

## 4. Politique de confidentialité (`public/confidentialite/index.html`)

- [ ] `[DATE]`
- [ ] `[RAISON SOCIALE]`, `[ADRESSE]`, `[NIF/RC]`, `[E-MAIL DE CONTACT]`
- [ ] `[NUMÉRO DE RÉCÉPISSÉ OU D'AUTORISATION ANPDP]` : déclaration du traitement auprès de l'ANPDP
- [ ] `[HÉBERGEUR]` et `[SERVICE D'ENVOI DU FORMULAIRE]` (ex. Cloudflare, Resend)
- [ ] `[À CONFIRMER SELON L'HÉBERGEUR RETENU]` : transfert des données hors d'Algérie (articles 44 et 45 de la loi 18-07)
- [ ] `[DURÉE, par exemple 3 ans]` de conservation des demandes
- [ ] Faire relire la page par un juriste.

## 5. Nom de domaine

- [ ] Confirmer le domaine. Le site utilise `https://tasyirerp.com` (canonical, sitemap, Open Graph, données structurées, robots.txt). Commande de remplacement dans le README.
- [ ] Déclarer le sitemap dans Google Search Console et Bing Webmaster Tools.

## 6. Photos

Les trois photos des secteurs sont des illustrations sous licence libre (Wikimedia Commons), créditées sur `/credits/`. Elles ne montrent ni des clients ni vos locaux.

- [ ] Idéalement, les remplacer par vos propres photos (cuisine collective, atelier de production, ligne agroalimentaire), sans client reconnaissable ni marque visible, puis mettre à jour `/credits/`.

## 7. Référence client El Afia Catering

- [ ] Obtenir l'accord écrit d'El Afia Catering pour être cité comme client de référence (nom, lien vers son site, chiffres repris de son site : depuis 2002, jusqu'à 5 000 repas par jour, 15 sites).
- [ ] Vérifier que ces chiffres sont toujours à jour sur elafiacatering.com.
- [ ] En option, avec leur accord : leur logo et une citation signée (nom, fonction) à ajouter dans la section « Client de référence ».

## 8. Relecture

- [ ] Relire la FAQ, en particulier la réponse sur la conformité (G50, IRG, CNAS) et celle sur l'hébergement en Algérie.
- [ ] Vérifier que les engagements de la section Sécurité (sauvegardes, export, isolation des données) correspondent au contrat.
