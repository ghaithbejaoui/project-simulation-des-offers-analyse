# Telecom Offers API / API des Offres Télécom

---
**⚠️ IMPORTANT:** This README reflects the **actual current state** of the project. Previous versions were outdated. For complete details, see `PROJECT_OVERVIEW.md`.

**Project Completion:** ~85% — Core features done, Power BI integration active  
**Last Updated:** 2026-04-24

---

## 🇬🇧 English

### Overview

A **Telecom Offers Management System** enabling telecom operators to:
- ✅ Manage offers, options, customer profiles (full CRUD)
- ✅ Run simulations (single, compare, recommendations, batch)
- ✅ Save and share scenarios
- ✅ Export data (CSV for offers, profiles, scenarios)
- ✅ Track all activity via comprehensive audit logs
- ✅ View BI dashboards (powered by Power BI integration)

**Technology:** Node.js/Express backend · React/Vite frontend · MySQL database · JWT auth

---

### ✨ Implemented Features (What Works)

| Feature | Status | Description |
|---------|--------|-------------|
| **Authentication** | ✅ | JWT with 24h tokens; ADMIN/ANALYST/GUEST roles |
| **User Management** | ✅ | Admin can create/update/delete users (ADMIN, ANALYST, GUEST) |
| **Offers CRUD** | ✅ | Full create/read/update/delete; status filter (PUBLISHED/DRAFT/ARCHIVED) |
| **Customer Profiles** | ✅ | CRUD + auto-segment detection (PREPAID/POSTPAID/BUSINESS/DATA_ONLY) |
| **Options Management** | ✅ | Add-on features; link/unlink to offers |
| **Simulation Engine** | ✅ | 4 modes: single, recommend, compare, batch; accurate formulas |
| **Scenario Management** | ✅ | Save simulation configs, duplicate, store results, change status |
| **Export** | ✅ | CSV export for offers, profiles, scenario results (XLSX as tab-delimited) |
| **Audit Logging** | ✅ | Every action logged with user, IP, timestamp, JSON details |
| **API Documentation** | ✅ | Swagger UI at `/api-docs` (complete OpenAPI 3.0 spec) |
| **Dashboard** | ✅ | Shows real BI data from Power BI integration |

---

### 🚧 Missing / Incomplete

- ⚠️ BI indicators on Dashboard (some values may be cached - see PROJECT_OVERVIEW.md)
- ❌ PDF export
- ⚠️ Guest role: exists in DB but no public login endpoint
- ⚠️ Input validation (should add Joi/Zod)
- ⚠️ Rate limiting on auth endpoints
- ❌ Test suite (0% coverage)

See `PROJECT_OVERVIEW.md` → "Known Issues" for full technical debt list.

---

### 🏗️ Architecture

```
Frontend (React 19 + Vite)
    ↓ HTTP/REST (Bearer JWT)
Backend (Express 5 + MySQL2)
    ↓ SQL Queries
Database (MySQL InnoDB)
    ↓ (future: ETL)
Power BI (planned BI layer)
```

---

### 📁 Project Structure

```
project_pfe/
├── backend/
│   ├── config/database.js         # MySQL connection pool
│   ├── middleware/auth.js         # JWT + role middleware
│   ├── routes/
│   │   ├── auth.js                # POST /login, GET /me
│   │   ├── offers.js              # CRUD offers (390 lines)
│   │   ├── customer_profiles.js   # CRUD profiles (321 lines)
│   │   ├── options.js             # CRUD options (271 lines)
│   │   ├── offer_options.js       # Link/unlink (252 lines)
│   │   ├── simulation.js          # 4 simulation modes (628 lines)
│   │   ├── scenarios.js           # Scenario management (637 lines)
│   │   ├── export.js              # CSV/XLSX export (246 lines)
│   │   ├── audit.js               # Audit logs + recent activity (305 lines)
│   │   ├── stats.js               # Dashboard aggregated stats (75 lines)
│   │   └── users.js               # User CRUD (admin only) (283 lines)
│   ├── server.js                  # App setup, Swagger, route registration
│   └── package.json               # Dependencies: express, mysql2, bcrypt, jwt, swagger
├── frontend/
│   ├── src/
│   │   ├── pages/                 # 11 React pages (Simulation, Dashboard, etc.)
│   │   ├── components/Layout.jsx  # Sidebar layout
│   │   ├── styles/theme.js        # CSS variables
│   │   ├── App.jsx                # Router configuration
│   │   └── main.jsx               # Entry point
│   └── package.json               # React 19, Vite, Tailwind CSS 4
├── database/
│   └── donnees_fictives_offres_telecom_300_clients.sql
│       └── Seeding: 61 offers, 301 profiles, 41 options, 3 users, etc.
├── README.md                      # This file (updated)
├── PROJECT_DOCUMENTATION.md       # Original spec (some sections outdated)
├── PROJECT_OVERVIEW.md            # Comprehensive current state (AUTHORITATIVE)
├── DATABASE_DOCUMENTATION.md      # ERD + column details + queries
└── POWER_BI_REQUIREMENTS.md       # (Pending — future work)
```

