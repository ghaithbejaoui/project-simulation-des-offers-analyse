# Telecom Offers API / API des Offres Télécom

---

## English

### Overview

This project is a **Telecom Offers Management System** that allows telecom operators to manage offers, options, customer profiles, and run simulations to compare offers for different customer profiles. It includes user authentication with JWT tokens and role-based access control.

### Features / Fonctionnalités

- **Authentication** - JWT-based login system with ADMIN and ANALYST roles
- **Users Management** - Create and manage user accounts with role-based access
- **Offers Management** - Create, read, update, and delete telecom offers
- **Customer Profiles** - Manage customer profiles with usage patterns
- **Options** - Create additional options that can be added to offers
- **Offer-Options Linking** - Associate options with offers
- **Simulations** - Run simulations to calculate costs and satisfaction scores
- **Recommendations** - Get smart offer recommendations based on customer profiles
- **Comparison** - Compare multiple offers for a specific customer profile
- **Batch Analysis** - Analyze how an offer performs across multiple profiles
- **Dashboard Statistics** - View stats on offers, profiles, and segments

### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MySQL
- **Frontend**: React + Vite + Tailwind CSS
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **API Documentation**: Swagger UI

### User Roles / Rôles Utilisateurs

| Role | Description | Permissions |
|------|-------------|-------------|
| ADMIN | Administrator | Full access: CRUD all resources, manage users, export data |
| ANALYST | Analyst | CRUD offers/profiles, run simulations, compare, export |

### Project Structure

```
project_pfe/
├── backend/
│   ├── config/
│   │   └── database.js       # Database connection
│   ├── routes/
│   │   ├── auth.js           # Authentication (login)
│   │   ├── offers.js         # Offers API endpoints
│   │   ├── customer_profiles.js
│   │   ├── options.js
│   │   ├── offer_options.js
│   │   ├── simulation.js     # Simulation endpoints
│   │   └── stats.js         # Dashboard statistics
│   ├── server.js              # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages (Home, Login, Offers, etc.)
│   │   ├── services/         # API services
│   │   └── App.jsx           # Main app with routing
│   └── package.json
└── database/
    └── donnees_fictives_offres_telecom_300_clients.sql
```

### Installation & Setup

#### Prerequisites

- Node.js (v14+)
- MySQL
- XAMPP (or similar MySQL server)

#### 1. Database Setup

```sql
-- Create database
CREATE DATABASE telecom_db;

-- Import data
mysql -u root -p telecom_db < database/donnees_fictives_offres_telecom_300_clients.sql

-- Create users table
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'ANALYST') NOT NULL DEFAULT 'ANALYST',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default users (password: 123, hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@telecom.com', '$2b$10$...', 'ADMIN');
INSERT INTO users (username, email, password_hash, role) 
VALUES ('analyst', 'analyst@telecom.com', '$2b$10$...', 'ANALYST');
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
JWT_SECRET=your-super-secret-key-change-this
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

### Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@telecom.com | 123 | ADMIN |
| analyst@telecom.com | 123 | ANALYST |

### API Documentation (Swagger)

Once the backend is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **JSON Spec**: http://localhost:5000/api-docs.json

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/login | Login with email/password | No |
| GET | /api/offers | Get all offers | Yes |
| GET | /api/offers/:id | Get offer by ID | Yes |
| POST | /api/offers | Create new offer | Yes |
| PUT | /api/offers/:id | Update offer | Yes |
| DELETE | /api/offers/:id | Delete offer | Yes |
| GET | /api/customer-profiles | Get all profiles | Yes |
| GET | /api/customer-profiles/:id | Get profile by ID | Yes |
| POST | /api/customer-profiles | Create profile | Yes |
| GET | /api/options | Get all options | Yes |
| POST | /api/options | Create option | Yes |
| POST | /api/simulation | Run simulation | Yes |
| POST | /api/simulation/recommend | Get recommendations | Yes |
| POST | /api/simulation/compare | Compare offers | Yes |
| POST | /api/simulation/batch | Batch analysis | Yes |
| GET | /api/stats | Get dashboard statistics | Yes |

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

Ce projet est un **Système de Gestion des Offres Télécom** qui permet aux opérateurs de gérer des offres, des options, des profils clients et d'exécuter des simulations pour comparer les offres pour différents profils clients. Il inclut l'authentification par JWT et le contrôle d'accès par rôles.

### Fonctionnalités

- **Authentification** - Système de connexion JWT avec rôles ADMIN et ANALYST
- **Gestion des Utilisateurs** - Créer et gérer des comptes utilisateurs avec contrôle d'accès
- **Gestion des Offres** - Créer, lire, mettre à jour et supprimer des offres telecom
- **Profils Clients** - Gérer des profils clients avec des patterns d'utilisation
- **Options** - supplémentaires pouvant être ajoutées aux offres
- **Liaison Offres-Options** - Associer des options aux offres
- **Simulations** - Exécuter des simulations pour calculer les coûts et scores de satisfaction
- **Recommandations** - Obtenir des recommandations intelligentes basées sur les profils clients
- **Comparaison** - Comparer plusieurs offres pour un profil client spécifique
- **Analyse par Lot** - Analyser comment une offre se comporte sur plusieurs profils
- **Statistiques du Tableau de Bord** - Voir les stats sur les offres, profils et segments

### Stack Technologique

- **Backend**: Node.js + Express
- **Base de données**: MySQL
- **Frontend**: React + Vite + Tailwind CSS
- **Authentification**: JWT (jsonwebtoken) + bcrypt
- **Documentation API**: Swagger UI

### Rôles Utilisateurs

| Rôle | Description | Permissions |
|------|-------------|-------------|
| ADMIN | Administrateur | Accès complet: CRUD toutes ressources, gérer utilisateurs, exporter |
| ANALYST | Analyste | CRUD offres/profiles, simulations, comparaison, export |

### Structure du Projet

```
project_pfe/
├── backend/
│   ├── config/
│   │   └── database.js       # Connexion à la base de données
│   ├── routes/
│   │   ├── auth.js           # Authentification (login)
│   │   ├── offers.js         # Endpoints API des offres
│   │   ├── customer_profiles.js
│   │   ├── options.js
│   │   ├── offer_options.js
│   │   ├── simulation.js     # Endpoints de simulation
│   │   └── stats.js         # Statistiques du tableau de bord
│   ├── server.js             # Fichier principal du serveur
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # Pages React (Home, Login, Offers, etc.)
│   │   ├── services/         # Services API
│   │   └── App.jsx          # App principale avec routage
│   └── package.json
└── database/
    └── donnees_fictives_offres_telecom_300_clients.sql
