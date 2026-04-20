# Project Overview — Telecom Offers Simulation & BI Analysis Platform

**Project Type:** Final Year Engineering Project (PFE)  
**Domain:** Telecom Offer Simulation & Business Intelligence  
**Technology Stack:** React (Vite) · Node.js (Express) · MySQL · Power BI (Planned)  
**Development Period:** 16 weeks  
**Current Completion:** ~85%

---

## Executive Summary

A comprehensive web application for telecom operators to simulate, compare, and analyze different telecom offers (prepaid, postpaid, business, data-only) against customer profiles. The system calculates total costs, satisfaction scores, and provides intelligent recommendations. It includes full audit trail, scenario management, and data export capabilities.

---

## Cahier de Charges vs Implementation Analysis

### Section 3: Fonctionnalités principales

| Feature | Required | Implemented | Status |
|---------|----------|-------------|--------|
| Gestion catalogues offres (CRUD) | ✅ | ✅ | COMPLETE |
| Modélisation paramètres tarifaires | ✅ | ✅ | COMPLETE |
| Profils clients | ✅ | ✅ | COMPLETE |
| Simulation mono-offre | ✅ | ✅ | COMPLETE |
| Simulation multi-offres | ✅ | ✅ | COMPLETE |
| Comparateur avec ranking | ✅ | ✅ | COMPLETE |
| Gestion scénarios | ✅ | ✅ | COMPLETE |
| Export CSV/XLSX | ✅ | ⚠️ | CSV OK, XLSX PARTIAL |
| Export PDF | ✅ | ❌ | NOT IMPLEMENTED |
| Traçabilité audit | ✅ | ✅ | COMPLETE |
| Sécurité rôles | ✅ | ⚠️ | ADMIN/ANALYST OK, GUEST PARTIAL |
| Intégration BI | ✅ | ⚠️ | API READY, DASHBOARDS PENDING |

### Section 5: Paramètres & règles de simulation

The calculation formulas **exactly match** the specification:

```javascript
// Coût_inclus = prix
// Dépassement = max(0, usage - quota) * coût_unité
// Total = Coût_inclus + Dépassements + roaming - remises
```

**Verified:** Implementation matches cahier de charges section 5 exactly.

### Section 6: Exigences BI

| Indicator | Required | Implemented |
|-----------|----------|-------------|
| Coût total par profil | ✅ | ✅ via fact_simulations |
| Différentiel vs moins cher | ✅ | ✅ in compare mode |
| ARPU simulé | ✅ | ✅ view + API |
| % dépassement | ✅ | ✅ vw_overage |
| Top options | ✅ | ✅ via scenario_results |
| Dashboards Marketing | ✅ | ❌ NOT STARTED |
| Dashboards Produit | ✅ | ❌ NOT STARTED |
| Dashboards Direction | ✅ | ❌ NOT STARTED |

**Status:** BI infrastructure exists (tables, views, API), dashboards not created.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  Vite + React 19 • React Router v7 • Recharts                 │
│  11 Pages: Login, Dashboard, Offers, Options, Profiles,    │
│           Simulation, Compare, Scenarios, Users, Audit     │
└───────────────────────────┬───────────────────────────────────┘
                    REST API
┌───────────────────────────┴───────────────────────────────────┐
│                      BACKEND (Node.js)                      │
│  Express 5 • MySQL2 • JWT • bcrypt • Swagger                 │
│  12 Route Modules • BI Logger Middleware                   │
└───────────────────────────┬───────────────────────────────────┘
                    MySQL
┌───────────────────────────┴───────────────────────────────────┐
│                      DATABASE (MySQL)                         │
│  offers, customer_profiles, options, offer_options             │
│  scenarios, scenario_results, audit_logs, users             │
│  fact_simulations (BI), views (BI)                          │
└─────────────────────────────────────────────────────────────┘
                    Power BI (Planned)
