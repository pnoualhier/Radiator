# Documentation des Sources Radiologiques — RADIATOR

Ce document recense les spécifications techniques, juridiques et opérationnelles des réseaux de surveillance radiologique intégrés ou prévus dans l'application **Radiation France (RADIATOR)**.

---

## 1. Téléray (ASNR / IRSN) — Implémenté (MVP)

* **Nom** : Téléray
* **Organisme responsable** : Autorité de Sûreté Nucléaire et Radioprotection (ASNR, anciennement ASN et IRSN)
* **Périmètre** : France métropolitaine et Corse (plus de 400 balises fixes)
* **Grandeur mesurée** : Débit d'équivalent de dose ambiant gamma ($H^*(10)$)
* **Unité d'origine** : nSv/h (nanoSievert par heure) ou µSv/h
* **Unité normalisée interne** : `nSv/h`
* **Fréquence de mesure** : Télé-mesure automatique toutes les 10 à 60 minutes
* **Type de capteurs** : Compteurs Geiger-Müller à compensation d'énergie et chambres d'ionisation / compteurs proportionnels haute sensibilité
* **URL officielle** : <https://teleray.irsn.fr>
* **Type d'accès** : Données publiques / API REST JSON
* **Licence** : Licence Ouverte v2.0 (Open Data État français)
* **Authentification** : Aucune clé requise pour la consultation des données publiques
* **Statut dans l'application** : **ACTIF (Source institutionnelle de référence)**
* **Dernière vérification** : Octobre 2026

---

## 2. EURDEP (European Radiological Data Exchange Platform)

* **Nom** : EURDEP
* **Organisme responsable** : Commission Européenne — Direction Générale Joint Research Centre (DG JRC)
* **Périmètre** : Union Européenne et pays voisins (37 pays participants, > 5500 stations)
* **Grandeur mesurée** : Gamma dose rate
* **Unité d'origine** : nSv/h ou nGy/h
* **Fréquence de mesure** : 1 heure à 2 heures
* **URL officielle** : <https://remap.jrc.ec.europa.eu>
* **Licence** : EU Open Data / European Commission
* **Authentification** : Accès public REST via REMAP API
* **Statut dans l'application** : Structure de connecteur prête (`EURDEPConnector`), activation prévue lors de l'extension européenne

---

## 3. OpenRadiation — Sciences Participatives

* **Nom** : OpenRadiation
* **Organisme responsable** : Consortium IRSN, Sorbonne Université, ANCCLI, FabLab Planète Sciences
* **Périmètre** : Mondial avec forte densité en France
* **Grandeur mesurée** : Débit de dose gamma ambiant et comptage
* **Unité d'origine** : µSv/h ou cpm (counts per minute)
* **Fréquence de mesure** : Événementielle et temps réel selon les capteurs connectés des citoyens
* **URL officielle** : <https://openradiation.org>
* **Licence** : Open Database License (ODbL)
* **Authentification** : Clé API partenaire
* **Statut dans l'application** : Structure prête (`OpenRadiationConnector`), distinction claire "Données Citoyennes"

---

## 4. Safecast

* **Nom** : Safecast
* **Organisme responsable** : Safecast Global (ONG)
* **Périmètre** : Mondial (capteurs mobiles bGeigie Nano et fixes Pointcast)
* **Grandeur mesurée** : Comptage gamma (CPM) et débit de dose estimé
* **Unité d'origine** : CPM et µSv/h
* **URL officielle** : <https://api.safecast.org>
* **Licence** : Creative Commons Zero (CC0 1.0 Universal)
* **Authentification** : API ouverte
* **Statut dans l'application** : Structure prête (`SafecastConnector`), activation sur demande