```

### Installation & Configuration

#### Prérequis

- Node.js (v14+)
- MySQL
- XAMPP (ou serveur MySQL similaire)

#### 1. Configuration de la Base de Données

```sql
-- Créer la base de données
CREATE DATABASE telecom_db;

-- Importer les données
mysql -u root -p telecom_db < database/donnees_fictives_offres_telecom_300_clients.sql

-- Créer la table users
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'ANALYST') NOT NULL DEFAULT 'ANALYST',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insérer les utilisateurs par défaut (mot de passe: 123, hashé avec bcrypt)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@telecom.com', '$2b$10$...', 'ADMIN');
INSERT INTO users (username, email, password_hash, role) 
VALUES ('analyst', 'analyst@telecom.com', '$2b$10$...', 'ANALYST');
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
JWT_SECRET=votre-cle-secrete-super-securisee
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

### Identifiants de Connexion par Défaut

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@telecom.com | 123 | ADMIN |
| analyst@telecom.com | 123 | ANALYST |

### Documentation API (Swagger)

Une fois le backend démarré, visitez:
- **Swagger UI**: http://localhost:5000/api-docs
- **JSON Spec**: http://localhost:5000/api-docs.json

### Endpoints API

| Méthode | Endpoint | Description | Auth Requis |
|---------|----------|-------------|-------------|
| POST | /api/auth/login | Connexion email/mot de passe | Non |
| GET | /api/offers | Obtenir toutes les offres | Oui |
| GET | /api/offers/:id | Obtenir une offre par ID | Oui |
| POST | /api/offers | Créer une nouvelle offre | Oui |
| PUT | /api/offers/:id | Mettre à jour une offre | Oui |
| DELETE | /api/offers/:id | Supprimer une offre | Oui |
| GET | /api/customer-profiles | Obtenir tous les profils | Oui |
| GET | /api/customer-profiles/:id | Obtenir un profil par ID | Oui |
| POST | /api/customer-profiles | Créer un profil | Oui |
| GET | /api/options | Obtenir toutes les options | Oui |
| POST | /api/options | Créer une option | Oui |
| POST | /api/simulation | Exécuter une simulation | Oui |
| POST | /api/simulation/recommend | Obtenir des recommandations | Oui |
| POST | /api/simulation/compare | Comparer des offres | Oui |
| POST | /api/simulation/batch | Analyse par lot | Oui |
| GET | /api/stats | Obtenir les statistiques du tableau de bord | Oui |

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
