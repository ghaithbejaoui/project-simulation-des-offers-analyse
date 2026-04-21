# Database Documentation

## Overview

**Database:** MySQL/MariaDB (bd_pfe)  
**Technology:** mysql2 (Node.js)  
**Engine:** InnoDB  
**Charset:** utf8mb4

---

## Entity-Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users   │       │   offers   │       │customer_profiles│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ user_id (PK)│       │ offer_id (PK)│       │ profile_id (PK)│
│ username   │       │ name         │       │ label        │
│ email      │       │ segment     │       │ minutes_avg │
│ password_hash│     │ monthly_price│      │ sms_avg     │
│ role       │       │ quota_*     │       │ data_avg_gb │
│ created_at │       │ over_*_price│       │ budget_max  │
│ updated_at │       │ status      │       │ priority    │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
                    ┌────────┴────────┐
                    │ offer_options    │
                    ├─────────────────┤
                    │ offer_id (FK)   │
                    │ option_id (FK)   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │    options     │
                    ├────────────────┤
                    │ option_id (PK) │
                    │ name          │
                    │ price         │
                    │ type          │
                    └───────────────┘

┌─────────────┐       ┌─────────────┐
│  scenarios │        │fact_simulations│
├─────────────┤        ├────────────────┤
│scenario_id │        │ simulation_id │
│ name      │        │ offer_id (FK) │
│profile_id │        │ profile_id(FK)│
│ offer_ids │        │ total_cost    │
│ status   │        │ satisfaction_│
│ user_id  │        │ overage_*    │
│ created  │        │ sim_type    │
└────┬────┘        │ created_at  │
     │             └────────────┘
     │
┌────┴─────────┐  ┌──────────────┐
│scenario_    │  │  audit_logs │
│ results    │  ├────────────┤
├────────────┤  │ log_id     │
│result_id   │  │ user_id(FK)│
│ scenario_ │  │ action    │
│ offer_id  │  │ entity   │
│ total_cost│  │ entity_id│
│score_rank │  │ ip_addr  │
└──────────┘  │ details  │
                │ created │
                └─────────┘