```

---

## Database Tables

| Table | Records | Purpose |
|-------|---------|---------|
| offers | 61 | Telecom offers catalog |
| customer_profiles | 301 | Client usage profiles |
| options | 41 | Add-on options |
| offer_options | 145 | Offer-option relationships |
| scenarios | 14 | Saved simulation scenarios |
| scenario_results | 44 | Simulation results per scenario |
| audit_logs | 150+ | Audit trail |
| users | 3 | ADMIN, ANALYST, GUEST |
| fact_simulations | 500+ | BI fact table |
| vw_arpu | - | ARPU by offer |
| vw_overage | - | Overage metrics |
| vw_recommendation_rate | - | Recommendation metrics |
| vw_daily_volume | - | Daily simulation volume |
| vw_segment_summary | - | Summary by segment |

---

## API Endpoints

### Core CRUD
- `/api/auth` - Authentication
- `/api/offers` - Offer management
- `/api/customer-profiles` - Profile management
- `/api/options` - Option management
- `/api/offer-options` - Offer-option linking
- `/api/users` - User management

### Simulation (4 modes)
- `POST /api/simulation` - Single offer
- `POST /api/simulation/recommend` - Smart recommendations
- `POST /api/simulation/compare` - Multi-offer comparison
- `POST /api/simulation/batch` - Batch analysis

### BI
- `GET /api/bi/kpis` - Global KPIs
- `GET /api/bi/arpu` - ARPU by offer
- `GET /api/bi/overage` - Overage metrics
- `GET /api/bi/daily-volume` - Volume over time
- `GET /api/bi/segment-summary` - Summary by segment

### Export & Audit
- `/api/export/scenario/:id/csv` - CSV export
- `/api/export/offers/csv` - Offers catalog
- `/api/audit/logs` - Audit trail
- `/api/stats` - Dashboard stats

---

## Implemented Features

### 1. Authentication & Authorization
- JWT tokens (24h expiry)
- 3 roles: ADMIN, ANALYST, GUEST
- Role-based route protection
- Audit logging on login/logout

### 2. Offers Management
- Full CRUD operations
- Segment filtering (PREPAID/POSTPAID/BUSINESS)
- Status management (PUBLISHED/DRAFT/ARCHIVED)
- Quota and pricing fields

### 3. Customer Profiles
- Usage patterns: minutes, SMS, data (GB)
- Budget and priority settings
- Auto-segment detection

### 4. Options System
- Add-on options (roaming, night data, etc.)
- Link/unlink to offers
- Negative prices = discounts

### 5. Simulation Engine
- Accurate cost calculation per cahier de charges
- Satisfaction score (0-100)
- Multiple simulation modes
- Overage tracking

### 6. Scenario Management
- Create, save, duplicate scenarios
- Export results
- Status tracking

### 7. Export
- CSV export for scenarios, offers, profiles
- Pseudo-XLSX (tab-separated)

### 8. Audit & Traceability
- Full action logging
- User, action, entity, timestamp
- Filterable UI

---

## Missing Items

### High Priority (Required by Cahier de Charges)
1. ~~PDF Export~~ - Now implemented with pdfkit
2. ~~XLSX Export~~ - Now implemented with xlsx library
3. **Power BI Dashboards** - UI uses real BI API now

### Medium Priority (Quality)
4. ~~Input validation (Joi)~~ - Added to offer creation
5. ~~Rate limiting~~ - Added with express-rate-limit
6. ~~Helmet.js~~ - Added security headers
7. ~~Guest login flow~~ - Implemented with /api/auth/guest endpoint

### Lower Priority (Post-PFE)
8. ~~Docker containerization~~ - Dockerfiles and docker-compose added
9. ~~Test suite~~ - Added basic simulation tests

---

## Known Issues

1. **Dashboard hardcoded data** - Uses static values instead of live BI API
2. **Guest role incomplete** - Exists in DB but no dedicated login
3. **Missing FK constraints** - offer_options and scenario_results lack foreign keys
4. **fact_simulations populated but unused** - BI table exists but dashboard doesn't query it

---

## Getting Started

### Prerequisites
- Node.js ≥ 18.x
- MySQL ≥ 8.0
- npm

### Setup
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Import database
mysql -u root -p < database/donnees_fictives_offres_telecom_300_clients.sql

# Configure .env (backend)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bd_pfe
PORT=5000
JWT_SECRET=your_secret
```

### Run
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Login
- admin@telecom.com / 123 (ADMIN)
- analyst@telecom.com / 123 (ANALYST)

---

## Power BI Integration

The BI infrastructure is ready:
- fact_simulations table collects simulation data
- BI views provide aggregations
- BI API endpoints expose metrics

**Next step:** Create Power BI desktop dashboards (Marketing, Product, Direction views) as specified in cahier de charges section 6.

---

## Dependencies

### Backend
- express ^5.2.1
- mysql2 ^3.17.0
- bcrypt ^6.0.0
- jsonwebtoken ^9.0.3
- cors ^2.8.6
- swagger-jsdoc ^6.2.8
- swagger-ui-express ^5.0.1

### Frontend
- react ^19.2.0
- react-dom ^19.2.0
- react-router-dom ^7.13.0
- vite ^7.3.1
- tailwindcss ^4.2.0

---

## Files Structure

```
project_pfe/
├── backend/
│   ├── config/database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── biLogger.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── offers.js
│   │   ├── customer_profiles.js
│   │   ├── options.js
│   │   ├── offer_options.js
│   │   ├── simulation.js
│   │   ├── scenarios.js
│   │   ├── export.js
│   │   ├── audit.js
│   │   ├── stats.js
│   │   ├── bi.js
│   │   └── users.js
│   └── server.js
├── frontend/src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Offers.jsx
│   │   ├── Options.jsx
│   │   ├── Profiles.jsx
│   │   ├── Simulation.jsx
│   │   ├── Compare.jsx
│   │   ├── Scenarios.jsx
│   │   ├── Users.jsx
│   │   └── Audit.jsx
│   ├── components/Layout.jsx
│   ├── services/api.js
│   └── styles/theme.js
├── database/
│   └── donnees_fictives_offres_telecom_300_clients.sql
└── PROJECT_OVERVIEW.md
```

---

## Future Work

### Phase 1: Complete BI Dashboards
- Connect Dashboard.jsx to real BI API endpoints
- Create Marketing, Product, Direction views

### Phase 2: Export Enhancements
- Implement true XLSX with xlsx npm package
- Add PDF export with pdfkit

### Phase 3: Security & Quality
- Add Joi validation middleware
- Add rate limiting
- Add Helmet.js headers

### Phase 4: Testing & DevOps
- Add Jest test suite
- Dockerize application

---

**Last Updated:** 2026-04-20  
**Document Version:** 2.0