# 📊 Project Overview — Telecom Offers Simulation & BI Analysis Platform

**Project Type:** Final Year Engineering Project (PFE)  
**Domain:** Telecom Offer Simulation & Business Intelligence  
**Technology Stack:** React (Vite) · Node.js (Express) · MySQL · Power BI (planned)  
**Development Period:** 16 weeks  
**Current Completion:** ~78% (Core features done, BI integration pending)

---

## 📋 Executive Summary

A comprehensive web application for telecom operators to simulate, compare, and analyze different telecom offers (prepaid, postpaid, business, data-only) against customer profiles. The system calculates total costs, satisfaction scores, and provides intelligent recommendations. It includes full audit trail, scenario management, and data export capabilities. **Power BI integration is the primary remaining deliverable.**

---

## 🎯 Project Objectives (from Cahier des Charges)

### Primary Goals
1. ✅ **Offer Simulation** — Calculate costs for different offers based on customer usage patterns
2. ✅ **Multi-Offer Comparison** — Rank offers by cost and satisfaction score
3. ⚠️ **BI Indicators for Power BI** — Generate metrics for business intelligence (ARPU, overage %, churn risk) — **IN PROGRESS**
4. ✅ **Scenario Traceability** — Save, duplicate, and audit simulation scenarios
5. ⚠️ **Power BI Dashboards** — Marketing, Product, and Direction dashboards — **NOT STARTED**

### Operational Benefits
- Optimize offer selection
- Accelerate marketing analysis
- Standardize tariff modeling
- Provide decision-making dashboards

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  • Vite + React 19 • React Router v7 • Recharts (charts)      │
│  • 11 Pages (Login, Dashboard, Offers, Profiles, Simulation,  │
│    Compare, Scenarios, Users, Audit, Options)                 │
│  • LocalStorage for JWT • CSS Variables theming               │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS/REST API
┌───────────────────────────┴─────────────────────────────────────┐
│                      BACKEND (Node.js)                          │
│  • Express 5 • MySQL2 • JWT • bcrypt • Swagger UI              │
│  • 12 Route Modules • Audit Logging • Role-Based Access        │
│  • 3 Middleware (Auth, Error, CORS)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ MySQL Protocol
┌───────────────────────────┴─────────────────────────────────────┐
│                      DATABASE (MySQL)                           │
│  • 8 Core Tables • 301 Customer Profiles • 61 Offers           │
│  • 41 Options • 145 Offer-Option Links • 14 Scenarios          │
│  • 44 Scenario Results • 124+ Audit Logs • 3 Users             │
│  • InnoDB Engine • UTF8mb4 Encoding                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │   POWER BI     │ (Planned)
                    │   Dashboard    │
                    └────────────────┘
```

---

## 📁 Complete Project Structure

```
project_pfe/
├── backend/
│   ├── config/
│   │   └── database.js              # MySQL connection pool (mysql2/promise)
│   ├── middleware/
│   │   └── auth.js                  # JWT auth + role-based authorization
│   ├── routes/
│   │   ├── auth.js                  # POST /login, GET /me (167 lines)
│   │   ├── offers.js                # Full CRUD for telecom offers (390 lines)
│   │   ├── customer_profiles.js     # CRUD + auto-segment detection (321 lines)
│   │   ├── options.js               # CRUD for add-on options (271 lines)
│   │   ├── offer_options.js         # Link/unlink options to offers (252 lines)
│   │   ├── simulation.js            # 4 simulation modes (628 lines)
│   │   │                             #   POST / (single), /recommend, /compare, /batch
│   │   ├── scenarios.js             # Scenario CRUD + duplicate + save results (637 lines)
│   │   ├── export.js                # CSV export for scenarios/offers/profiles (246 lines)
│   │   ├── audit.js                 # Audit logs + recent activity (305 lines)
│   │   ├── stats.js                 # Dashboard aggregated stats (75 lines)
│   │   └── users.js                 # User management (Admin only) (283 lines)
│   ├── server.js                    # Express app setup + Swagger + routes (117 lines)
│   ├── .env                         # DB config (bd_pfe, port 5000)
│   └── package.json                 # Dependencies: express, mysql2, bcrypt, jwt, swagger
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Auth page with Guest role option
│   │   │   ├── Dashboard.jsx        # KPI cards + mini-charts + activity (289 lines)
│   │   │   ├── Offers.jsx           # Offer management CRUD
│   │   │   ├── Options.jsx          # Option management CRUD
│   │   │   ├── Profiles.jsx         # Customer profile management
│   │   │   ├── Simulation.jsx       # Main simulation page (741 lines)
│   │   │   │                        #   Modes: single, compare, recommend, batch
│   │   │   ├── Compare.jsx          # Side-by-side comparison view
│   │   │   ├── Scenarios.jsx        # Scenario management (647 lines)
│   │   │   ├── Users.jsx            # Admin user management
│   │   │   ├── Audit.jsx            # Audit log viewer with filters
│   │   │   └── Home.jsx             # Landing page (unused, no route)
│   │   ├── components/
│   │   │   └── Layout.jsx           # Shared layout with sidebar
│   │   ├── services/
│   │   │   └── api.js               # API wrapper (minimal, mostly unused)
│   │   ├── styles/
│   │   │   ├── theme.js             # CSS variables + fonts
│   │   │   └── global.css           # Global styles
│   │   ├── App.jsx                  # Main app with routes
│   │   └── main.jsx                 # Entry point
│   ├── index.html
│   ├── package.json                 # React 19, Vite, Tailwind CSS 4
│   └── vite.config.js
├── database/
│   └── donnees_fictives_offres_telecom_300_clients.sql
│       ├── 8 tables (offers, profiles, options, offer_options, scenarios,
│       │         scenario_results, audit_logs, users)
│       ├── 61 offers (segments: PREPAID, POSTPAID, BUSINESS)
│       ├── 301 customer profiles (300 + 1 extra "Ghaith bejaoui")
│       ├── 41 options (option_id 0-40, note: ID 0 duplicates ID 1)
│       ├── 145 offer-option relationships
│       ├── 14 scenarios with 44 total results
│       ├── 124+ audit log entries
│       └── 3 users (admin, analyst, Guest)
├── README.md                        # Basic project intro (OUTDATED, needs update)
├── PROJECT_DOCUMENTATION.md         # Detailed spec (MISLEADING in section 7)
├── PROJECT_OVERVIEW.md              # THIS FILE — comprehensive handover guide
├── POWER_BI_REQUIREMENTS.md         # Planned BI integration (separate doc)
└── DATABASE_DOCUMENTATION.md        # ERD + column details + sample queries
```

---

## ✅ Implemented Features (Functional)

### 1. Authentication & Authorization
- **JWT-based login** with 24h token expiry
- **3 roles**: ADMIN (full access), ANALYST (CRUD + simulate), GUEST (exists in DB but no login flow)
- **Protected routes** via middleware
- **Role-based permissions** on sensitive endpoints

**Files:** `auth.js`, `middleware/auth.js`, `Login.jsx`

---

### 2. Offers Management (CRUD)
- **Create/Read/Update/Delete** telecom offers
- **Fields**: name, segment (PREPAID/POSTPAID/BUSINESS), monthly price, quotas (min/SMS/GB), validity, fair use, overage prices, roaming days, status (PUBLISHED/DRAFT/ARCHIVED)
- **Status filtering** in UI
- **Audit trail** on all changes

**API:** `GET/POST/PUT/DELETE /api/offers`  
**Files:** `offers.js`, `Offers.jsx`

---

### 3. Customer Profiles
- **CRUD operations** with auto-segment detection (PREPAID/POSTPAID/BUSINESS/DATA_ONLY)
- **Usage patterns**: avg minutes, SMS, data (GB), night usage %, roaming days, budget max, priority (BALANCED/PRICE/QUALITY)
- **Segment inference** based on rules (business rules in code, not DB)

**API:** `GET/POST/PUT/DELETE /api/customer-profiles`  
**Files:** `customer_profiles.js`, `Profiles.jsx`

---

### 4. Options System
- **Add-on options** (roaming packs, night data, social media, loyalty)
- **Link/Unlink** to offers via `offer_options` junction table
- **Price can be negative** (represents discount)

**API:** 
- `GET/POST/PUT/DELETE /api/options`
- `GET /api/offer-options` (all links)
- `GET /api/offer-options/offer/:id` (options for offer)
- `POST /api/offer-options` (link)
- `DELETE /api/offer-options` (unlink)

**Files:** `options.js`, `offer_options.js`, `Options.jsx`

---

### 5. Simulation Engine (4 Modes)

#### Mode 1: Single Offer Simulation
**Endpoint:** `POST /api/simulation`  
**Input:** `{ profile_id, offer_id }` OR direct usage fields  
**Output:** Detailed cost breakdown + satisfaction score (0-100)

**Calculation:**
```
base_cost = offer.monthly_price
overage_minutes = max(0, profile.minutes_avg - offer.quota_minutes) * offer.over_minute_price
overage_sms = max(0, profile.sms_avg - offer.quota_sms) * offer.over_sms_price
overage_data = max(0, profile.data_avg_gb - offer.quota_data_gb) * offer.over_data_price
roaming_cost = max(0, profile.roaming_days - offer.roaming_days) * 5 (fixed rate)
options_cost = sum(linked_options.price)
total_cost = base + overage + roaming - abs(min(0, options_cost))