```

---

## Tables

### 1. users

System users with role-based access control.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| user_id | INT | PK, AUTO_INCREMENT | User identifier |
| username | VARCHAR(100) | NOT NULL | Display name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| role | ENUM('ADMIN','ANALYST','GUEST') | NOT NULL, DEFAULT 'ANALYST' | Access level |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE | Last update |

**Default Users:**
```sql
-- Password for all: '123'
(1, 'admin', 'admin@telecom.com', ADMIN)
(2, 'analyst', 'analyst@telecom.com', ANALYST)
(3, 'Guest', 'guest@telecom.com', GUEST)
```

---

### 2. offers

Telecom tariff offers catalog with quota and pricing parameters.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| offer_id | INT | PK, AUTO_INCREMENT | Offer identifier |
| name | VARCHAR(100) | NOT NULL | Offer name |
| segment | ENUM('PREPAID','POSTPAID','BUSINESS') | NOT NULL | Market segment |
| monthly_price | DECIMAL(10,2) | NOT NULL | Base monthly price |
| quota_minutes | INT | DEFAULT 0 | Included minutes |
| quota_sms | INT | DEFAULT 0 | Included SMS |
| quota_data_gb | DECIMAL(10,2) | DEFAULT 0.00 | Included data (GB) |
| validity_days | INT | DEFAULT 30 | Offer validity |
| fair_use_gb | DECIMAL(10,2) | DEFAULT 0.00 | Fair use threshold |
| over_minute_price | DECIMAL(10,4) | DEFAULT 0.1000 | Per-minute overage |
| over_sms_price | DECIMAL(10,4) | DEFAULT 0.0500 | Per-SMS overage |
| over_data_price | DECIMAL(10,4) | DEFAULT 0.5000 | Per-GB overage |
| roaming_included_days | INT | DEFAULT 0 | Roaming days included |
| status | ENUM('PUBLISHED','DRAFT','RETIRED') | DEFAULT 'PUBLISHED' | Offer status |

**Segments:**
- PREPAID: Pay-as-you-go offers
- POSTPAID: Monthly billed contracts
- BUSINESS: Enterprise/business plans

**Sample Records:** 61 offers (3 DRAFT, 5 RETIRED, 53 PUBLISHED)

---

### 3. customer_profiles

Client usage profiles representing typical customer behavior patterns.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| profile_id | INT | PK, AUTO_INCREMENT | Profile identifier |
| label | VARCHAR(100) | NOT NULL | Profile name |
| minutes_avg | INT | DEFAULT 0 | Monthly minutes usage |
| sms_avg | INT | DEFAULT 0 | Monthly SMS count |
| data_avg_gb | DECIMAL(10,2) | DEFAULT 0.00 | Monthly data (GB) |
| night_usage_pct | INT | DEFAULT 0 | Night usage percentage |
| roaming_days | INT | DEFAULT 0 | Roaming days/year |
| budget_max | DECIMAL(10,2) | DEFAULT 0.00 | Max budget |
| priority | ENUM('PRICE','QUALITY','BALANCED') | DEFAULT 'BALANCED' | Priority preference |

**Sample Records:** 301 profiles

---

### 4. options

Add-on options that can be attached to offers.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| option_id | INT | PK, AUTO_INCREMENT | Option identifier |
| name | VARCHAR(100) | NOT NULL | Option name |
| description | TEXT | NULL | Details |
| price | DECIMAL(10,2) | NOT NULL | Option price |
| type | ENUM('ROAMING','DATA','VOICE','SMS','OTHER') | DEFAULT 'OTHER' | Option type |

**Sample Records:** 41 options

---

### 5. offer_options

Many-to-many relationship between offers and options.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| offer_id | INT | FK, PK part 1 | Reference to offer |
| option_id | INT | FK, PK part 2 | Reference to option |

**Relationship:** One offer can have multiple options; one option can apply to multiple offers.

**Sample Records:** 145 relationships

---

### 6. scenarios

Saved simulation scenarios for reuse.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| scenario_id | INT | PK, AUTO_INCREMENT | Scenario identifier |
| name | VARCHAR(100) | NOT NULL | Scenario name |
| profile_id | INT | FK | Reference to customer profile |
| offer_ids | JSON | NULL | Array of offer IDs |
| status | ENUM('DRAFT','ACTIVE') | DEFAULT 'DRAFT' | Scenario status |
| user_id | INT | FK | Owner user |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update |

**Sample Records:** 14 scenarios

---

### 7. scenario_results

Simulation results per scenario.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| result_id | INT | PK, AUTO_INCREMENT | Result identifier |
| scenario_id | INT | FK | Reference to scenario |
| offer_id | INT | FK | Reference to offer |
| total_cost | DECIMAL(10,2) | NOT NULL | Simulated total cost |
| satisfaction_score | INT | NOT NULL | Score 0-100 |
| cost_rank | INT | NULL | Ranking by cost |
| score_rank | INT | NULL | Ranking by score |
| created_at | TIMESTAMP | DEFAULT NOW() | Simulation time |

**Sample Records:** 44 results

---

### 8. fact_simulations

Fact table for BI analytics - stores all simulation runs.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| simulation_id | INT | PK, AUTO_INCREMENT | Simulation identifier |
| offer_id | INT | FK | Offer simulated |
| profile_id | INT | FK | Profile used |
| total_cost | DECIMAL(10,2) | NOT NULL | Calculated total cost |
| satisfaction_score | INT | NOT NULL | Satisfaction 0-100 |
| overage_minutes | DECIMAL(10,2) | DEFAULT 0.00 | Minutes over quota |
| overage_sms | DECIMAL(10,2) | DEFAULT 0.00 | SMS over quota |
| overage_data_gb | DECIMAL(10,2) | DEFAULT 0.00 | Data over quota |
| simulation_type | VARCHAR(20) | NOT NULL | 'single','compare','recommend','batch' |
| user_id | INT | FK | User who ran simulation |
| created_at | TIMESTAMP | DEFAULT NOW() | Simulation time |

**Sample Records:** 500+ simulations

---

### 9. audit_logs

Action audit trail for compliance and tracing.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| log_id | INT | PK, AUTO_INCREMENT | Log identifier |
| user_id | INT | FK, NULL | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action type (LOGIN, CREATE, etc.) |
| entity | VARCHAR(100) | NULL | Entity affected |
| entity_id | INT | NULL | Entity identifier |
| ip_address | VARCHAR(45) | NULL | Client IP |
| details | TEXT | NULL | JSON details |
| created_at | TIMESTAMP | DEFAULT NOW() | Action time |

**Actions:** LOGIN, LOGIN_FAILED, LOGOUT, CREATE, UPDATE, DELETE, SIMULATE_SINGLE, SIMULATE_COMPARE, SIMULATE_RECOMMEND, SAVE_RESULTS, DUPLICATE

**Sample Records:** 200+ logs

---

## Views (BI)

### 1. vw_arpu

Average Revenue Per User by offer.

| Column | Type | Description |
|--------|------|-------------|
| offer_id | INT | Offer identifier |
| offer_name | VARCHAR(100) | Offer name |
| offer_segment | VARCHAR(50) | Market segment |
| simulation_count | BIGINT | Total simulations |
| arpu | DECIMAL(11,2) | Average revenue |
| min_cost | DECIMAL(10,2) | Minimum simulated cost |
| max_cost | DECIMAL(10,2) | Maximum simulated cost |

---

### 2. vw_overage

Overage metrics by offer.

| Column | Type | Description |
|--------|------|-------------|
| offer_id | INT | Offer identifier |
| offer_name | VARCHAR(100) | Offer name |
| offer_segment | VARCHAR(50) | Market segment |
| total_sims | BIGINT | Total simulations |
| sims_with_overage | DECIMAL(25,0) | Simulations with overage |
| overage_pct | DECIMAL(31,2) | Percentage with overage |
| avg_overage_cost | DECIMAL(13,2) | Average overage cost |
| avg_minutes_overage | DECIMAL(11,2) | Avg minutes over |
| avg_sms_overage | DECIMAL(11,2) | Avg SMS over |
| avg_data_overage | DECIMAL(11,2) | Avg data over |

---

### 3. vw_recommendation_rate

Recommendation frequency by offer.

| Column | Type | Description |
|--------|------|-------------|
| offer_id | INT | Offer identifier |
| offer_name | VARCHAR(100) | Offer name |
| offer_segment | VARCHAR(50) | Market segment |
| total_sims | BIGINT | Total simulations |
| recommended_count | DECIMAL(25,0) | Times recommended |
| recommendation_rate_pct | DECIMAL(31,2) | Recommendation % |
| avg_score | DECIMAL(5,1) | Average satisfaction |

---

### 4. vw_daily_volume

Daily simulation volume.

| Column | Type | Description |
|--------|------|-------------|
| sim_date | DATE | Simulation date |
| simulation_type | VARCHAR(20) | Type of simulation |
| simulation_count | BIGINT | Number of runs |
| avg_cost | DECIMAL(11,2) | Average cost |
| avg_score | DECIMAL(5,1) | Average satisfaction |

---

### 5. vw_segment_summary

Summary metrics by market segment.

| Column | Type | Description |
|--------|------|-------------|
| offer_segment | VARCHAR(50) | PREPAID/POSTPAID/BUSINESS |
| total_sims | BIGINT | Total simulations |
| avg_arpu | DECIMAL(11,2) | Average ARPU |
| avg_score | DECIMAL(5,1) | Average satisfaction |
| overage_pct | DECIMAL(31,2) | Overage percentage |
| recommendation_rate_pct | DECIMAL(31,2) | Recommendation % |

---

## Calculation Formulas

### Total Cost Calculation

```
Cost = Base_Price + Overage_Charges + Roaming - Discounts

