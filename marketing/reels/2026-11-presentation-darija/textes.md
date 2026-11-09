# Reel « Tasyir ERP en darija » : textes, prompts et contrôles

- Format : 9:16, 1080 × 1920, 30 i/s, 32,1 s, H.264 + AAC, -14 LUFS.
- Thème : sombre du site (fond #0B1120 → #10203A, grille cyan, halos cyan #55CFEA et magenta #EE2E78), polices du site (Inter, IBM Plex Sans Arabic).
- Public : dirigeants, comptables et RH d'entreprises algériennes qui fabriquent (catering, usines, agroalimentaire). Darija, tutoiement.
- Objectif : demandes de démo sur le site.
- Lien en bio : `https://tasyirerp.com/?utm_source=instagram&utm_medium=bio&utm_campaign=reel_presentation_darija`
  (TikTok : `utm_source=tiktok`, YouTube : `utm_source=youtube`, même `utm_medium=bio`)

## Faits utilisés, tous repris du site tasyirerp.com

| Ce qui est dit ou montré | Source sur le site |
|---|---|
| Production, stock, paie… dans un seul logiciel | Accueil : « Production, achats, stock, comptabilité et paie dans un seul logiciel » |
| G50, IRG, CNAS générés automatiquement | Accueil : « La G50, l'IRG, la CNAS et les fiches de paie sont générées automatiquement » |
| La paie calculée en une fois pour tout l'effectif | Points forts : « Paie calculée en une fois… pour tout l'effectif » |
| Période verrouillée après clôture | Points forts : « Périodes verrouillées » |
| Acheter seulement ce qu'il faut, zéro stock inutile, besoin réel | Points forts : « Zéro stock inutile… Vous n'achetez que ce qui sera consommé » |
| +1 an en entreprise | « +1 an d'utilisation en entreprise » |
| Données en Algérie possible | Sécurité : « Hébergement en Algérie possible » |
| Export garanti | Sécurité : « Export garanti » |
| « L'ERP algérien des entreprises qui fabriquent » | Titre de l'accueil |

Volontairement absents : prix, nom d'El Afia Catering (son accord écrit n'est pas encore coché dans A-COMPLETER.md), effectifs, chiffres du client, option IA.

## Voix off (darija en lettres arabes, mots français en lettres latines)

Voix ElevenLabs « Ben Chamsou » (accent algérien), modèle eleven_v3, stabilité 50 %, similarité 78 %, vitesse 1,0. Une phrase par fichier, 3 prises par phrase, prise retenue = la plus fidèle à la transcription automatique.

| # | Début | Balise | Texte envoyé | Fichier |
|---|---|---|---|---|
| 1 | 0,15 s | [curious] | الـ G50 والـ paie، مازال تحسبهم بالـ Excel؟ | voix/p01.wav |
| 2 | 3,17 s | [confident] | مع Tasyir ERP، الـ stock، الـ production والـ paie، في logiciel واحد. | voix/p02.wav |
| 3 | 8,11 s | [confident] | واحد: الـ G50، الـ IRG والـ CNAS، يخرجو automatiquement. | voix/p03.wav |
| 4 | 12,62 s | [confident] | زوج: la paie تتحسب مرة وحدة، لقاع الخدامين. | voix/p04.wav |
| 5 | 16,12 s | [confident] | تلاتة: تشري غير واش يلزمك، بلا stock زايد. | voix/p05.wav |
| 6 | 20,47 s | [warm] | مخدوم بيه في entreprise من كثر من عام، و les données تاعك تقدر تبقى في الدزاير. | voix/p06.wav |
| 7 | 26,31 s | [proud, announcing] | Tasyir ERP. | voix/p07.wav |
| 8 | 28,36 s | [confident] | أطلب ديمو، الرابط كاين في البيو. | voix/p08.wav |

Choix faits en route :
- Nom de marque : 3 écritures testées (`tests-nom/`). « Tasyir ERP » en lettres latines est le mieux reconnu (« تسيير ERP » en arabe est lu « E20 »). Gardé partout.
- « besoin réel » était avalé 3 fois sur 3 : remplacé par « بلا stock زايد » (même idée, phrase du site « zéro stock inutile »).
- « يخرجو وحدهم » était lu « كيخرج واحد » : remplacé par « يخرجو automatiquement ».
- « طلب démo، le lien في la bio » était illisible 7 fois sur 7 : réécrit tout en lettres arabes (« أطلب ديمو، الرابط كاين في البيو »).
- Silences coupés à -60 dB, 0,12 s de marge en fin de phrase. Découpage fait dans l'audio, pas d'après les horodatages de l'API.