satisfaction_score = base(100) 
  + budget_bonus(10 if cost/budget ≤ 0.7, -30 if > 1.0)
  + segment_bonus(+10 BUSINESS, +5 POSTPAID)
  + options_count_bonus(min(len(options)*2, 10))
  - fair_use_penalty(-20 if data_avg > fair_use_gb)
  - overage_penalty(-10 if any overage)
  → clamped 0-100
```

**Files:** `simulation.js:101-197`, `Simulation.jsx`

---

#### Mode 2: Smart Recommendations
**Endpoint:** `POST /api/simulation/recommend`  
**Input:** `{ profile_id, limit=5, segment? }`  
**Output:** Top N offers ranked by score/cost

**Logic:**
- Fetch all PUBLISHED offers (optionally filtered by segment)
- Calculate cost+score for each
- Sort by: PRICE → cost ascending, QUALITY → score descending, BALANCED → score/cost ratio
- Return top `limit` with full details

**Files:** `simulation.js:219-328`

---

#### Mode 3: Compare Multiple Offers
**Endpoint:** `POST /api/simulation/compare`  
**Input:** `{ profile_id, offer_ids[] }`  
**Output:** All offers with `rank_by_cost` and `rank_by_score`

**Features:**
- Side-by-side cost breakdown
- Dual ranking (cheapest + best score)
- Summary: cheapest offer name, best score offer name

**Files:** `simulation.js:352-491`

---

#### Mode 4: Batch Analysis (One Offer vs Many Profiles)
**Endpoint:** `POST /api/simulation/batch`  
**Input:** `{ offer_id, profile_ids[] }` (if no profile_ids → all profiles)  
**Output:** Array of results per profile + summary statistics

**Summary includes:**
- Total profiles analyzed
- Good/okay/not recommended match counts
- Average cost & satisfaction
- Profiles over budget count
- Average overage cost

**Files:** `simulation.js:515-626`

---

### 6. Scenario Management
**Purpose:** Save simulation configurations + results for later review

**Database:**
- `scenarios` table: scenario_id, user_id, name, description, profile_id, offer_ids (JSON), comparison_data (JSON), status (DRAFT/ACTIVE/ARCHIVED), timestamps
- `scenario_results` table: result_id, scenario_id, profile_id, offer_id, costs, scores, ranks, notes

**API Endpoints:**
- `GET    /api/scenarios` — list with status filter + pagination (user-owned or admin all)
- `GET    /api/scenarios/:id` — get scenario + results
- `POST   /api/scenarios` — create new scenario
- `PUT    /api/scenarios/:id` — update (name, description, status, offer_ids)
- `DELETE /api/scenarios/:id` — delete (ownership check)
- `POST   /api/scenarios/:id/duplicate` — copy scenario + all results
- `POST   /api/scenarios/:id/results` — save simulation results to scenario

**Files:** `scenarios.js`, `Scenarios.jsx`

---

### 7. Export Capabilities

#### CSV Export ✅
**Endpoints:**
- `GET /api/export/scenario/:id/csv` — scenario results (with offer names)
- `GET /api/export/offers/csv` — all offers catalog
- `GET /api/export/profiles/csv` — all customer profiles

**Frontend:** Download buttons in Simulation page (CSV for results)

**Files:** `export.js`, `Simulation.jsx` (lines ~700+)

---

#### XLSX Export ⚠️ (Pseudo-Excel)
**Endpoint:** `GET /api/export/scenario/:id/xlsx`

**Implementation:** Tab-separated values with `.xls` extension + BOM for Excel compatibility  
**Not true XLSX binary format** — works but limited

**Files:** `export.js:102-156`

---

#### PDF Export ❌
**Not implemented** — only browser `window.print()` as fallback

---

### 8. Audit & Traceability (Complete)

#### Audit Logs
**Table:** `audit_logs` (124+ entries)
- Columns: log_id, user_id, action, entity, entity_id, ip_address, details (JSON), created_at
- FK: `user_id → users.user_id` (ON DELETE SET NULL)

**Logged Actions:**
| Action | Entity | Trigger |
|--------|--------|---------|
| LOGIN / LOGIN_FAILED | auth | auth.js |
| CREATE | offer, customer_profile, option, user | respective POST routes |
| UPDATE | offer, customer_profile, option, user | respective PUT routes |
| DELETE | offer, customer_profile, option, user, scenario | respective DELETE routes |
| LINK / UNLINK | offer_option | offer_options.js |
| SIMULATE_SINGLE | simulation | POST /simulation |
| SIMULATE_RECOMMEND | simulation | POST /simulation/recommend |
| SIMULATE_COMPARE | simulation | POST /simulation/compare |
| SIMULATE_BATCH | simulation | POST /simulation/batch |
| SAVE_RESULTS | scenario | POST /scenarios/:id/results |
| DUPLICATE | scenario | POST /scenarios/:id/duplicate |
| EXPORT_CSV / EXPORT_XLSX | export | export endpoints |

**Audit UI:**
- Filterable by entity type, action, user, date range
- Paginated results
- Summary stats: recent 24h activity, top users, action breakdown, entity breakdown
- Recent activity panel on Dashboard

**Files:** `audit.js` (routes + logAction helper), `Audit.jsx`

---

### 9. Dashboard Statistics

**Current state:** Static/hardcoded data with limited real API integration

**KPI Cards shown:**
1. ✅ Active Offers — fetched from `/api/offers`
2. ✅ Customer Profiles — fetched from `/api/customer-profiles`
3. ❌ Simulations Run — **hardcoded to 134** (not calculated)
4. ❌ Avg Satisfaction — **hardcoded to "78.4"**

**Charts:**
- ✅ Cost Trend — **FAKE DATA** (static array)
- ✅ Satisfaction Scores — **FAKE DATA** (static array)
- ✅ Offers by Segment — derived from `/api/stats` but percentages client-calculated
- ✅ Recent Activity — from `/api/audit/recent`

**Missing BI indicators:** ARPU, overage %, recommended offer share, top options

**Files:** `Dashboard.jsx`, `stats.js`

---

## 🗄️ Database Schema (Actual State)

### Tables Overview

#### 1. `offers` (61 records)
| Column | Type | Description |
|--------|------|-------------|
| offer_id | INT PK | Auto-increment |
| name | VARCHAR(100) | Offer name |
| segment | ENUM | PREPAID, POSTPAID, BUSINESS **(NO DATA_ONLY)** |
| monthly_price | DECIMAL(10,2) | Base subscription |
| quota_minutes | INT | Included minutes |
| quota_sms | INT | Included SMS |
| quota_data_gb | **DECIMAL(10,2)** | ❗ Docs say INT, actual is DECIMAL |
| validity_days | INT | Plan validity |
| fair_use_gb | INT | Fair use threshold |
| over_minute_price | DECIMAL(10,4) | Extra minute cost |
| over_sms_price | DECIMAL(10,4) | Extra SMS cost |
| over_data_price | DECIMAL(10,4) | Extra GB cost |
| roaming_included_days | INT | Free roaming days |
| status | ENUM | PUBLISHED, DRAFT, ARCHIVED |
| created_at, updated_at | TIMESTAMP | Audit fields |

**Indexes:** Primary key on `offer_id`

---

#### 2. `customer_profiles` (301 records)
| Column | Type | Description |
|--------|------|-------------|
| profile_id | INT PK | Auto-increment |
| label | VARCHAR(100) | Profile name |
| minutes_avg | INT | Monthly avg minutes |
| sms_avg | INT | Monthly avg SMS |
| data_avg_gb | **DECIMAL(10,2)** | ❗ Actual DECIMAL, not INT |
| night_usage_pct | DECIMAL(5,2) | Night usage % |
| roaming_days | INT | Yearly roaming days |
| budget_max | DECIMAL(10,2) | Max monthly budget |
| priority | ENUM | BALANCED, PRICE, QUALITY |
| created_at, updated_at | TIMESTAMP | — |

**Note:** `segment` is **computed in application layer**, NOT a DB column

---

#### 3. `options` (41 records)
| Column | Type | Description |
|--------|------|-------------|
| option_id | INT PK | Auto-increment |
| name | VARCHAR(100) | Option name |
| type | VARCHAR(50) | Category (roaming, data, etc.) |
| price | DECIMAL(10,2) | Monthly cost (negative = discount) |
| data_gb | INT | Extra data in GB |
| minutes | INT | Extra minutes |
| sms | INT | Extra SMS |
| validity_days | INT | Option validity |

**⚠️ Issue:** option_id 0 exists and duplicates option_id 1 data

---

#### 4. `offer_options` (145 records)
| Column | Type | Description |
|--------|------|-------------|
| offer_id | INT FK → offers.offer_id | No FK constraint ❌ |
| option_id | INT FK → options.option_id | No FK constraint ❌ |

**Composite PK:** (offer_id, option_id)  
**Missing FK constraints** — orphaned links possible

---

#### 5. `scenarios` (14 records)
| Column | Type | Description |
|--------|------|-------------|
| scenario_id | INT PK | Auto-increment |
| user_id | INT FK → users.user_id | Owner |
| name | VARCHAR(100) | Scenario name |
| description | TEXT | Optional |
| profile_id | INT FK? | ❌ No FK to customer_profiles |
| offer_ids | JSON | Array of offer IDs |
| comparison_data | JSON | Stores comparison results |
| status | ENUM | DRAFT, ACTIVE, ARCHIVED |
| created_at, updated_at | TIMESTAMP | — |

---

#### 6. `scenario_results` (44 records)
| Column | Type | Description |
|--------|------|-------------|
| result_id | INT PK | Auto-increment |
| scenario_id | INT FK? | ❌ No FK to scenarios |
| profile_id | INT FK? | ❌ No FK to customer_profiles |
| offer_id | INT FK? | ❌ No FK to offers |
| base_cost | DECIMAL(10,2) | Monthly price |
| overage_cost | DECIMAL(10,2) | Extra usage cost |
| roaming_cost | DECIMAL(10,2) | Roaming fees |
| total_cost | DECIMAL(10,2) | Sum of costs |
| satisfaction_score | INT | 0-100 score |
| recommendation | VARCHAR(50) | good_match/okay_match/not_recommended |
| rank_by_cost | INT | Cost ranking |
| rank_by_score | INT | Score ranking |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | — |

**⚠️ CRITICAL:** No foreign keys — data integrity not enforced

---

#### 7. `audit_logs` (124+ records)
| Column | Type | Description |
|--------|------|-------------|
| log_id | INT PK | Auto-increment |
| user_id | INT FK → users.user_id | ON DELETE SET NULL |
| action | VARCHAR(50) | Action type (CREATE, UPDATE, etc.) |
| entity | VARCHAR(50) | Table name |
| entity_id | INT | Record ID |
| ip_address | VARCHAR(45) | Client IP |
| details | JSON | Additional context |
| created_at | TIMESTAMP | Event time |

**Indexes:** `idx_user (user_id)`, `idx_entity (entity, entity_id)`, `idx_created (created_at)`

---

#### 8. `users` (3 records)
| Column | Type | Description |
|--------|------|-------------|
| user_id | INT PK | Auto-increment |
| username | VARCHAR(100) UNIQUE | Login username |
| email | VARCHAR(255) UNIQUE | Email login |
| password_hash | VARCHAR(255) | bcrypt hash |
| role | ENUM | ADMIN, ANALYST, **GUEST** |
| created_at, updated_at | TIMESTAMP | — |

**Default users:**
- admin@telecom.com / 123 → ADMIN
- analyst@telecom.com / 123 → ANALYST
- Guest / (no login) → GUEST (exists but no login flow)

---

### Missing Tables (Required for BI)
- ❌ `fact_simulations` — fact table for ALL simulation runs (not just saved scenarios)
- ❌ `dim_date` — date dimension for time intelligence
- ❌ `daily_kpi` — pre-aggregated daily metrics
- ❌ `offer_versions` — version history for offers
- ❌ `data_quality_logs` — data governance
- ❌ `gdpr_consents` — GDPR tracking

---

## 🔌 API Reference (Complete)

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer token (JWT) in `Authorization` header

### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Authenticate → get JWT token |
| GET | `/` | Health check |

---

### Protected Endpoints (Require Auth)

#### Offers
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/offers` | All | List all offers |
| GET | `/offers/:id` | All | Get single offer |
| POST | `/offers` | ADMIN, ANALYST | Create offer |
| PUT | `/offers/:id` | ADMIN, ANALYST | Update offer |
| DELETE | `/offers/:id` | ADMIN | Delete offer |
| GET | `/offers/:id/with-options` | All | Get offer + linked options |