---

### 🚀 Quick Start

#### 1. Database Setup ⚠️ IMPORTANT: DB NAME IS `bd_pfe`

```bash
# Import SQL dump (creates 'bd_pfe' automatically)
mysql -u root -p < database/donnees_fictives_offres_telecom_300_clients.sql

# Verify:
mysql -u root -p -e "SHOW DATABASES LIKE 'bd_pfe';"
```

**Note:** The SQL file creates database `bd_pfe`. Do NOT manually run `CREATE DATABASE telecom_db` — that's from outdated documentation.

---

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file:
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bd_pfe
DB_PORT=3306
PORT=5000
JWT_SECRET=change-this-in-production
NODE_ENV=development
EOF

npm run dev
# → Server: http://localhost:5000
# → Swagger UI: http://localhost:5000/api-docs
```

---

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

#### 4. Login

| Email | Password | Role |
|-------|----------|------|
| admin@telecom.com | 123 | ADMIN |
| analyst@telecom.com | 123 | ANALYST |

---

### 🔑 API Endpoints (Summary)

**Base URL:** `http://localhost:5000/api`  
**Auth:** `Authorization: Bearer <jwt_token>`

| Endpoint | Methods | Auth | Purpose |
|----------|---------|------|---------|
| `/auth/login` | POST | No | Login → get JWT |
| `/auth/me` | GET | Yes | Get current user |
| `/offers` | GET,POST,PUT,DELETE | Yes | Offer CRUD |
| `/customer-profiles` | GET,POST,PUT,DELETE | Yes | Profile CRUD |
| `/options` | GET,POST,PUT,DELETE | Yes | Option CRUD |
| `/offer-options` | GET,POST,DELETE | Yes | Link options to offers |
| `/simulation` | POST | Yes | Single offer simulation |
| `/simulation/recommend` | POST | Yes | Get top N recommendations |
| `/simulation/compare` | POST | Yes | Compare multiple offers |
| `/simulation/batch` | POST | Yes | One offer vs many profiles |
| `/scenarios` | GET,POST,PUT,DELETE | Yes | Scenario CRUD |
| `/scenarios/:id/duplicate` | POST | Yes | Copy scenario |
| `/scenarios/:id/results` | POST | Yes | Save results to scenario |
| `/export/scenario/:id/csv` | GET | Yes | Export scenario results (CSV) |
| `/export/scenario/:id/xlsx` | GET | Yes | Export as tab-delimited .xls |
| `/export/offers/csv` | GET | Yes | Export all offers |
| `/export/profiles/csv` | GET | Yes | Export all profiles |
| `/audit/logs` | GET | ADMIN | Audit log with filters |
| `/audit/logs/summary` | GET | ADMIN | Audit summary stats |
| `/audit/recent` | GET | Yes | Recent activity (last N) |
| `/stats` | GET | Yes | Dashboard aggregated stats |
| `/users` | GET,POST,PUT,DELETE | ADMIN | User management |

**Full interactive docs:** `http://localhost:5000/api-docs`

---

### 📊 Simulation Logic (Formulas)

The system computes:

```
Total Cost = Monthly Price 
           + Overage Minutes Cost 
           + Overage SMS Cost 
           + Overage Data Cost
           + Roaming Cost
           - Options Credits (if negative prices)

Satisfaction Score (0-100):
  base = 100
  +10 if total_cost / budget ≤ 0.7
  -30 if total_cost / budget > 1.0
  +10 for BUSINESS segment, +5 for POSTPAID
  +2 per option (capped at +10)
  -20 if data_avg > fair_use_gb
  -10 if any overage exists
```

