# Catalogue des captures d’écran

Toutes les images de démonstration ci-dessous proviennent de l’application locale et ont été capturées en mode **DÉMO**. Les mesures, graphiques et noms de stations éventuellement visibles sont illustratifs et ne sont pas des relevés officiels. Ne pas les utiliser pour communiquer des niveaux radiologiques réels.

## Captures publiées

| Fichier | Dimensions | Contenu et avertissements | Réutilisation conseillée |
|---|---:|---|---|
| [`overview/dashboard-demo.jpg`](screenshots/overview/dashboard-demo.jpg) | 1440 × 520 | Bandeau d’accueil en mode DÉMO, avec avertissement de données simulées visible. | Image d’en-tête ou aperçu du produit ; conserver le contexte de démonstration. |
| [`desktop/dashboard-light-demo.jpg`](screenshots/desktop/dashboard-light-demo.jpg) | 1440 × 520 | En-tête du tableau de bord en thème clair, mode DÉMO. | Aperçu desktop du tableau de bord ; légender explicitement comme démonstration. |
| [`desktop/station-comparison-demo.jpg`](screenshots/desktop/station-comparison-demo.jpg) | 1440 × 1000 | Comparateur de stations et séries du jeu d’essai ; avertissement du mode DÉMO visible. | Illustrer les capacités d’interface de comparaison uniquement, pas une tendance radiologique réelle. |
| [`desktop/system-settings.jpg`](screenshots/desktop/system-settings.jpg) | 1440 × 1000 | Fenêtre des paramètres système. Les informations de version/date affichées sont des valeurs locales de l’interface et ne certifient pas un déploiement. | Aperçu des paramètres ; ne pas utiliser comme preuve de version publiée. |
| [`desktop/station-card-demo.jpg`](screenshots/desktop/station-card-demo.jpg) | 610 × 139 | Recadrage d’une carte de station issue d’une fixture Téléray de démonstration. Le recadrage ne contient pas la bannière DÉMO. | Utilisation seulement avec une légende immédiatement visible telle que « carte de démonstration — valeur simulée ». Ne pas présenter isolément. |
| [`mobile/dashboard-demo.jpg`](screenshots/mobile/dashboard-demo.jpg) | 390 × 650 | En-tête mobile en mode DÉMO, avertissements sur les données simulées visibles. | Aperçu mobile ; préserver les avertissements dans tout recadrage. |

Les images `dashboard-demo.jpg` et `dashboard-light-demo.jpg` sont deux captures distinctes du même type d’écran ; privilégier l’une d’elles plutôt que de suggérer qu’il s’agit de deux pages ou de deux états de données différents.

## Captures écartées

- **Carte complète et liste des stations** : ces vues exposaient des valeurs non vérifiées et des données locales, sans contexte de provenance suffisant.
- **Page des sources** : certains statuts et affirmations visibles ne concordaient pas avec les connecteurs et réponses observés à l’exécution.
- **Détail d’une station** : la vue locale échouait pendant l’audit (`validationStatus` non défini). Une capture d’un écran défaillant ou d’un résultat incomplet serait trompeuse.
- **Chronologie et registre d’alertes** : les entrées sont intégrées ou initialisées localement ; elles n’ont pas été vérifiées comme flux historique ou alerte officielle en direct.
- **Installation PWA sur iOS** : la capture tentée était visuellement tronquée ; le service worker est désactivé en développement, donc la capture ne démontrerait pas le fonctionnement hors connexion en production.

## Provenance et intégrité

Ces captures documentent l’apparence de l’interface dans un environnement local d’audit, pas l’état d’un déploiement. Elles ne valident pas la connexion aux sources distantes, la fraîcheur des données, les compteurs d’exploitation ou les conditions de fonctionnement hors connexion. Toute capture future de données réelles devra conserver l’attribution de la source, l’horodatage et les limites de mesure visibles, et éviter les secrets ou données personnelles.
