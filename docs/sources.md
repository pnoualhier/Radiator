# Sources radiologiques

Ce document distingue les sources et connecteurs présents dans le dépôt des flux effectivement disponibles dans l'application. La présence d'un connecteur, d'une station ou d'une valeur dans l'interface ne confirme ni l'accès à une API, ni la fraîcheur, ni la provenance d'une mesure.

## État des intégrations observées

Le parcours frontend par défaut passe par le serveur Express de `server.ts`. Le backend Python sous `backend/` est séparé et n'est pas démarré par `npm run dev`. Les états de connexion peuvent varier selon l'environnement, la disponibilité des services et leur configuration.

| Source | Implémentation observée | Ce que l'on peut conclure |
|---|---|---|
| **Téléray — ASNR** | Le serveur tente d'obtenir un catalogue de stations. Aucun flux direct de mesures Téléray n'est confirmé par cette intégration. Des fixtures locales sont identifiées comme simulées. | L'existence d'une station Téléray dans le catalogue ne signifie pas qu'une mesure actuelle est reçue. Les valeurs des fixtures sont des données de démonstration. |
| **OpenRadiation** | Connecteur de récupération directe dans le serveur frontend. Un état connecté a été observé lors d'une exécution locale, mais il dépend de la disponibilité et de la configuration du service. | Vérifier les métadonnées et le statut associés à chaque mesure. L'état constaté lors d'un test n'est pas une garantie permanente. |
| **Safecast** | Connecteur présent, avec données ou points locaux qui ne prouvent pas à eux seuls une récupération du flux distant. Le statut observé était déconnecté. | Ne pas qualifier les points ou valeurs locaux de mesures Safecast en direct sans provenance explicite. |
| **EURDEP** | Connecteur présent dans le backend Python distinct ; aucune intégration frontend par défaut en direct n'est confirmée. L'accès peut être restreint selon le service. | Les informations locales ne démontrent pas un accès aux mesures EURDEP. |
| **OPERA-Air** | Pages et structures de données présentes. Valeurs locales ou statiques repérées ; pas de connexion directe confirmée dans le frontend par défaut. | Ne pas présenter ces valeurs comme résultats actuels de laboratoire. |
| **HydroTéléray** | Pages et structures de données présentes. Valeurs locales ou statiques repérées ; pas de connexion directe confirmée dans le frontend par défaut. | Ne pas présenter ces valeurs comme mesures actuelles de l'eau. |

Les badges ou textes statiques de l'interface peuvent diverger du statut du serveur. Aucun compteur de synthèse codé en dur ne doit être interprété comme un nombre de sources ou de mesures actuellement opérationnelles.

## Références de publication et attribution

Les références suivantes identifient les organismes et services concernés. Elles ne constituent pas une approbation du projet ni une confirmation des conditions juridiques ou techniques actuelles. Vérifier les conditions de réutilisation auprès du producteur avant de redistribuer des données.

| Réseau | Référence | Attribution recommandée |
|---|---|---|
| Téléray, HydroTéléray, OPERA-Air | [ASNR](https://www.asnr.fr/) (anciennement ASN / IRSN) | Nommer l'ASNR et le réseau précis, avec horodatage lorsque disponible. Le dépôt ne confirme pas que chaque affichage provient d'un flux ASNR. |
| EURDEP | [Plateforme EURDEP du JRC](https://remap.jrc.ec.europa.eu/) | Nommer EURDEP et le Joint Research Centre de la Commission européenne ; documenter les transformations. |
| OpenRadiation | [OpenRadiation](https://openradiation.org/) | Citer le service et ses contributeurs. Le dépôt fait référence à ODbL ; confirmer la licence applicable aux données utilisées. |
| Safecast | [Safecast](https://safecast.org/) | Citer Safecast et confirmer les conditions de la ressource exacte. Le dépôt mentionne CC0, sans preuve suffisante ici pour garantir que cela couvre chaque donnée. |
| Fond cartographique | [OpenStreetMap](https://www.openstreetmap.org/copyright) | Conserver l'attribution « © Contributeurs OpenStreetMap » et respecter les conditions du fournisseur de tuiles. |

## Mesures, unités et interprétation

Les réseaux peuvent mesurer des grandeurs différentes et publier des unités ou pas de temps différents. Une conversion d'unité n'harmonise pas nécessairement les protocoles, les instruments, les conditions de mesure ou la qualité des observations. Comparer des valeurs exige d'indiquer leur grandeur, unité, source, heure d'observation et éventuel traitement.

Une valeur mise en cache peut être ancienne ; une valeur de démonstration est synthétique ; un point interpolé est une estimation. Aucun de ces éléments ne doit être présenté comme une mesure actuelle sans preuve de provenance et d'horodatage.

## Audit et limites de vérification

Les constats ci-dessus décrivent le code local audité et une exécution de développement. Ils ne certifient pas la disponibilité actuelle des services externes ni le comportement d'un déploiement. La page de détail d'une station a échoué pendant l'audit local, et l'application de référence distante a également rencontré une erreur lors de sa navigation. En conséquence, aucun relevé, seuil, historique d'événement ou état de production n'est certifié par cette documentation.