## Sous-titres (blocs de 6 mots maximum, au-dessus des 400 px du bas)

1. الـG50 والـpaie،
2. مازال تحسبهم بالـExcel؟
3. مع Tasyir ERP،
4. الـstock، الـproduction والـpaie،
5. في logiciel واحد.
6. واحد: الـG50، الـIRG والـCNAS،
7. يخرجو automatiquement.
8. زوج: la paie تتحسب مرة وحدة،
9. لقاع الخدامين.
10. تلاتة: تشري غير واش يلزمك،
11. بلا stock زايد.
12. مخدوم بيه في entreprise
13. من كثر من عام،
14. و les données تاعك
15. تقدر تبقى في الدزاير.
16. Tasyir ERP.
17. أطلب ديمو،
18. الرابط كاين في البيو.

Un fichier `sous-titres.srt` accompagne la vidéo (pour TikTok / YouTube, ou pour vérifier).

## Plans et textes à l'écran

| Temps | Plan | Texte à l'écran | Animation et bruitages |
|---|---|---|---|
| 0 – 3,05 s | Accroche | الـG50 والـpaie / مازال بـ **Excel** ؟ (Excel barré en magenta) | Tableur qui défile (formules et erreurs génériques, aucun chiffre), glitch RVB, secousse ; glitch, whoosh, glissement sur la rature |
| 3,05 – 8 s | Un seul logiciel | Logo, puis 6 modules (Production, Stock, Paie, Comptabilité, Achats, Commercial) qui se branchent sur le symbole ; « logiciel واحد » | Impact sur le logo, pop par module, liaisons en pointillés, montée vers la coupe ; image d'ambiance cuisine en fond |
| 8 – 12,5 s | **1** الـG50 تخرج وحدها | Téléphone : carte « G50 · Octobre 2026 », 5 lignes qui passent au vert, tampon « Prête à déposer » | Toucher sur « Générer la G50 », zoom sur la carte, pop par ligne, tampon |
| 12,5 – 16 s | **2** la paie في مرة وحدة | Téléphone : anneau 0 → 100 %, Pointage / IRG et CNAS / Fiches de paie, « Clôturer la période » → « Période verrouillée » | Pops, toucher, tampon |
| 16 – 20,35 s | **3** تشري غير واش يلزمك | Barres « Au cas où » contre « Besoin réel », excédent hachuré « stock زايد ✕ », « Zéro stock inutile » | Glissements, glitch sur l'excédent ; image d'ambiance usine en fond |
| 20,35 – 26,2 s | Preuve | « +1 عام في entreprise », puis Conforme G50 · IRG · CNAS / Hébergement en Algérie possible (surligné) / Export de vos données garanti | Impact léger, glissements, montée |
| 26,2 – 32,1 s | Fin | Logo avec reflet, « L'ERP algérien des entreprises qui fabriquent », bouton « Demander une démo », « tasyirerp.com · الرابط في la bio ↑ » | Gros impact, toucher sur le bouton, impact final |

