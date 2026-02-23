# Telecom Offers API / API des Offres Télécom

---

## English

### Overview

This project is a **Telecom Offers Management System** that allows telecom operators to manage offers, options, customer profiles, and run simulations to compare offers for different customer profiles.

### Features / Fonctionnalités

- **Offers Management** - Create, read, update, and delete telecom offers
- **Customer Profiles** - Manage customer profiles with usage patterns
- **Options** - Create additional options that can be added to offers
- **Offer-Options Linking** - Associate options with offers
- **Simulations** - Run simulations to calculate costs and satisfaction scores
- **Recommendations** - Get smart offer recommendations based on customer profiles
- **Comparison** - Compare multiple offers for a specific customer profile
- **Batch Analysis** - Analyze how an offer performs across multiple profiles

### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MySQL
- **Frontend**: React + Vite
- **API Documentation**: Swagger UI

### Project Structure

```
project_pfe/
├── backend/
│   ├── config/
│   │   └── database.js       # Database connection
│   ├── routes/
│   │   ├── offers.js         # Offers API endpoints
│   │   ├── customer_profiles.js
│   │   ├── options.js
│   │   ├── offer_options.js
│   │   └── simulation.js      # Simulation endpoints
│   ├── server.js              # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages
│   │   ├── services/         # API services
│   │   └── App.jsx
│   └── package.json
└── database/
    └── donnees_fictives_offres_telecom_300_clients.sql
```

### Installation & Setup

#### Prerequisites

- Node.js (v14+)
- MySQL

#### 1. Database Setup

```sql
-- Create database
CREATE DATABASE telecom_db;

-- Import data
mysql -u root -p telecom_db < database/donnees_fictives_offres_telecom_300_clients.sql
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=telecom_db
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

The API will be available at: http://localhost:5000

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: http://localhost:5173

### API Documentation (Swagger)

Once the backend is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **JSON Spec**: http://localhost:5000/api-docs.json

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/offers | Get all offers |
| GET | /api/offers/:id | Get offer by ID |
| POST | /api/offers | Create new offer |
| PUT | /api/offers/:id | Update offer |
| DELETE | /api/offers/:id | Delete offer |
| GET | /api/customer-profiles | Get all profiles |
| POST | /api/customer-profiles | Create profile |
| GET | /api/options | Get all options |
| POST | /api/options | Create option |
| POST | /api/simulation | Run simulation |
| POST | /api/simulation/recommend | Get recommendations |
| POST | /api/simulation/compare | Compare offers |
| POST | /api/simulation/batch | Batch analysis |

### Simulation Logic

The system calculates:
1. **Total Cost** = Base Price + Overage Costs + Roaming Costs - Discounts
2. **Satisfaction Score** (0-100) based on:
   - Price vs Budget ratio
   - Segment quality (BUSINESS > POSTPAID > PREPAID)
   - Number of included options
   - Fair use penalties
   - Overage penalties

---

## Français

### Présentation

Ce projet est un **Système de Gestion des Offres Télécom** qui permet aux opérateurs de gérer des offres, des options, des profils clients et d'exécuter des simulations pour comparer les offres pour différents profils clients.

### Fonctionnalités

- **Gestion des Offres** - Créer, lire, mettre à jour et supprimer des offres telecom
- **Profils Clients** - Gérer des profils clients avec des patterns d'utilisation
- **Options** - supplémentaires pouvant être ajoutées aux offres
- ** Créer des optionsLiaison Offres-Options** - Associer des options aux offres
- **Simulations** - Exécuter des simulations pour calculer les coûts et scores de satisfaction
- **Recommandations** - Obtenir des recommandations intelligentes basées sur les profils clients
- **Comparaison** - Comparer plusieurs offres pour un profil client spécifique
- **Analyse par Lot** - Analyser comment une offre se comporte sur plusieurs profils

### Stack Technologique

- **Backend**: Node.js + Express
- **Base de données**: MySQL
- **Frontend**: React + Vite
- **Documentation API**: Swagger UI

### Structure du Projet

```
project_pfe/
├── backend/
│   ├── config/
│   │   └── database.js       # Connexion à la base de données
│   ├── routes/
│   │   ├── offers.js         # Endpoints API des offres
│   │   ├── customer_profiles.js
│   │   ├── options.js
│   │   ├── offer_options.js
│   │   └── simulation.js      # Endpoints de simulation
│   ├── server.js              # Fichier principal du serveur
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # Pages React
│   │   ├── services/         # Services API
│   │   └── App.jsx
│   └── package.json
└── database/
    └── donnees_fictives_offres_telecom_300_clients.sql
```

### Installation & Configuration

#### Prérequis

- Node.js (v14+)
- MySQL

#### 1. Configuration de la Base de Données

```sql
-- Créer la base de données
CREATE DATABASE telecom_db;

-- Importer les données
mysql -u root -p telecom_db < database/donnees_fictives_offres_telecom_300_clients.sql
```

#### 2. Configuration du Backend

```bash
cd backend
npm install
```

Créez un fichier `.env` dans le répertoire backend:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=telecom_db
PORT=5000
```

Démarrez le serveur backend:

```bash
npm run dev
```

L'API sera disponible sur: http://localhost:5000

#### 3. Configuration du Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur: http://localhost:5173

### Documentation API (Swagger)

Une fois le backend démarré, visitez:
- **Swagger UI**: http://localhost:5000/api-docs
- **JSON Spec**: http://localhost:5000/api-docs.json

### Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/offers | Obtenir toutes les offres |
| GET | /api/offers/:id | Obtenir une offre par ID |
| POST | /api/offers | Créer une nouvelle offre |
| PUT | /api/offers/:id | Mettre à jour une offre |
| DELETE | /api/offers/:id | Supprimer une offre |
| GET | /api/customer-profiles | Obtenir tous les profils |
| POST | /api/customer-profiles | Créer un profil |
| GET | /api/options | Obtenir toutes les options |
| POST | /api/options | Créer une option |
| POST | /api/simulation | Exécuter une simulation |
| POST | /api/simulation/recommend | Obtenir des recommandations |
| POST | /api/simulation/compare | Comparer des offres |
| POST | /api/simulation/batch | Analyse par lot |

### Logique de Simulation

Le système calcule:
1. **Coût Total** = Prix de Base + Coûts de Dépassement + Coûts de Roaming - Remises
2. **Score de Satisfaction** (0-100) basé sur:
   - Ratio Prix vs Budget
   - Qualité du segment (BUSINESS > POSTPAID > PREPAID)
   - Nombre d'options incluses
   - Pénalités d'utilisation équitable
   - Pénalités de dépassement

---

## License / Licence

ISC