**Precision:** All monetary values rounded to 2 decimal places.

---

### 🗄️ Database Facts

| Table | Rows | Purpose |
|-------|------|---------|
| offers | 61 | Telecom offers catalog |
| customer_profiles | 301 | Customer usage patterns |
| options | 41 | Add-on features |
| offer_options | 145 | Many-to-many links |
| scenarios | 14 | Saved simulation configs |
| scenario_results | 44 | Saved simulation outcomes |
| audit_logs | 124+ | Complete activity history |
| users | 3 | Application users (admin, analyst, Guest) |

**⚠️ Known DB Issues:**
- No foreign keys on `offer_options` and `scenario_results`
- `offers.segment` ENUM lacks DATA_ONLY (only PREPAID/POSTPAID/BUSINESS)
- `quota_data_gb` is DECIMAL(10,2) not INT
- Option ID 0 duplicates ID 1

See `DATABASE_DOCUMENTATION.md` for full schema.

---

### 🎨 Frontend Pages

| Page | Route | Status | Key Features |
|------|-------|--------|--------------|
| Login | `/login` | ✅ | Email/password form + "Guest" role button (non-functional) |
| Dashboard | `/` | ⚠️ | 4 KPI cards (2 hardcoded), 2 mini-charts (static), activity feed |
| Offers | `/offers` | ✅ | CRUD, filter by segment/status, responsive table |
| Options | `/options` | ✅ | Card UI, CRUD modal |
| Profiles | `/profiles` | ✅ | Grid view, simulate button |
| Simulation | `/simulation` | ✅ | 4 modes, detailed results, CSV export |
| Compare | `/compare` | ✅ | Side-by-side comparison table |
| Scenarios | `/scenarios` | ✅ | List, create/edit modal, duplicate, save results |
| Users | `/users` | ✅ | Admin-only user management |
| Audit | `/audit` | ✅ | Filterable logs + summary stats |
| Home | `/home` | ❌ Unused | Page exists but no route → inaccessible |

---

### 🔐 Security & Authentication

**JWT Flow:**
1. User POST `/api/auth/login` with email+password
2. bcrypt compare against `users.password_hash`
3. If valid → sign JWT: `{ user_id, role }` (expires 24h)
4. Frontend stores token in `localStorage`
5. All API calls include `Authorization: Bearer <token>`

**Roles:**
| Role | Can Do |
|------|--------|
| ADMIN | Everything including user management, audit log view, delete any scenario |
| ANALYST | CRUD offers/profiles/options, run simulations, create scenarios, export |
| GUEST | ⚠️ Role exists in DB but **no public login**, effectively disabled |

**Middleware:**
- `authMiddleware` — extracts JWT, attaches `req.user` (null if invalid)
- `requireAuth` — blocks unauthenticated requests (401)
- `requireRole(...roles)` — checks role membership (403)
- `requireAdmin` — shortcut for ADMIN only

**⚠️ Vulnerabilities:**
- No rate limiting on `/login` (brute force possible)
- CORS wide open (`*`)
- No security headers (Helmet missing)
- Token in localStorage (XSS risk)

---

### 📈 What's Actually Working vs. Spec

From the original **Cahier des Charges**:

| Requirement | Spec Status | Actual Status | Notes |
|-------------|-------------|---------------|-------|
| Gestion catalogues d'offres (CRUD) | ✅ | ✅ Done | Full CRUD + status + version? no |
| Modélisation paramètres tarifaires | ✅ | ✅ Done | All fields present |
| Profils clients | ✅ | ✅ Done | Auto-segment detection |
| Simulation mono-offre | ✅ | ✅ Done | POST `/simulation` |
| Simulation multi-offres | ✅ | ✅ Done | POST `/simulation/compare` |
| Comparateur avec ranking | ✅ | ✅ Done | `rank_by_cost` + `rank_by_score` |
| Justification (explainability) | ⚠️ | ⚠️ Partial | `justification` field exists but rarely populated |
| **Scénarios** | ❌ Missing | ✅ **Done** | Full CRUD + duplicate + save results |
| **Export CSV/XLSX** | ❌ Missing | ✅ CSV ✓ / ⚠️ XLSX partial | CSV for all, XLSX is tab-delimited |
| **Export PDF** | ❌ Missing | ❌ Not done | Browser print only |
| **Traçabilité / Audit** | ❌ Missing | ✅ **Done** | `audit_logs` table + UI |
| **Journalisation** | ❌ Missing | ✅ **Done** | Audit + console logs |
| Sécurité: Rôles | ⚠️ 2 rôles | ⚠️ 3 rôles (GUEST broken) | GUEST exists but not functional |
| Authentification JWT | ✅ | ✅ Done | Working |
| **Power BI Integration** | ⚠️ Partial | ✅ **API READY, DASHBOARDS PENDING** | Primary remaining work |

