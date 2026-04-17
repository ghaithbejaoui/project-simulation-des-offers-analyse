# Documentation Complète du Projet PFE

## Application Web de Simulation des Offres Télécom et Analyse BI

---

## Table des Matières

1. [Présentation Globale](#1-présentation-globale)
2. [Architecture Technique](#2-architecture-technique)
3. [Base de Données](#3-base-de-données)
4. [Backend (API)](#4-backend-api)
5. [Frontend](#5-frontend)
6. [Fonctionnalités Implémentées vs Cahier des Charges](#6-fonctionnalités-implémentées-vs-cahier-des-charges)
7. [Éléments Manquants](#7-éléments-manquants)
8. [Indicateurs BI et Tableaux de Bord](#8-indicateurs-bi-et-tableaux-de-bord)
9. [Sécurité et Permissions](#9-sécurité-et-permissions)
10. [Planning et Jalons](#10-planning-et-jalons)
11. [Livrables](#11-livrables)

---

## 1. Présentation Globale

### 1.1 Objectifs du Projet

Ce projet PFE (Projet de Fin d'Études) consiste en une application web permettant :
- **La simulation** de différentes offres télécom (voix, data, SMS, packs convergents)
- **La comparaison multi-offres** selon des profils clients
- **La génération d'indicateurs** pour le pilotage via Power BI (usage, coût, ARPU simulé, churn potentiel)
- **La traçabilité** des scénarios et la gouvernance des données

### 1.2 Périmètre Métier

Le périmètre couvre les offres grand public et professionnelles :
- Prépayé (PREPAID)
- Postpayé (POSTPAID)
- Business (BUSINESS)
- Data-only (DATA_ONLY)

Incluant : voix, SMS, data, options (roaming, night data, social, fidélité)

---

## 2. Architecture Technique

### 2.1 Stack Technologique

| Couche | Technologie | Statut |
|-------|-------------|--------|
| **Frontend** | React (Vite) | ✅ Implémenté |
| **State Management** | React Context API | ✅ Implémenté |
| **Routing** | React Router DOM | ✅ Implémenté |
| **Backend** | Node.js + Express | ✅ Implémenté |
| **Base de données** | MySQL/MariaDB | ✅ Implémenté |
| **Auth** | JWT + bcrypt | ✅ Implémenté |
| **Documentation API** | Swagger/OpenAPI | ✅ Implémenté |
| **BI** | Power BI | ❌ Non implémenté |

### 2.2 Structure du Projet

```
project_pfe/
├── frontend/                    # Application React (Vite)
│   ├── src/
│   │   ├── components/          # Composants partagés (Layout)
│   │   ├── pages/               # Pages principales
│   │   ├── styles/              # Thèmes et styles
│   │   ├── services/            # Services API
│   │   ├── App.jsx              # Routeur principal
│   │   ├── main.jsx              # Point d'entrée
│   │   └── index.css             # Styles globaux
│   ├── package.json
│   ├── vite.config.js
│   └── public/
│
├── backend/                     # API Node.js/Express
│   ├── routes/                  # Routes API
│   │   ├── offers.js            # Gestion des offres
│   │   ├── customer_profiles.js # Gestion des profils
│   │   ├── options.js          # Gestion des options
│   │   ├── offer_options.js    # Relations offre-options
│   │   ├── simulation.js       # Moteur de simulation
│   │   ├── stats.js            # Statistiques tableau de bord
│   │   └── auth.js             # Authentification
│   ├── config/
│   │   └── database.js         # Configuration DB
│   ├── server.js              # Point d'entrée
│   └── package.json
│
├── database/                    # Scripts et documentation DB
│   ├── DATABASE_OVERVIEW.md    # Vue d'ensemble
│   ├── DATABASE_DOCUMENTATION.md
│   └── donnees_fictives_offres_telecom_300_clients.sql
│
└── README.md
```

### 2.3 Ports et URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 (Vite) |
| Backend API | http://localhost:5000 |
| Swagger UI | http://localhost:5000/api-docs |

---

## 3. Base de Données

### 3.1 Tables Implémentées

#### 3.1.1 Table `offers` (60 enregistrements)

| Champ | Type | Description |
|-------|------|------------|
| `offer_id` | INT (PK) | ID auto-généré |
| `name` | VARCHAR(100) | Nom de l'offre |
| `segment` | ENUM | PREPAID, POSTPAID, BUSINESS, DATA_ONLY |
| `monthly_price` | DECIMAL(10,2) | Prix mensuel |
| `quota_minutes` | INT | Minutes incluses |
| `quota_sms` | INT | SMS inclus |
| `quota_data_gb` | INT | Data en GB |
| `validity_days` | INT | Validité en jours |
| `fair_use_gb` | INT | Seuil fair use |
| `over_minute_price` | DECIMAL(10,4) | Prix minute dépassement |
| `over_sms_price` | DECIMAL(10,4) | Prix SMS dépassement |
| `over_data_price` | DECIMAL(10,4) | Prix GB dépassement |
| `roaming_included_days` | INT | Jours roaming inclus |
| `status` | ENUM | PUBLISHED, DRAFT, ARCHIVED |

#### 3.1.2 Table `customer_profiles` (300 enregistrements)

| Champ | Type | Description |
|-------|------|------------|
| `profile_id` | INT (PK) | ID auto-généré |
| `label` | VARCHAR(100) | Nom du profil |
| `minutes_avg` | INT | Minutes moyennes mensuelles |
| `sms_avg` | INT | SMS moyens mensuels |
| `data_avg_gb` | INT | Data moyenne (GB) |
| `budget_max` | DECIMAL(10,2) | Budget maximum |
| `priority` | ENUM | PRICE, QUALITY, BALANCED |
| `night_usage_pct` | INT | % usage nocturne |
| `roaming_days` | INT | Jours roaming/an |

#### 3.1.3 Table `options` (40 enregistrements)

| Champ | Type | Description |
|-------|------|------------|
| `option_id` | INT (PK) | ID auto-généré |
| `name` | VARCHAR(100) | Nom de l'option |
| `type` | ENUM | DATA_ADDON, VOICE_ADDON, SMS_ADDON, ROAMING, LOYALTY |
| `price` | DECIMAL(10,2) | Prix supplémentaire |
| `data_gb` | INT | Data supplémentaire |
| `minutes` | INT | Minutes supplémentaires |

#### 3.1.4 Table `offer_options` (Junction)

| Champ | Type | Description |
|-------|------|------------|
| `offer_id` | INT (FK) | Référence offre |
| `option_id` | INT (FK) | Référence option |

#### 3.1.5 Table `users`

| Champ | Type | Description |
|-------|------|------------|
| `user_id` | INT (PK) | ID auto-généré |
| `username` | VARCHAR(50) | Nom d'utilisateur |
| `email` | VARCHAR(100) | Email (login) |
| `password_hash` | VARCHAR(255) | Mot de passe hashé (bcrypt) |
| `role` | ENUM | ADMIN, ANALYST |

### 3.2 Statistiques DB

| Métrique | Valeur |
|----------|-------|
| Total Offres | 60 |
| Offres Actives (PUBLISHED) | ~40 |
| Offres BUSINESS | 3 |
| Profils Clients | 300 |
| Budget Range | 15 - 150 TND |
| Options | 40 |
| Rôles Utilisateurs | 2 (ADMIN, ANALYST) |

---

## 4. Backend (API)

### 4.1 Routes Implémentées

| Route | Méthode | Description | Statut |
|-------|--------|-------------|--------|
| `/api/offers` | GET | Liste de toutes les offres | ✅ |
| `/api/offers` | POST | Créer une nouvelle offre | ✅ |
| `/api/offers/:id` | GET | Détails d'une offre | ✅ |
| `/api/offers/:id` | PUT | Modifier une offre | ✅ |
| `/api/offers/:id` | DELETE | Supprimer une offre | ✅ |
| `/api/offers/:id/with-options` | GET | Offre avec ses options | ✅ |
| `/api/customer-profiles` | GET | Liste des profils | ✅ |
| `/api/customer-profiles` | POST | Créer un profil | ✅ |
| `/api/customer-profiles/:id` | GET | Détails d'un profil | ✅ |
| `/api/customer-profiles/:id` | PUT | Modifier un profil | ✅ |
| `/api/customer-profiles/:id` | DELETE | Supprimer un profil | ✅ |
| `/api/options` | GET | Liste des options | ✅ |
| `/api/options` | POST | Créer une option | ✅ |
| `/api/options/:id` | GET | Détails d'une option | ✅ |
| `/api/options/:id` | PUT | Modifier une option | ✅ |
| `/api/options/:id` | DELETE | Supprimer une option | ✅ |
| `/api/offer-options` | GET | Liste des relations | ✅ |
| `/api/offer-options` | POST | Ajouter option à offre | ✅ |
| `/api/offer-options/:id` | DELETE | Retirer option | ✅ |
| `/api/simulation` | POST | Simulation mono-offre | ✅ |
| `/api/simulation/recommend` | POST | Recommandations | ✅ |
| `/api/simulation/compare` | POST | Comparaison multi-offres | ✅ |
| `/api/simulation/batch` | POST | Analyse batch | ✅ |
| `/api/auth/login` | POST | Connexion utilisateur | ✅ |
| `/api/stats` | GET | Statistiques dashboard | ✅ |
| `/api-docs` | GET | Swagger UI | ✅ |
| `/api-docs.json` | GET | Spec OpenAPI | ✅ |

### 4.2 Moteur de Simulation

#### 4.2.1 Calculs Implémentés

```javascript
// Coût de base
baseCost = monthly_price

// Dépassements
overMinutes = max(0, minutes_avg - quota_minutes) * over_minute_price
overSms = max(0, sms_avg - quota_sms) * over_sms_price
overData = max(0, data_avg_gb - quota_data_gb) * over_data_price
overageCost = overMinutes + overSms + overData

// Roaming
roamingCost = max(0, roaming_days - roaming_included_days) * 5

// Options et remises
optionsCost = sum(options.price)
discounts = abs(min(0, optionsCost)) // remises négatives

// Coût total
totalCost = baseCost + overageCost + roamingCost - discounts
```

#### 4.2.2 Score de Satisfaction

```javascript
score = 100
if (budgetRatio <= 0.7) score += 10      // Sous le budget
else if (budgetRatio <= 1.0) score += 0
else score -= 30                        // Dépasse le budget

if (segment === 'BUSINESS') score += 10
else if (segment === 'POSTPAID') score += 5

score += min(options.length * 2, 10)
if (data_avg > fair_use_gb) score -= 20
if (overages > 0) score -= 10

satisfactionScore = max(0, min(100, score))
```

---

## 5. Frontend

### 5.1 Pages Implémentées

| Page | Route | Fonctionnalité | Statut |
|------|-------|----------------|--------|
| Login | `/login` | Authentification | ✅ |
| Dashboard | `/dashboard` | Statistiques globales | ✅ |
| Offers | `/offers` | Gestion CRUD des offres | ✅ |
| Options | `/options` | Gestion CRUD des options | ✅ |
| Profiles | `/profiles` | Gestion des profils | ✅ |
| Simulation | `/simulation` | Moteur de simulation | ✅ |
| Compare | `/compare` | Comparateur d'offres | ✅ |

### 5.2 Composants

| Composant | Fichier | Description |
|-----------|---------|-------------|
| Layout | `Layout.jsx` | Structure commune (nav, sidebar) |
| ScoreRing | `Simulation.jsx` | Indicateur visuel de score |
| ResultCard | `Simulation.jsx` | Carte de résultat |
| StatusBadge | `Offers.jsx` | Badge de statut |
| SegmentPill | `Offers.jsx` | Badge de segment |

### 5.3 Fonctionnalités UI

- ✅ Système de navigation avec layout partagé
- ✅ Authentification JWT (login avec email/password)
- ✅ Protection des routes (guard)
- ✅ Gestion des rôles (ADMIN, ANALYST)
- ✅ Tableaux de données avec filtres
- ✅ Modales de création/édition
- ✅ Indicateurs visuels de score
- ✅ Comparaison visuelle des offres

---

## 6. Fonctionnalités Implémentées vs Cahier des Charges

### 6.1 Tableau de Correspondance

| Fonctionnalité | Cahier des Charges | Statut Implémenté |
|----------------|-------------------|-------------------|
| **Gestion des catalogues d'offres (CRUD)** | ✅ Requirement | ✅ COMPLET |
| **Gestion des versions, statut de publication** | ✅ Requirement | ✅ COMPLET |
| **Modélisation des paramètres tarifaires** | ✅ Requirement | ✅ COMPLET |
| **Profils clients (consommation mensuelle)** | ✅ Requirement | ✅ COMPLET |
| **Simulation mono-offre** | ✅ Requirement | ✅ COMPLET |
| **Simulation multi-offres (comparaison)** | ✅ Requirement | ✅ COMPLET |
| **Recommandations intelligentes** | ✅ Requirement | ✅ COMPLET |
| **Comparateur d'offres avec ranking** | ✅ Requirement | ✅ COMPLET |
| **Justification (explainability)** | ⚠️ Partiel | ⚠️ PARTIEL |
| **Gestion des scénarios** | ❌ Requirement | ❌ MANQUANT |
| **Sauvegarde de scénarios** | ❌ Requirement | ❌ MANQUANT |
| **Export (CSV/XLSX/PDF)** | ❌ Requirement | ❌ MANQUANT |
| **Traçabilité et audit** | ❌ Requirement | ❌ MANQUANT |
| **Sécurité : rôles (Admin, Analyste, Invité)** | ⚠️ 2 rôles seulement | ⚠️ PARTIEL |
| **Authentification JWT** | ✅ Requirement | ✅ COMPLET |
| **Journalisation** | ❌ Requirement | ❌ MANQUANT |
| **Intégration Power BI** | ❌ Requirement | ❌ MANQUANT |
| **Dataset actualisable** | ❌ Requirement | ❌ MANQUANT |

### 6.2 Détail des Implémentations

#### ✅ OFFRES - CRUD COMPLET
- Liste des offres avec filtres (segment, status)
- Création/edition via modale
- Suppression
- Détails avec options associées

#### ✅ OPTIONS - CRUD COMPLET
- Liste des options
- Création/edition
- Suppression
- Types: DATA_ADDON, VOICE_ADDON, SMS_ADDON, ROAMING, LOYALTY

#### ✅ PROFILS CLIENTS - CRUD COMPLET
- Liste des profils
- Création/edition
- Tous les champs: minutes, SMS, data, budget, priority, night_usage, roaming

#### ✅ SIMULATION - COMPLET
- Simulation simple (1 profil + 1 offre)
- Recommandations intelligentes (tri par prix/qualité/balanced)
- Comparaison multi-offres avec ranking
- Analyse batch (1 offre + plusieurs profils)

#### ✅ AUTHENTIFICATION - COMPLET
- Login avec email/password
- JWT token
- Rôles ADMIN/ANALYST
- Protection des routes

#### ⚠️ STATS - PARTIEL
- Total offers
- Total profiles
- Offers by segment
- Average price

---

## 7. Éléments Manquants

### 7.1 Fonctionnalités Prioritaires Manquantes

| # | Fonctionnalité | Priorité | Description |
|---|---------------|----------|-------------|
| 1 | **Scénarios** | HAUTE | Sauvegarde, duplication, partage des simulations |
| 2 | **Export CSV/XLSX** | HAUTE | Export des résultats de simulation |
| 3 | **Export PDF** | MOYENNE | Export PDF des rapports |
| 4 | **Traçabilité** | HAUTE | Qui a fait quoi, quand |
| 5 | **Journalisation** | HAUTE | Logs des actions utilisateur |
| 6 | **Rôle Invité** | MOYENNE | Accès lecture seule |
| 7 | **Power BI** | HAUTE | Intégration et dataset |

### 7.2 Fonctionnalités Secondaires Manquantes

| # | Fonctionnalité | Priorité |
|---|---------------|----------|
| 8 | Versionnement des offres | BASSE |
| 9 | Dashboard BI complet | HAUTE |
| 10 | Indicateur ARPU simulé | HAUTE |
| 11 | Indicateur churn potentiel | HAUTE |
| 12 | Heatmap des dépassements | MOYENNE |
| 13 | Règles de promotion/remise | BASSE |
| 14 | Dictionnaires de données | BASSE |
| 15 | Conformité RGPD | BASSE |

### 7.3 Tables Manquantes (à créer pour les fonctionnalités manquantes)

```
-- Tables à ajouter pour les scénarios
CREATE TABLE scenarios (
  scenario_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(100),
  description TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE scenario_results (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  scenario_id INT,
  profile_id INT,
  offer_id INT,
  total_cost DECIMAL(10,2),
  satisfaction_score INT,
  created_at DATETIME,
  FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id),
  FOREIGN KEY (profile_id) REFERENCES customer_profiles(profile_id),
  FOREIGN KEY (offer_id) REFERENCES offers(offer_id)
);

-- Table d'audit pour la traçabilité
CREATE TABLE audit_log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(50),
  table_name VARCHAR(50),
  record_id INT,
  old_value TEXT,
  new_value TEXT,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 7.4 APIRoutes Manquantes (à implémenter)

```javascript
// Routes à ajouter
router.post('/scenarios', auth, createScenario);      // Créer scénario
router.get('/scenarios', auth, listScenarios);      // Lister scénarios
router.get('/scenarios/:id', auth, getScenario);     // Détails scénario
router.put('/scenarios/:id', auth, updateScenario);// Modifier scénario
router.delete('/scenarios/:id', auth, deleteScenario);// Supprimer
router.post('/scenarios/:id/duplicate', auth, duplicateScenario);

// Export
router.get('/export/csv', auth, exportCSV);          // Export CSV
router.get('/export/xlsx', auth, exportXLSX);       // Export Excel
router.get('/export/pdf', auth, exportPDF);        // Export PDF
```

---

## 8. Indicateurs BI et Tableaux de Bord

### 8.1 Indicateurs Requis (selon cahier des charges)

| Indicateur | Description | Statut |
|------------|-------------|--------|
| Coût total par profil | Coût estimé par profil client | ✅ Implémenté (backend) |
| Différentiel vs offre la moins chère | Écart de prix | ✅ Implémenté (backend) |
| ARPU simulé | Revenu moyen par utilisateur simulé | ❌ Non implémenté |
| Part d'offres recommandées | % des offers recommendées | ❌ Non implémenté |
| % dépassement | Pourcentage de dépassement | ❌ Non implémenté |
| Coût roaming | Coût roaming par profil | ✅ Implémenté (backend) |
| Top options utilisées | Options les plus populaires | ❌ Non implémenté |

### 8.2 Rapports Requis

| Rapport | Segmentation | Statut |
|---------|-------------|--------|
| Par segment | Prépayé/Postpayé/Business | ❌ Non implémenté |
| Par type d'offre | Voix/Data/SMS | ❌ Non implémenté |
| Par budget | Budget client | ❌ Non implémenté |
| Par usage | Usage réel | ❌ Non implémenté |

### 8.3 Dashboards Requis

| Dashboard | Vue | Indicateurs | Statut |
|-----------|-----|------------|--------|
| Marketing | KPI compétitivités | Heatmap dépassements | ❌ Non implémenté |
| Produit | Performance par offre | Effets des options | ❌ Non implémenté |
| Direction | Économies potentielles | Risques de churn | ❌ Non implémenté |

### 8.4 Power BI - État Actuel

| Élément | Statut |
|---------|--------|
| Modèle de données tabulaire | ❌ Non créé |
| Mesures DAX | ❌ Non créées |
| Rapports Power BI | ❌ Non créés |
| Rafraîchissement planifié | ❌ Non configuré |
| Gateway | ❌ Non configurée |

---

## 9. Sécurité et Permissions

### 9.1 Roles Implémentés

| Rôle | Permissions | Implémenté |
|------|-------------|------------|
| ADMIN | CRUD complet offers, profiles, options, utilisateurs | ✅ |
| ANALYST | Lecture offres/profiles, simulation, comparaison | ✅ |
| INVITÉ | Lecture seule | ❌ Non implémenté |

### 9.2 Sécurité Implémentée

| Mécanisme | Statut |
|-----------|--------|
| JWT Authentication | ✅ |
| Password Hashing (bcrypt) | ✅ |
| Route Guards (Frontend) | ✅ |
| Password Hashing rounds | 10 |
| JWT Expiration | 24h |

### 9.3 Sécurité Manquante

| Mécanisme | Priorité |
|-----------|----------|
| Journalisation des actions | HAUTE |
| Rate limiting | MOYENNE |
| HTTPS | MOYENNE |
| Input validation (Joi) | BASSE |
| CORS configuré | BASSE |

---

## 10. Planning et Jalons

### 10.1 Répartition des Semaines (16 semaines)

| Semaines | Jalon | Statut |
|----------|-------|--------|
| S1-S2 | Cadrage, spécifications détaillées, conception DB et API | ✅ TERMINÉ |
| S3-S6 | Développement back-end + base de données, tests unitaires | ✅ TERMINÉ |
| S5-S8 | Développement front-end, intégration API | ✅ TERMINÉ |
| S7-S9 | Moteur de simulation, comparateur, export | ⚠️ PARTIEL (simulateur OK, export manquant) |
| S9-S12 | Intégration Power BI, modèle DAX, dashboards | ❌ NON TERMINÉ |
| S13-S14 | Non-fonctionnels (sécurité, perf, logs, RGPD), tests | ❌ NON TERMINÉ |
| S15 | Recette, documentation, formation | ❌ NON TERMINÉ |
| S16 | Soutenance, livraison finale | ❌ NON TERMINÉ |

### 10.2 Avancement Global

| Phase | Completion |
|-------|-----------|
| Backend & Database | ~90% |
| Frontend | ~80% |
| Simulation & Comparateur | ~80% |
| Power BI & BI | ~0% |
| Non-fonctionnels | ~10% |

---

## 11. Livrables

### 11.1 Livrables Attendus (selon cahier des charges)

| Livrable | Fichier | Statut |
|----------|---------|--------|
| Cahier des charges | `Cahier_des_charges_PFE_Simulation_Offres_Telecom.docx` | ✅ |
| Schéma ER | `database/` | ✅ |
| API docs (OpenAPI) | `/api-docs` Swagger | ✅ |
| Code source | `frontend/`, `backend/` | ✅ |
| Base de données initiale | `database/donnees_fictives_*.sql` | ✅ |
| Scripts de migration | - | ❌ Non créé |
| Jeux de données fictifs | `database/donnees_fictives_offres_telecom_300_clients.sql` | ✅ |
| Rapports Power BI | - | ❌ Non créé |
| Guide d'exploitation | - | ❌ Non créé |

### 11.2 État des Livrables

| # | Livrable | Statut |
|---|---------|--------|
| 1 | Cahier des charges | ✅ REMIS |
| 2 | Schéma ER | ✅ PRÉSENT |
| 3 | Documentation API | ✅ SWAGGER |
| 4 | Code source | ✅ PRÉSENT |
| 5 | Base de données initiale | ✅ PRÉSENTE |
| 6 | Scripts de migration | ❌ À CRÉER |
| 7 | Jeux de données fictifs | ✅ PRÉSENTS |
| 8 | Rapports Power BI | ❌ À CRÉER |
| 9 | Guide d'exploitation | ❌ À CRÉER |

---

## Résumé Exécutif

### Ce qui est COMPLET (~80%)

1. **Base de données** - 5 tables, 60 offres, 300 profils, 40 options
2. **API REST** - ~25 endpoints CRUD et simulation
3. **Frontend React** - 7 pages, auth, gestion des offres/profils/options
4. **Moteur de simulation** - Calculs de coût et score de satisfaction
5. **Comparateur** - Ranking et comparaison multi-offres
6. **Recommandations** - Tri intelligent par priorité

### Ce qui est MANQUANT (~20%)

1. **Scénarios** - Sauvegarde et partage des simulations
2. **Export** - CSV, XLSX, PDF
3. **Traçabilité/Audit** - Logs et audit trail
4. **Rôle Invité** - Accès lecture seule
5. **Power BI** - Intégration complète
6. **Tableaux de bord BI** - KPIs marketing/produit/direction
7. **Journalisation** - Logs des actions

---

## Prochaines Étapes Recommandées

1. **Priorité HAUTE** : Implémenter les scénarios (sauvegarde des simulations)
2. **Priorité HAUTE** : Ajouter l'export CSV/XLSX
3. **Priorité HAUTE** : Créer la table d'audit et la journalisation
4. **Priorité HAUTE** : Démarrer l'intégration Power BI
5. **Priorité MOYENNE** : Créer les dashboards BI
6. **Priorité MOYENNE** : Ajouter le rôle Invité
7. **Priorité BASSE** : Documentation finale et guide d'exploitation

---

*Document généré le 16 avril 2026*
*Projet PFE - Simulation Offres Télécom et Analyse BI*