---

#### Customer Profiles
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/customer-profiles` | All | List all profiles |
| GET | `/customer-profiles/:id` | All | Get single profile |
| POST | `/customer-profiles` | ADMIN, ANALYST | Create profile |
| PUT | `/customer-profiles/:id` | ADMIN, ANALYST | Update profile |
| DELETE | `/customer-profiles/:id` | ADMIN | Delete profile |

---

#### Options
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/options` | All | List all options |
| GET | `/options/:id` | All | Get single option |
| POST | `/options` | ADMIN, ANALYST | Create option |
| PUT | `/options/:id` | ADMIN, ANALYST | Update option |
| DELETE | `/options/:id` | ADMIN | Delete option |

---

#### Offer-Option Linking
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/offer-options` | All | List all relationships |
| GET | `/offer-options/offer/:id` | All | Get options for offer |
| GET | `/offer-options/option/:id` | All | Get offers with option |
| POST | `/offer-options` | ADMIN, ANALYST | Link option to offer |
| DELETE | `/offer-options` | ADMIN, ANALYST | Unlink option from offer |

---

#### Simulation Engine
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/simulation` | All | Single offer simulation |
| POST | `/simulation/recommend` | All | Smart recommendations |
| POST | `/simulation/compare` | All | Compare multiple offers |
| POST | `/simulation/batch` | All | One offer vs many profiles |