**Key finding:** The original documentation (`PROJECT_DOCUMENTATION.md` Section 7) claimed scenarios, export, and audit were missing. **They are actually implemented.** Only Power BI remains.

---

### 🐛 Known Issues

**Database:**
- `offer_options` and `scenario_results` lack foreign key constraints → orphaned rows possible
- Segment ENUM: DB only supports PREPAID/POSTPAID/BUSINESS; DATA_ONLY computed in app only
- `quota_data_gb` DECIMAL type inconsistent with spec (INT expected)
- Option ID 0 is duplicate of ID 1 (data anomaly)

**Backend:**
- No input validation (accepts any JSON)
- No rate limiting
- Hardcoded API URLs in frontend (`localhost:5000`)
- No database migrations tool
- Scenario results have no FK enforcement

**Frontend:**
- Dashboard.jsx uses hardcoded static data (no live BI)
- Simulation.jsx (741 lines) too large — needs refactoring
- All styles inline — difficult to maintain
- Unused `Home.jsx` page
- No error boundaries

**DevOps:**
- Zero tests
- No Docker, CI/CD
- No error monitoring (Sentry)

See `PROJECT_OVERVIEW.md` → "Known Issues" for exhaustive list.

---

### 🛠️ Common Tasks

#### Run a Single Simulation
1. Go to `/simulation`
2. Select a customer profile (from dropdown or custom inputs)
3. Select an offer
4. Click "Run Simulation"
5. View cost breakdown + satisfaction score

#### Compare 3 Offers Side-by-Side
1. Switch to "Compare" mode
2. Select a profile
3. Select multiple offers (checkboxes)
4. Click "Compare"
5. Results ranked by score & cost

#### Get Smart Recommendations
1. Switch to "Recommend" mode
2. Enter profile parameters OR select existing profile
3. Optionally filter by segment
4. Click "Get Recommendations"
5. Top 5 offers displayed (auto-sorted by score/cost ratio)

#### Analyze One Offer Across All Customers (Batch)
1. Switch to "Batch" mode
2. Choose an offer
3. (Optional) Select subset of profiles
4. Click "Run Batch Analysis"
5. View summary: good/okay/not recommended matches, avg cost, overage stats

#### Save a Scenario
1. On Simulation or Compare page, click "Save to Scenario"
2. Enter scenario name + description
3. Scenario created in DRAFT status
4. Return to `/scenarios` to view, edit, duplicate, or run results

#### Export Results
- From Simulation page: "Export CSV" button downloads results
- From Scenarios page: Open scenario → "Export CSV" downloads saved results

---

### 🔍 Debugging

| Problem | Check |
|---------|-------|
| DB connection failed | MySQL running? `.env` credentials correct? DB name=`bd_pfe`? |
| Login fails | Default: admin@telecom.com / 123. Check `users` table. |
| 401 on fetch | Token expired? Login again. Check `localStorage.getItem('token')` |
| 403 on offer create | User role is ANALYST? (needs ADMIN for delete, but create is allowed) |
| Simulation returns NaN | Offer missing linked options? Check offer_options linkage |
| CSV download 404 | Scenario not found or no results saved yet |
| Dashboard shows "—" | Backend not running on port 5000. Check `http://localhost:5000/api/offers` directly |

**Database queries to run:**
```sql
-- Check all table counts
SELECT 'offers' AS t, COUNT(*) FROM offers
UNION ALL SELECT 'profiles', COUNT(*) FROM customer_profiles
UNION ALL SELECT 'options', COUNT(*) FROM options
UNION ALL SELECT 'offer_options', COUNT(*) FROM offer_options
UNION ALL SELECT 'scenarios', COUNT(*) FROM scenarios
UNION ALL SELECT 'scenario_results', COUNT(*) FROM scenario_results;

-- Find orphaned simulation results (no matching offer)
SELECT sr.* FROM scenario_results sr
LEFT JOIN offers o ON sr.offer_id = o.offer_id
WHERE o.offer_id IS NULL;
```