Les écrans du téléphone reprennent les maquettes stylisées du site (même règle que le site : pas d'écran de production, aucun montant, aucune donnée personnelle). Il n'y a donc rien à flouter.

## Légende Instagram / TikTok

> الـG50، الـIRG والـCNAS… مازال بالـExcel؟ 😮‍💨
> Tasyir ERP يجمعلك production، stock، comptabilité و paie في logiciel واحد، conforme للـréglementation الجزايرية.
> ✅ G50، IRG و CNAS يخرجو automatiquement
> ✅ la paie تتحسب مرة وحدة لقاع الخدامين
> ✅ تشري غير واش يلزمك، بلا stock زايد
> 🇩🇿 Hébergement en Algérie possible · export de vos données garanti
>
> 👉 أطلب démo على حالة الشركة تاعك : الرابط في la bio.
>
> Voix off et images d'ambiance générées par IA.
>
> #ERP #Algérie #G50 #PaieAlgérie #Industrie

Sur Instagram, activer l'étiquette « Info IA » (voix et images de fond générées) à la publication. Sur TikTok : « Contenu généré par l'IA ». Sur YouTube Shorts : cocher « Contenu modifié ou synthétique ».

## Prompts des visuels générés (Ideogram 4.5, 1440 × 2560)

1. `ambiance/cuisine.png` : Cinematic photograph of an empty industrial central kitchen at night, long rows of brushed stainless steel counters and large cooking kettles, very dark navy atmosphere, cool cyan rim light reflecting on the steel, subtle magenta accent glow in the far background, light haze, shallow depth of field, low angle, moody and powerful, vertical 9:16 composition with empty dark space in the upper third. No people, no text, no signs, no logos, no labels.
2. `ambiance/usine.png` : Cinematic photograph of an empty modern food production line in a factory at night, stainless steel conveyor belts and machinery receding into the distance, very dark navy atmosphere, cool cyan rim light on metal edges, subtle magenta accent glow in the background, light haze, shallow depth of field, low angle, moody and powerful, vertical 9:16 composition with empty dark space in the upper third. No people, no text, no signs, no logos, no labels.

Son (ElevenLabs) :
- Musique (`music`, instrumentale forcée, 34 s) : Dark cinematic electronic trap beat for a tech product launch, instrumental only, no vocals, punchy 808 sub bass, crisp hi-hats, tense synth arpeggio, subtle North African percussion (darbuka), 100 BPM, confident and badass, builds to a strong hit at the end.
- Bruitages (`sound-generation`) : whoosh, tap, pop, impact, riser, glitch, stamp, swipe (prompts dans `sons/prompts.txt`).

## Contrôles faits

- Images de contrôle à 8 instants (`controle/`) : aucun texte dans les 250 px du haut ni les 400 px du bas, aucun débordement, sous-titres réduits automatiquement s'ils dépassent 940 px.
- Arabe : liaisons et sens droite-gauche corrects, mots latins bien placés dans la phrase.
- Couverture : titre et logo dans la zone 3:4 du profil (y 240 à 1680).
- Volume final : -13,9 LUFS intégré, crête vraie -1,6 dBFS.
- Transcription automatique (ElevenLabs Scribe) de la piste finale : les 8 phrases sont présentes et complètes, dans l'ordre. Texte obtenu :
  « لـ J50 والـ pay ما زال تحسبهم بالـ Excel؟ مع Tasiri ERP, الـ stock, الـ production, والـ pays في logiciel واحد. واحد، لـ J50، الـ IRG، والـ CNAS يخرجوا automatically. زوج، الـ pay تحسب مرة وحدة، كل خدامين. تلاتة، تشتري غير واش يزمك، بلا stock زايد. مخدمين به في entreprises من كتر من عام، وles données تاعك تقدر تبقى في الزهر. Tasiri ERP. اطلب demo. الرابط كاين في bio. [موسيقى] »
  Le transcripteur lit mal la darija (« الزهر » pour « الدزاير », « pay » pour « paie ») : c'est justement ce qu'un locuteur natif doit confirmer à l'oreille.

## À vérifier à l'œil et à l'oreille avant de publier

1. **Faire écouter par un locuteur algérien** : prononciation de « Tasyir ERP », « تلاتة », « لقاع الخدامين », « الدزاير », « البيو ». Si un mot sonne faux, régénérer cette seule phrase (une phrase = un fichier).
2. Choisir à l'oreille l'écriture du nom de marque (`tests-nom/nom_a/b/c.mp3`) ; la B (« Tasyir ERP ») est utilisée.
3. Images d'ambiance : regarder les deux images en plein écran (pas de texte parasite, pas de forme déformée).
4. Chiffre « +1 an en entreprise » : confirmer qu'il est toujours d'actualité.
5. Vérifier que le lien en bio pointe bien vers la page avec les paramètres UTM.
6. Activer l'étiquette « Info IA » à la publication.

## Fichiers

-  : vidéo finale (1080 × 1920, 30 i/s, 32,1 s, son -14 LUFS).
-  : couverture (titre et logo dans la zone 3:4).
-  : sous-titres horodatés.
-  : voix off complète, et une phrase par fichier (p01 à p08).
-  : les 3 écritures testées du nom de marque.
-  : les 7 plans bruts, sans son.
-  : les 2 images générées.
-  : musique et bruitages générés, avec leurs prompts.
-  : images de contrôle et planche avec les zones interdites en rouge.
-  : animation (, rendue image par image avec ), mixage (), voix (, , ). Pour refaire le rendu, placer à côté de  les polices et logos de , et les images d'ambiance dans .