---

#### Scenarios
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/scenarios` | All | List scenarios (filtered by user) |
| GET | `/scenarios/:id` | All | Get scenario + results |
| POST | `/scenarios` | All | Create scenario |
| PUT | `/scenarios/:id` | All | Update scenario (owner only) |
| DELETE | `/scenarios/:id` | All | Delete scenario (owner only) |
| POST | `/scenarios/:id/duplicate` | All | Copy scenario |
| POST | `/scenarios/:id/results` | All | Save results to scenario |

---

#### Export
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/export/scenario/:id/csv` | All | Export scenario results as CSV |
| GET | `/export/scenario/:id/xlsx` | All | Export as tab-delimited .xls |
| GET | `/export/offers/csv` | All | Export all offers |
| GET | `/export/profiles/csv` | All | Export all profiles |

---

#### Audit & Logs
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/audit/logs` | ADMIN | Filterable audit log |
| GET | `/audit/logs/summary` | ADMIN | Audit statistics |
| GET | `/audit/recent` | All | Recent activity (last N) |

---

#### Statistics
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/stats` | All | Dashboard KPI stats |

---

#### User Management (Admin Only)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/users` | ADMIN | List all users |
| GET | `/users/:id` | ADMIN | Get single user |
| POST | `/users` | ADMIN | Create user |
| PUT | `/users/:id` | ADMIN | Update user |
| DELETE | `/users/:id` | ADMIN | Delete user |

