# Radiation France (RADIATOR) ☢️🇫🇷

**PWA de surveillance environnementale de la radioactivité en France (Téléray/ASNR-IRSN, EURDEP, OpenRadiation, Safecast).**

Application web progressive, mobile-first, sobre et scientifique permettant de consulter en direct et hors ligne les mesures radiologiques environnementales (débit de dose gamma ambiant en `nSv/h`).

---

## Fonctionnalités Principales

- 🗺️ **Carte interactive nationale** : Balises de mesure en France métropolitaine et Corse avec clustering dynamique, géolocalisation et filtres.
- 📡 **Données institutionnelles & citoyennes** : Distinction claire entre balises officielles (Téléray / ASNR-IRSN) et capteurs citoyens (OpenRadiation, Safecast).
- 📈 **Historiques & Statistiques** : Évolution temporelle (24h, 7j, 30j), calcul en direct du minimum, maximum, moyenne et médiane.
- 📱 **PWA Installable & Hors Ligne** : Fonctionne sans connexion réseau grâce au Service Worker et au cache persistant IndexedDB (Dexie).
- ⚠️ **Alertes Officielles** : Réservé exclusivement aux communications vérifiées des autorités de sûreté nucléaire.
- ℹ️ **Comprendre la Radioactivité** : Espace pédagogique expliquant les unités (`nSv/h`, `µSv/h`, `Bq`), le bruit de fond tellurique naturel, et le fonctionnement des détecteurs.

---

## Architecture

- **Backend** : Python 3.12+, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite (extensible PostgreSQL/PostGIS), Alembic, Pytest.
- **Frontend** : React 19, TypeScript strict, Vite, Tailwind CSS, Leaflet, react-leaflet, Recharts, Dexie (IndexedDB), `vite-plugin-pwa`.
- **Infrastructure** : Docker Compose multi-conteneur, reverse-proxy Nginx.

---

## Démarrage Rapide avec Docker Compose

```bash
# Cloner le repository
git clone https://github.com/radiator-france/radiation-france.git
cd radiation-france

# Démarrer le backend (FastAPI :8000) et le frontend (:3000)
docker compose up --build
```

Ouvrez ensuite votre navigateur sur : [http://localhost:3000](http://localhost:3000)
La documentation interactive de l'API FastAPI est disponible sur : [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Installation Locale (sans Docker)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt

# Initialiser et peupler la base avec les données de benchmark/démo
python -m app.seed

# Lancer le serveur de développement
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React / Vite PWA)

```bash
# À la racine du projet
npm install
npm run dev
```

---

## Tests

### Tests Backend (Pytest)
```bash
cd backend
pytest -v
```
Couvre :
- Normalisation des unités radiologiques (`µSv/h -> nSv/h`, `cpm`, etc.)
- Règles de validation qualité (rejet valeurs négatives, détection données périmées)
- Modèles et relations SQLAlchemy
- Connecteur Téléray et fixtures
- Endpoints de l'API FastAPI (`/stations`, `/measurements`, `/sources`, `/health`, etc.)

---

## Sources et Connecteurs Intégrés (4 Réseaux Actifs)

L'application exploite et normalise en temps réel les données de 4 réseaux radiologiques distincts :

1. **Téléray (ASNR / IRSN)** : Réseau institutionnel national officiel de surveillance continue en France (plus de 400 sondes permanentes). Débit de dose gamma ambiant en `nSv/h`.
2. **OpenRadiation (IRSN / Sorbonne Université / ANCCLI)** : Réseau participatif citoyen alimenté en direct via l'API REST `https://request.openradiation.net/measurements` (conversion automatique `µSv/h -> nSv/h`).
3. **EURDEP (Commission Européenne / DG JRC)** : Plateforme européenne d'échange de données radiologiques assurant la surveillance transfrontalière autour des frontières françaises (Allemagne BfS, Belgique FANC, Suisse ENSI, Espagne CSN, Luxembourg, Italie ISPRA).
4. **Safecast (Réseau citoyen mondial ouvert)** : Capteurs mobiles et fixes bGeigie Nano connectés via l'API `https://api.safecast.org`, convertis de CPM (Counts Per Minute) en `nSv/h` via le facteur d'étalonnage standard pancake GM tube (`334 CPM = 1 µSv/h`).

---

## Endpoints de l'API (`/api/v1`)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Diagnostic de santé du service et de la base |
| `GET` | `/api/v1/health/sources` | État de connectivité des sources radiologiques |
| `GET` | `/api/v1/stations` | Liste des stations avec filtres (bbox, distance, région) |
| `GET` | `/api/v1/stations/{id}` | Détail complet d'une station et dernières mesures |
| `GET` | `/api/v1/measurements/latest` | Dernière mesure vérifiée pour chaque station |
| `GET` | `/api/v1/stations/{id}/measurements` | Série temporelle historique d'une station |
| `GET` | `/api/v1/stations/{id}/statistics` | Calcul min, max, moyenne, médiane |
| `GET` | `/api/v1/sources` | Liste des organismes et réseaux de mesure |
| `GET` | `/api/v1/alerts` | Alertes officielles publiées par les autorités |
| `POST`| `/api/v1/admin/sync/teleray` | Déclenchement sécurisé d'une synchronisation |

---

## Licence

Licence MIT. Données de mesure soumises aux licences respectives des producteurs (Licence Ouverte v2.0 pour Téléray / IRSN).