Where:
- Overage_Charges = max(0, minutes - quota_minutes) * over_minute_price
                  + max(0, sms - quota_sms) * over_sms_price  
                  + max(0, data_gb - quota_data_gb) * over_data_price
```

### Satisfaction Score (0-100)

```
Score = 100 - (cost_penalty + overage_penalty + budget_penalty)

Factors:
- Budget penalty: exceeds budget_max
- Overage penalty: usage beyond quotas
- Cost efficiency: value for money
```

---

## Foreign Key Relationships

```sql
-- Current FK constraints (verified in routes code)
offer_options.offer_id -> offers.offer_id
offer_options.option_id -> options.option_id
scenarios.profile_id -> customer_profiles.profile_id
scenarios.user_id -> users.user_id
scenario_results.scenario_id -> scenarios.scenario_id
scenario_results.offer_id -> offers.offer_id
fact_simulations.offer_id -> offers.offer_id
fact_simulations.profile_id -> customer_profiles.profile_id
fact_simulations.user_id -> users.user_id
audit_logs.user_id -> users.user_id
```

**Note:** FK constraints are defined in application logic but not enforced at DB level (see Known Issues in PROJECT_OVERVIEW.md).

---

## Indexes

Primary indexes are on PK columns. Additional indexes for common queries:

| Table | Index | Columns |
|-------|-------|---------|
| offers | idx_segment | segment, status |
| offers | idx_status | status |
| customer_profiles | idx_priority | priority |
| fact_simulations | idx_created | created_at |
| fact_simulations | idx_offer_profile | offer_id, profile_id |
| audit_logs | idx_created | created_at |
| audit_logs | idx_user | user_id |

---

## Environment Variables

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bd_pfe
DB_PORT=3306
```

---

## Import Database

```bash
mysql -u root -p bd_pfe < database/donnees_fictives_offres_telecom_300_clients.sql
```

---

**Last Updated:** 2026-04-21