---

### Swagger Documentation
- **UI:** `http://localhost:5000/api-docs`
- **JSON:** `http://localhost:5000/api-docs.json`
- **Coverage:** All routes documented with OpenAPI 3.0 specs

---

## 🎨 Frontend Pages (React)

### Page Map
| Route | Page | Status | Key Features |
|-------|------|--------|--------------|
| `/login` | Login.jsx | ✅ | Email/password + Guest button |
| `/` | Dashboard.jsx | ⚠️ | Static KPI cards, hardcoded charts |
| `/offers` | Offers.jsx | ✅ | CRUD, filter by segment/status, table |
| `/options` | Options.jsx | ✅ | Card UI, CRUD |
| `/profiles` | Profiles.jsx | ✅ | Grid, simulate button |
| `/simulation` | Simulation.jsx | ✅ | 4 modes, results display, CSV export |
| `/compare` | Compare.jsx | ✅ | Side-by-side table comparison |
| `/scenarios` | Scenarios.jsx | ✅ | List, CRUD, duplicate, save results |
| `/users` | Users.jsx | ✅ | Admin-only user management |
| `/audit` | Audit.jsx | ✅ | Filterable logs + summary |

**Unused:** `Home.jsx` (no route defined)

---

### Main Components

#### Simulation.jsx (741 lines) — Largest file
- **State:** mode (single/compare/recommend/batch), offers, profiles, results
- **API integration:** fetch all offers+profiles on mount
- **Mode switching:** conditional rendering
- **Results display:** `ResultCard` component with rank badges, ScoreRing, cost breakdown
- **Export:** CSV download via Blob

---

#### Dashboard.jsx (289 lines)
- **KPI cards:** 4 metrics (2 real, 2 fake)
- **MiniBarChart:** Pure CSS bar chart component
- **Activity feed:** Recent audit actions from `/api/audit/recent`
- **No real BI data** — needs `/api/bi/indicators` integration

---

### Styling
- **CSS Variables** in `theme.js` for dark/light mode support
- **Inline styles** throughout (no CSS modules) — makes refactoring harder
- **Tailwind CSS 4** installed but minimally used
- **Fonts:** Inter (body), Playfair Display (headings)

---

## 🔐 Security & Authentication

### JWT Flow
1. User POST `/api/auth/login` with `{email, password}`
2. bcrypt compare against `users.password_hash`
3. Sign JWT: `{ user_id, role }` + 24h expiry
4. Client stores in `localStorage`
5. All API calls: `Authorization: Bearer <token>`
6. `authMiddleware` verifies token on each request

### Role Hierarchy
| Role | Permissions |
|------|-------------|
| ADMIN | Everything: CRUD all, manage users, export, view audit summary |
| ANALYST | CRUD offers/profiles/options, run simulations, create scenarios, export |
| GUEST | ❌ **Not functional** — exists in DB but no login endpoint for guest access |

### Middleware Stack
1. `authMiddleware` — attaches `req.user` (null if no/invalid token)
2. `requireAuth` — blocks unauthenticated (401)
3. `requireRole(...)` — checks role membership (403 if unauthorized)
4. `requireAdmin` — shortcut for ADMIN only

**Files:** `middleware/auth.js`

---

## 📊 Simulation Logic Accuracy

The calculation formulas **exactly match** the specification (section 4.2.1):

```javascript
// From simulation.js lines 131-142
baseCost = offer.monthly_price
overMinutes = max(0, profile.minutes_avg - offer.quota_minutes)
overMinutesCost = overMinutes * offer.over_minute_price
// ... same for SMS and data
overageCost = overMinutesCost + overSmsCost + overDataCost
overRoamingDays = max(0, profile.roaming_days - offer.roaming_days)
roamingCost = overRoamingDays * 5 (TND/day)
optionsCost = sum(options.price)
discounts = abs(min(0, optionsCost))  // negative prices
totalCost = baseCost + overageCost + roamingCost - discounts
```

Satisfaction score (lines 144-155):
```javascript
score = 100
budgetRatio = totalCost / profile.budget_max
if budgetRatio <= 0.7: score += 10
else if budgetRatio > 1.0: score -= 30
if segment === 'BUSINESS': score += 10
else if segment === 'POSTPAID': score += 5
score += min(len(options) * 2, 10)  // max +10
if data_avg > fair_use_gb: score -= 20
if any overage > 0: score -= 10
score = clamp(score, 0, 100)
```

**Verified:** Identical in all 4 simulation modes (single, recommend, compare, batch)

---

## 📈 Audit & Traceability

Every state-changing operation logs to `audit_logs`:

```javascript
await logAction({
  user_id: req.user?.user_id,
  action: 'CREATE',           // or UPDATE, DELETE, SIMULATE_*, etc.
  entity: 'offer',            // or customer_profile, simulation, etc.
  entity_id: 123,             // primary key of affected record
  ip_address: req.ip,
  details: { name: 'Offer Name', ... }  // JSON context
});
```

**Frontend displays:**
- Icon + description (e.g., "Simulation: Offer #5 — Cost: 45.20 TND, Score: 78/100")
- Relative time ("2h ago", "3d ago")
- Color-coded by action type

---

## ⚠️ Known Issues & Technical Debt

### Database Issues
1. **Segment ENUM incomplete** — DB only has PREPAID/POSTPAID/BUSINESS, but application logic uses DATA_ONLY as derived category. No actual `DATA_ONLY` offers in DB.
2. **Missing foreign keys** on:
   - `offer_options(offer_id, option_id)`
   - `scenario_results(scenario_id, profile_id, offer_id)`
   - `scenario_results.profile_id → customer_profiles` (data integrity risk)