---

### 📚 Documentation Files

| File | Purpose | Accuracy |
|------|---------|----------|
| `README.md` | This file — quick start guide | ✅ Updated (2026-04-20) |
| `PROJECT_DOCUMENTATION.md` | Original detailed spec (French) | ⚠️ **Outdated** — Section 7 claims features missing that are done |
| `PROJECT_OVERVIEW.md` | Comprehensive current state (all details) | ✅ **Authoritative** — supersedes PROJECT_DOCUMENTATION.md |
| `DATABASE_DOCUMENTATION.md` | ERD + column types + sample data | ✅ Accurate (minor: says DATA_ONLY segment exists — it doesn't in DB) |
| `POWER_BI_REQUIREMENTS.md` | BI integration plan (not yet created) | ❌ Missing — needs to be written |

**If handing off to someone new:** Give them `PROJECT_OVERVIEW.md` first, then this README for quick start.

---

### 🧪 Testing

**No automated tests exist.** Manual validation performed:
- ✅ All CRUD operations tested
- ✅ Simulation formulas verified against hand calculations
- ✅ CSV export downloads correctly
- ✅ Scenario duplicate + save works
- ✅ Audit logs populate for all actions
- ✅ Role-based access enforced

**To add tests:** Would need Jest + Supertest (backend) and React Testing Library (frontend).

---

### 🔮 Next Steps (Post-PFE)

1. **Power BI Dashboards** (PRIMARY, 5-7 days)
   - Build 3 Power BI dashboards (Marketing, Product, Direction) using existing BI infrastructure
   - Configure refresh (scheduled or on-demand)
   - Embed in React frontend (already connected to BI API)

2. **Fix Technical Debt**
   - Add FK constraints to `offer_options` and `scenario_results`
   - Add input validation (Joi/Zod)
   - Add rate limiting
   - Replace inline styles with CSS modules

3. **Production Hardening**
   - Dockerize
   - CI/CD pipeline
   - Helmet.js, compression middleware
   - Move token to httpOnly cookies

See `PROJECT_OVERVIEW.md` → "Future Work" for complete roadmap.

---

### 🤝 Contributing

This is a PFE (academic project). Fork and PRs welcome for educational purposes.

---

### 📄 License

ISC

---

## 🇫🇷 Français

### Présentation

Système de Gestion des Offres Télécom allowing:
- ✅ Gestion CRUD des offres, options, profils
- ✅ Simulations (4 modes)
- ✅ Scénarios sauvegardés + audit complet
- ✅ Export CSV
- ✅ Tableaux de bord BI (alimentés par l'intégration Power BI)

**Stack:** Node.js/Express · React/Vite · MySQL · JWT

---

### Statut Réel du Projet

**Complétion:** ~85% — Fonctionnel avec BI intégré

**Fait:**
- Tous les modules CRUD
- Moteur de simulation精确
- Gestion scénarios
- Traçabilité complète
- Export CSV
- Documentation Swagger

**Manquant:**

- ❌ Indicateurs BI sur dashboard
- ❌ PDF export
- ⚠️ Rôle Guest (existe mais pas d'accès public)

**Voir `PROJECT_OVERVIEW.md` pour liste exhaustive.**

---

### Points Clés à Savoir

⚠️ **Le README original était faux:**
- Base de données s'appelle **`bd_pfe`** pas `telecom_db`
- Rôle `GUEST` existe en DB mais pas de flow de connexion
- Scénarios, export, audit **sont implémentés** (contrairement au doc)
- Dashboard montre des chiffres **en dur** pas en temps réel

✅ **Les spécifications sont largement atteintes** sauf Power BI.

---

### Installation (corrigé)

Mêmes étapes que la section anglaise ci-dessus.

---

### Support

Consultez `PROJECT_OVERVIEW.md` pour la documentation complète et à jour.

---

**Dernière mise à jour:** 2026-04-24  
**Version:** 1.2 (updated to reflect Power BI integration status)