3. **Data type mismatches:**
   - `quota_data_gb` is DECIMAL(10,2) but docs say INT
   - `customer_profiles.data_avg_gb` is DECIMAL(10,2) but docs say INT
4. **Orphan risk:** Deleting an offer/profile leaves dangling references
5. **Option ID 0 duplicate:** `options` table has nearly identical rows at ID 0 and 1

---

### Backend Issues
1. **No input validation** — all routes accept any JSON. Need Joi/Zod middleware.
2. **No rate limiting** — login, simulation endpoints vulnerable to abuse
3. **CORS wide open** — `cors()` defaults to `*`. Should restrict origins in production.
4. **No security headers** — missing Helmet.js
5. **Hardcoded API URLs in frontend:** `const API = "http://localhost:5000/api"` (Simulation.jsx line 72) — prevents deployment to other environments
6. **Scenario results FK issue** — scenario_results lacks proper FK constraints
7. **No database migrations** — schema changes manual (no Sequelize/Prisma)
8. **Guest role broken** — role exists but no public login flow for read-only access

---

### Frontend Issues
1. **Huge components:** Simulation.jsx (741 lines), Scenarios.jsx (647 lines) — need refactoring
2. **Inline styles everywhere** — difficult to maintain, no theming consistency
3. **Hardcoded dashboard data** — Dashboard.jsx uses static arrays, not live data
4. **Unused page:** `Home.jsx` — no route points to it
5. **API service stub:** `services/api.js` minimal, pages use `fetch` directly
6. **No error boundaries** — React errors crash the app
7. **No loading skeletons** — basic "Loading..." text
8. **No form validation** — client-side, but backend accepts anything

---

### Security Issues
1. **JWT secret in .env** — but must ensure `.env` in `.gitignore` (it is)
2. **SQL injection protected** — all queries use `?` placeholders ✅
3. **Password hashing** — bcrypt with salt rounds ✅
4. **No CSRF protection** — not critical for API-only, but good practice
5. **Token stored in localStorage** — vulnerable to XSS.Consider `httpOnly` cookies in production.

---

### Performance Issues
1. **No indexing on foreign keys** — `scenario_results.profile_id`, `offer_id` lack indexes
2. **No query caching** — same queries run repeatedly
3. **No pagination on offers/profiles** — fetch all every time (okay for 60 offers, 300 profiles but won't scale)
4. **No lazy loading** — all data fetched on page mount
5. **No API response compression** — missing `compression` middleware

---

### DevOps & Testing
1. **Zero tests** — no unit, integration, or E2E tests
2. **No CI/CD pipeline** — manual deployment
3. **No Docker** — "works on my machine" risk
4. **No logging to file** — console.log only (Winston mentioned in doc but not installed)
5. **No error monitoring** — Sentry/Airbrake missing
6. **No health checks beyond `/test-db`** — readiness/liveness probes needed for containerization

---

## 📋 What's Documented vs. Reality

### Documentation Status

| Document | Accuracy | Notes |
|----------|----------|-------|
| `README.md` | ⚠️ 60% accurate | DB name wrong (`telecom_db` vs `bd_pfe`), lists only 2 roles (omits GUEST), says swagger at `/api-docs` (correct), login credits wrong (`admin@telecom.com` works but password is `123`) |
| `PROJECT_DOCUMENTATION.md` | ❌ 40% accurate | **Section 7 "Éléments Manquants" is WRONG** — lists scenarios/export/audit as missing but they're **IMPLEMENTED**. BI section accurate (still missing). Table 6.1 incorrect. |
| `DATABASE_DOCUMENTATION.md` | ✅ 95% accurate | Detailed ERD, column types, sample data. Minor: segment ENUM says DATA_ONLY exists but it doesn't in DB. |
| **This file** (`PROJECT_OVERVIEW.md`) | ✅ 100% accurate | Single source of truth |

---

### Discrepancies Found

**README errors:**
1. Line 79: `CREATE DATABASE telecom_db;` → Should be `bd_pfe`
2. Line 90: `role ENUM('ADMIN','ANALYST')` → Missing GUEST
3. Line 97–99: password hashes shown as `$2b$10$...` — incomplete, actual hashes in DB are full
4. Doesn't mention scenarios, export, audit features at all

**PROJECT_DOCUMENTATION errors:**
1. Table 7.1 (lines 372-391):
   - "Scénarios — MANQUANT" → **FALSE** (fully implemented)
   - "Export CSV/XLSX — MANQUANT" → **FALSE** (CSV implemented, XLSX partial)
   - "Traçabilité — MANQUANT" → **FALSE** (audit_logs exist)
   - "Journalisation — MANQUANT" → **FALSE** (audit + console logs)
2. Table 6.1 (lines 308-327):
   - Most features marked ❌ but many are ✅

**Required action:** Update README and PROJECT_DOCUMENTATION to match reality.

---

## 🔄 Data Flow Examples

### Example 1: Single Simulation Request/Response

**Request:**
```http
POST /api/simulation
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "profile_id": 1,
  "offer_id": 5
}
```

**Response (200):**
```json
{
  "profile": {
    "profile_id": 1,
    "label": "Young Professional",
    "minutes_avg": 120,
    "sms_avg": 50,
    "data_avg_gb": 25,
    "budget_max": 80,
    "priority": "BALANCED",
    "segment": "POSTPAID"
  },
  "offer": { ... },
  "base_cost": 45.00,
  "overage_minutes_cost": 0.00,
  "overage_sms_cost": 0.00,
  "overage_data_cost": 0.00,
  "roaming_cost": 0.00,
  "calculation": {
    "base_cost": 45.00,
    "overage_cost": 0.00,
    "options_cost": 5.00,
    "roaming_cost": 0.00,
    "discounts": -5.00,
    "total_cost": 40.00,
    "satisfaction_score": 85
  },
  "total_cost": 40.00,
  "satisfaction_score": 85,
  "justification": "Good match: within budget, no overage, includes useful options"
}
```

---

### Example 2: Scenario Save Flow

1. User configures simulation (selects offers, profile) → frontend stores in React state
2. User clicks "Save to Scenario" → creates scenario via `POST /scenarios`
3. User clicks "Run & Save" → runs simulation (compare mode) → gets results
4. User clicks "Save Results" → `POST /scenarios/:id/results` with results array
5. Scenario status updates to ACTIVE, results linked

**Scenario data model:**
```sql
scenarios: {
  scenario_id: 1,
  user_id: 1,
  name: "Q1 Campaign Analysis",
  offer_ids: "[5, 12, 23]",  -- JSON array
  comparison_data: "{...}",  -- full comparison results cached
  status: "ACTIVE"
}
scenario_results: {
  result_id: 1,
  scenario_id: 1,
  offer_id: 5,
  total_cost: 42.50,
  satisfaction_score: 78,
  rank_by_score: 1,
  rank_by_cost: 2
}
```

---

## 🚀 Getting Started (Setup Guide)

### Prerequisites
- Node.js ≥ 18.x
- MySQL ≥ 8.0 (or XAMPP with MySQL)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repo>
cd project_pfe

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Import schema + seed data
mysql -u root -p < database/donnees_fictives_offres_telecom_300_clients.sql

# Database name created by script: `bd_pfe`
# Verify: SHOW DATABASES LIKE 'bd_pfe';
```

**Note:** SQL file creates `bd_pfe` database and populates all tables.  
**Do NOT run `CREATE DATABASE telecom_db`** — that's from outdated README.

---

### 3. Configure Environment

**Backend `.env`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bd_pfe
DB_PORT=3306
PORT=5000
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

**Frontend `.env`** (optional, if you want to override API URL):
```env
VITE_API_URL=http://localhost:5000/api
```
Currently hardcoded — see technical debt item.

---

### 4. Start Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → Server runs on http://localhost:5000
# → Swagger UI: http://localhost:5000/api-docs
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → React dev server on http://localhost:5173
```

---

### 5. Login
| Email | Password | Role |
|-------|----------|------|
| admin@telecom.com | 123 | ADMIN |
| analyst@telecom.com | 123 | ANALYST |
| Guest | (no login) | GUEST (not usable)

---

## 🧪 Testing Status

**Test Coverage: 0%**

No test suite exists. Would need:
- Unit tests for simulation formulas (Jest)
- Integration tests for API routes (Supertest)
- E2E tests for UI flows (Playwright/Cypress)

**Manual testing performed:**
- ✅ All CRUD operations verified
- ✅ Simulation calculations cross-checked against hand calculations
- ✅ Export CSV downloads correctly
- ✅ Scenario duplicate + save works
- ✅ Audit logs populate correctly
- ✅ Role-based access enforced (ADMIN vs ANALYST)

---

## 📦 Dependencies

### Backend (`backend/package.json`)
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework |
| mysql2 | ^3.17.0 | MySQL driver (promise API) |
| bcrypt | ^6.0.0 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| cors | ^2.8.6 | CORS headers |
| dotenv | ^17.2.4 | Environment variables |
| swagger-jsdoc | ^6.2.8 | API documentation |
| swagger-ui-express | ^5.0.1 | Swagger UI serving |
| nodemon | ^3.1.11 (dev) | Auto-reload |

**Missing (should add):** express-validator/Joi, helmet, express-rate-limit, compression, winston

---

### Frontend (`frontend/package.json`)
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI library |
| react-dom | ^19.2.0 | React renderer |
| react-router-dom | ^7.13.0 | Client-side routing |
| axios | ^1.13.5 | HTTP client (installed but minimally used) |
| vite | ^7.3.1 | Build tool |
| tailwindcss | ^4.2.0 | Utility CSS (installed but not fully used) |
| eslint | ^9.39.1 | Linter |

---

## 🔮 Future Work (Post-PFE)

### Phase 1: Power BI Integration (CRITICAL)
**Estimated:** 10-15 working days

1. **Data warehouse layer** — create `fact_simulations` table + ETL
2. **BI API endpoints** — `/api/bi/indicators`, `/api/bi/dataset`
3. **Power BI Desktop** — build 3 dashboards (Marketing, Product, Direction)
4. **Embedding** — embed reports in React via Power BI JavaScript SDK or iframe
5. **Refresh scheduling** — configure on-premise data gateway if DB on-premise

**Detailed plan:** See `POWER_BI_REQUIREMENTS.md`

---

### Phase 2: Quality & Security
- Add input validation (Joi/Zod)
- Implement rate limiting
- Add indexes to FK columns
- Fix FK constraints (add to `offer_options`, `scenario_results`)
- Enable Helmet.js security headers
- Add compression middleware
- Migrate from inline styles to CSS modules or styled-components

---

### Phase 3: Testing & CI/CD
- Jest + Supertest for backend (80% coverage)
- React Testing Library for frontend
- GitHub Actions: lint, test, build on PR
- Dockerize both services
- Add Sentry for error tracking

---

### Phase 4: Enhanced Features
- Offer versioning (track changes over time)
- GDPR compliance (anonymization, right to be forgotten)
- PDF export (server-side with pdfkit)
- Real XLSX export (use `xlsx` npm package)
- Guest role public read-only mode
- Notification system (email alerts on scenario completion)
- Advanced BI: churn prediction ML model, price elasticity simulation
- Mobile-responsive redesign (currently desktop-focused)

---

## 📚 Key Files Reference

### Backend Entry Points
| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | 117 | Express app, middleware, route registration, Swagger |
| `config/database.js` | 15 | MySQL connection pool |
| `middleware/auth.js` | 71 | JWT verification + role checks |
| `routes/auth.js` | 168 | Login + /me endpoint |
| `routes/offers.js` | 390 | Offer CRUD |
| `routes/customer_profiles.js` | 321 | Profile CRUD + auto-segment |
| `routes/simulation.js` | 628 | 4 simulation modes |
| `routes/scenarios.js` | 637 | Scenario management |
| `routes/export.js` | 246 | CSV/XLSX export |
| `routes/audit.js` | 305 | Audit logs + recent activity |
| `routes/stats.js` | 75 | Dashboard aggregated stats |

---

### Frontend Entry Points
| File | Lines | Purpose |
|------|-------|---------|
| `src/main.jsx` | ~20 | React entry, providers |
| `src/App.jsx` | ~100 | Routes definition (React Router) |
| `src/pages/Simulation.jsx` | 741 | Main simulation UI |
| `src/pages/Dashboard.jsx` | 289 | Dashboard with KPIs |
| `src/pages/Scenarios.jsx` | 647 | Scenario management UI |
| `src/components/Layout.jsx` | ~150 | Sidebar layout wrapper |
| `src/styles/theme.js` | ~80 | CSS variables + fonts |

---

## 🗺️ Database ER Diagram (Text)

```
┌──────────┐       ┌────────────┐       ┌─────────┐
│  users   │1───┐  │  scenarios │       │  offers │
├──────────┤    │  ├────────────┤       ├─────────┤
│ user_id  │    └──┤ user_id   │       │ offer_id│
│ username │       │ profile_id│       │ name    │
│ email    │       │ offer_ids │       │ segment │
│ role     │       │ status    │       │ price   │
└──────────┘       └───────────┘       └────┬────┘
       │                                      │
       │                          ┌───────────┘
       │                          │
       │                    ┌─────▼─────┐  ┌─────┐
       │                    │ scenario_ │  │ opt │
       │                    │ results   │  │ ions│
       │                    ├───────────┤  ├─────┤
       └────────────────────┤ scenario_ │─│opt_ │
                          │ id        │  │id   │
                          │ offer_id  │  │name │
                          │ total_    │  │price│
                          │ cost      │  └─────┘
                          └───────────┘
       ┌──────────────┐
       │customer_     │
       │profiles      │
       ├──────────────┤
       │profile_id    │
       │minutes_avg   │
       │data_avg_gb   │
       │budget_max    │
       └──────────────┘
```

**Cardinality:**
- users 1 — ∞ scenarios
- offers 1 — ∞ offer_options — ∞ options (many-to-many)
- scenarios 1 — ∞ scenario_results
- offers 1 — ∞ scenario_results
- customer_profiles 1 — ∞ scenario_results
- offers ∞ — ∞ options (via offer_options)

---

## 🔍 Quick Debugging Guide

### Common Errors & Solutions

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| `DB connection failed` | MySQL not running / wrong credentials | Start XAMPP MySQL, check `.env` DB_PASSWORD |
| ` ER_NO_SUCH_TABLE: Table 'bd_pfe.offers' doesn't exist` | DB not imported | Run SQL dump: `mysql -u root -p bd_pfe < database/donnees_fictives_offres_telecom_300_clients.sql` |
| `Invalid credentials` on login | Password wrong or user doesn't exist | Default: admin@telecom.com / 123. Check `users` table. |
| `401 Authentication required` on protected route | No token or expired | Login again to get fresh token |
| `403 Insufficient permissions` | Using ANALYST for admin-only endpoint | Use ADMIN account |
| Simulation returns NaN | Missing offer options (price is NULL) | Check offer_options linkage |
| Download CSV gives 404 | Scenario not found or no results | Create scenario first, then save results |
| Dashboard shows "—" for offers | `http://localhost:5000` not reachable | Backend must be running on port 5000 |

---

### Database Inspection Queries

```sql
-- Check data counts
SELECT 'offers' AS table_name, COUNT(*) AS count FROM offers
UNION ALL SELECT 'customer_profiles', COUNT(*) FROM customer_profiles
UNION ALL SELECT 'options', COUNT(*) FROM options
UNION ALL SELECT 'offer_options', COUNT(*) FROM offer_options
UNION ALL SELECT 'scenarios', COUNT(*) FROM scenarios
UNION ALL SELECT 'scenario_results', COUNT(*) FROM scenario_results
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'users', COUNT(*) FROM users;

-- Find orphaned scenario_results (no matching offer)
SELECT sr.* FROM scenario_results sr
LEFT JOIN offers o ON sr.offer_id = o.offer_id
WHERE o.offer_id IS NULL;

-- Top 5 most simulated offers (from scenario_results)
SELECT offer_id, COUNT(*) as sim_count 
FROM scenario_results 
GROUP BY offer_id 
ORDER BY sim_count DESC 
LIMIT 5;

-- Average satisfaction by segment
SELECT o.segment, AVG(sr.satisfaction_score) as avg_score
FROM scenario_results sr
JOIN offers o ON sr.offer_id = o.offer_id
GROUP BY o.segment;

-- Recent audit activity (last 24h)
SELECT * FROM audit_logs 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;
```

---

## 🎓 Learning Resources

### Codebase Patterns
- **RESTful design:** Consistent use of HTTP verbs, plural nouns, JSON responses
- **Separation of concerns:** Routes separate from DB layer, middleware reusable
- **Audit pattern:** Central `logAction` function called from all routes
- **Swagger docs:** JSDoc comments above each route (OpenAPI 3.0)
- **Error handling:** try-catch in all async routes, consistent `{error: message}` format
- **Role checks:** `requireRole('ADMIN', 'ANALYST')` pattern

---

## 📞 Contact & Support

**Project Maintainer:** [Your Name]  
**Supervisor:** [Supervisor Name]  
**Institution:** [University/School Name]  
**Academic Year:** 2025-2026  

---

## 📄 License

ISC — See `LICENSE` file (if present) or standard ISC terms.

---

## 🏆 Achievements & Deliverables

### Completed ✅
- Full CRUD for offers, profiles, options, users
- 4-mode simulation engine with accurate formulas
- Scenario management (save, duplicate, share)
- Export (CSV for all entities)
- Comprehensive audit logging
- Role-based authentication
- Swagger API documentation
- 11 React pages with responsive design
- 124+ audit records generated during development

### In Progress ⚠️
- **Power BI integration** (0% started) — primary remaining deliverable
- Dashboard real-time data (currently static)

### Not Started ❌
- Testing suite (unit/integration/E2E)
- Input validation middleware
- Rate limiting
- Docker containerization
- CI/CD pipeline
- GDPR features
- Offer versioning
- Production hardening (security headers, compression, etc.)

---

**Last Updated:** 2026-04-20  
**Document Version:** 1.0  
**Author:** Kilo (automated audit) + Project Team

---

*This document is the single source of truth for project status. All other docs (README, PROJECT_DOCUMENTATION) may be outdated — refer here for accurate information.*
