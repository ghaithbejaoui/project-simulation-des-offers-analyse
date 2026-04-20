# Power BI Integration Requirements — Technical Specification

**Project:** Telecom Offers Simulation Platform  
**Document:** BI Integration Requirements & Implementation Plan  
**Status:** 📋 PLANNING — Not yet implemented (0% complete)  
**Priority:** CRITICAL — Primary remaining deliverable per cahier des charges  
**Estimated Effort:** 10-15 working days  
**Target Completion:** Before PFE submission

---

## 📖 Table of Contents

1. [Business Context & Requirements](#1-business-context--requirements)
2. [Technical Architecture](#2-technical-architecture)
3. [Data Warehouse Design](#3-data-warehouse-design)
4. [BI API Endpoints](#4-bi-api-endpoints)
5. [Power BI Desktop Development](#5-power-bi-desktop-development)
6. [Embedding in React Frontend](#6-embedding-in-react-frontend)
7. [Deployment & Refresh Strategy](#7-deployment--refresh-strategy)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Cost Estimate](#9-cost-estimate)
10. [Risks & Mitigations](#10-risks--mitigations)

---

## 1. Business Context & Requirements

### 1.1 Why Power BI?

The cahier des charges (section 1) specifies:

> "la génération d'indicateurs pour le pilotage via Power BI (usage, coût, ARPU simulé, churn potentiel)"

Power BI is **not optional** — it's a core requirement for business intelligence and decision-making dashboards.

### 1.2 Business Questions to Answer

The BI layer must enable stakeholders to answer:

| Stakeholder | Questions |
|--------------|-----------|
| **Marketing** | Which offers are most competitive? Where do customers exceed quotas (heatmap)? Which segments are underserved? |
| **Product** | Which options are most popular? What's the optimal price point? Which offers have highest churn risk? |
| **Direction** | What's our simulated ARPU? What revenue potential is left? Where can we optimize costs? |
| **Analysts** | Which profiles match which offers? What's the recommendation accuracy? |

### 1.3 Specified Indicators (Section 8.1)

From the original document:

1. ✅ **Coût total par profil** — Already calculated in simulation engine
2. ✅ **Différentiel vs offre la moins chère** — Already calculated (`rank_by_cost`)
3. ❌ **ARPU simulé** — NOT YET (average revenue per simulated user)
4. ❌ **Part d'offres recommandées** — NOT YET (% of simulations where offer recommended)
5. ❌ **% dépassement** — NOT YET (profiles exceeding quotas)
6. ✅ **Coût roaming** — Already calculated (`roaming_cost`)
7. ❌ **Top options utilisées** — NOT YET (most frequently selected options)

### 1.4 Required Dashboards (Section 8.3)

Three separate views:

1. **Marketing Dashboard**
   - KPI: Offer competitiveness index
   - Heatmap: Overage occurrences by segment × offer type
   - Bar chart: Top 10 offers by simulation volume
   - Scatter: Cost vs satisfaction (color by segment)

2. **Product Dashboard**
   - Table: Offer performance (avg cost, satisfaction, recommendation rate)
   - Pie/bar: Options usage frequency
   - Trend: Fair use violations over time
   - Metric: Average overage cost per user

3. **Direction Dashboard**
   - KPI cards: Total simulated revenue, ARPU, potential savings, churn risk %  
   - Trend: Monthly revenue forecast
   - Funnel: Recommendations vs actual matches
   - Table: High-value customer segments

---

## 2. Technical Architecture

### 2.1 Current State (Pre-BI)

```
Frontend (React)
   ↓ fetch('/api/simulation')
Backend (Express)
   ↓ MySQL queries
MySQL OLTP Database
   (offers, profiles, options, scenarios, audit_logs)
```

**Problem:** OLTP database not optimized for BI queries. Aggregations across 1000s of simulations would be slow.

### 2.2 Target State (Post-BI)

```
┌─────────────────┐
│   Power BI      │ ← Interactive dashboards
│   Desktop       │    (3 reports: Marketing, Product, Direction)
└────────┬────────┘
         │ DirectQuery or Scheduled Import
┌────────┴─────────────────────────────┐
│  Power BI Service (cloud)            │
│  + On-premise Data Gateway (if needed)│
└────────┬─────────────────────────────┘
         │ Scheduled refresh (daily/ hourly)
┌────────┴─────────────────────────────┐
│   BI API Layer (Node.js)             │ ← New: /api/bi/*
│   - Pre-aggregated metrics           │
│   - Star schema endpoints            │
│   - Authentication + RLS             │
└────────┬─────────────────────────────┘
         │ Query
┌────────┴─────────────────────────────┐
│   Data Warehouse (MySQL)             │ ← New: fact_simulations, dim_date
│   - fact_simulations (fact table)    │
│   - dim_date (date dimension)        │
│   - Aggregated daily_kpi (materialized)│
└────────┬─────────────────────────────┘
         │ ETL/Logging
┌────────┴─────────────────────────────┐
│   OLTP Database (existing)           │ ← Modified: simulation routes
│   - offers, customer_profiles        │    now log to fact_simulations
│   - options, scenarios               │
│   - audit_logs                       │
└──────────────────────────────────────┘
```

### 2.3 Data Flow

```
Every simulation run (POST /api/simulation, /recommend, /compare, /batch):
   ↓
Backend calculates cost + score
   ↓
NEW: INSERT INTO fact_simulations (…)
   ↓
Also: INSERT INTO scenario_results IF saved to scenario
   ↓
Nightly ETL job aggregates → daily_kpi
   ↓
Power BI (scheduled refresh at 6am daily)
   ↓
Dashboard updated (next day AM)
```

**Latency:** ~12-24 hours (acceptable for management reporting). Real-time not required.

---

## 3. Data Warehouse Design

### 3.1 Star Schema Requirements

Power BI performs best with **dimensional modeling** (Kimball methodology). Needed tables:

#### Fact Table: `fact_simulations` (CORE)

**Purpose:** Store every simulation run (not just saved scenarios) for trend analysis.

```sql
CREATE TABLE fact_simulations (
    fact_id           INT PRIMARY KEY AUTO_INCREMENT,
    simulation_id     VARCHAR(50)  NOT NULL,   -- UUID or timestamp+user hash
    profile_id        INT,                     -- FK → customer_profiles.profile_id
    offer_id          INT,                     -- FK → offers.offer_id
    user_id           INT,                     -- FK → users.user_id (who ran it)
    base_cost         DECIMAL(10,2) NOT NULL,  -- offer.monthly_price
    overage_cost      DECIMAL(10,2) NOT NULL DEFAULT 0,
    roaming_cost      DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost        DECIMAL(10,2) NOT NULL,
    satisfaction_score INT NOT NULL,           -- 0-100
    recommendation    VARCHAR(50),             -- good_match/okay_match/not_recommended
    budget_ratio      DECIMAL(10,4),           -- total_cost / budget_max
    overage_minutes   INT DEFAULT 0,           -- minutes exceeded
    overage_sms       INT DEFAULT 0,
    overage_data_gb   DECIMAL(10,2) DEFAULT 0,
    options_count     INT DEFAULT 0,           -- number of linked options
    fair_use_exceeded BOOLEAN DEFAULT FALSE,
    segment           ENUM('PREPAID','POSTPAID','BUSINESS','DATA_ONLY'),
    simulated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Indexes for performance
    INDEX idx_profile_offer (profile_id, offer_id),
    INDEX idx_simulated_at (simulated_at),
    INDEX idx_user (user_id),
    INDEX idx_segment (segment),
    INDEX idx_recommendation (recommendation),
    -- Foreign keys (add after tables exist)
    CONSTRAINT fk_fact_profile FOREIGN KEY (profile_id) REFERENCES customer_profiles(profile_id) ON DELETE SET NULL,
    CONSTRAINT fk_fact_offer FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE SET NULL,
    CONSTRAINT fk_fact_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Volume estimate:** With 300 profiles × 60 offers = 18,000 possible combinations. Realistic usage: 1000-5000 simulation rows first year.

---

#### Dimension Table: `dim_date`

For time-intelligence DAX measures (month-over-month, YTD, etc.).

```sql
CREATE TABLE dim_date (
    date_key       INT PRIMARY KEY,        -- YYYYMMDD integer
    date           DATE NOT NULL,
    day_of_week    INT NOT NULL,           -- 1=Monday, 7=Sunday
    day_name       VARCHAR(10),
    month          INT NOT NULL,
    month_name     VARCHAR(20),
    quarter        INT NOT NULL,
    year           INT NOT NULL,
    is_weekend     BOOLEAN DEFAULT FALSE,
    is_holiday     BOOLEAN DEFAULT FALSE    -- could be set manually
) ENGINE=InnoDB;

-- Populate for 5 years (2024-2028)
INSERT INTO dim_date 
SELECT 
    DATE_FORMAT(d, '%Y%m%d')*1 AS date_key,
    d AS date,
    DAYOFWEEK(d) AS day_of_week,
    DAYNAME(d) AS day_name,
    MONTH(d) AS month,
    MONTHNAME(d) AS month_name,
    QUARTER(d) AS quarter,
    YEAR(d) AS year,
    DAYOFWEEK(d) IN (1,7) AS is_weekend,
    FALSE AS is_holiday
FROM (
    SELECT DATE_ADD('2024-01-01', INTERVAL @row:=@row+1 DAY) AS d
    FROM mysql.user, (SELECT @row:=-1) r
    LIMIT 1826  -- 5 years
) dates;
```

---

#### Aggregate Table: `daily_kpi` (OPTIONAL but recommended)

Pre-computed daily aggregates for fast dashboard loading.

```sql
CREATE TABLE daily_kpi (
    kpi_date DATE PRIMARY KEY,
    total_simulations INT NOT NULL DEFAULT 0,
    avg_satisfaction DECIMAL(5,2) DEFAULT 0,
    avg_total_cost DECIMAL(10,2) DEFAULT 0,
    good_match_pct DECIMAL(5,2) DEFAULT 0,       -- % with score>=70 & within budget
    overage_occurrence_pct DECIMAL(5,2) DEFAULT 0, -- % with any overage
    top_option_id INT NULL,                       -- most commonly used option_id
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (kpi_date)
) ENGINE=InnoDB;

-- Populate initially from fact_simulations (will be updated by ETL job)
INSERT INTO daily_kpi (kpi_date, total_simulations, avg_satisfaction, avg_total_cost, good_match_pct, overage_occurrence_pct, top_option_id, updated_at)
SELECT 
    DATE(simulated_at) as kpi_date,
    COUNT(*) as total_simulations,
    AVG(satisfaction_score) as avg_satisfaction,
    AVG(total_cost) as avg_total_cost,
    SUM(CASE WHEN satisfaction_score >= 70 AND total_cost <= (SELECT budget_max FROM customer_profiles WHERE profile_id = fs.profile_id) THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as good_match_pct,
    SUM(CASE WHEN overage_cost > 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as overage_occurrence_pct,
    (SELECT option_id FROM (
        SELECT oo.option_id, COUNT(*) as cnt
        FROM fact_simulations fs2
        JOIN offer_options oo ON fs2.offer_id = oo.offer_id
        WHERE DATE(fs2.simulated_at) = DATE(fs.simulated_at)
        GROUP BY oo.option_id
        ORDER BY cnt DESC LIMIT 1
    ) topopt) as top_option_id,
    NOW()
FROM fact_simulations fs
GROUP BY DATE(simulated_at);
```

---

### 3.2 ETL: Populating `fact_simulations`

#### Option A: Trigger-based (REAL-TIME, SIMPLEST)

Add direct `INSERT` into simulation routes after calculation.

**Files to modify:**
- `backend/routes/simulation.js` — all 4 endpoints

**Code addition (after line 192 in `/` route, after line 327 in `/recommend`, after line 490 in `/compare`, after line 625 in `/batch`):**

```javascript
// Log to fact_simulations for BI
try {
  const resultsToLog = Array.isArray(results) ? results : [results];
  for (const r of resultsToLog) {
    await db.query(`
      INSERT INTO fact_simulations 
      (simulation_id, profile_id, offer_id, user_id, base_cost, overage_cost, 
       roaming_cost, total_cost, satisfaction_score, recommendation, budget_ratio,
       overage_minutes, overage_sms, overage_data_gb, options_count, 
       fair_use_exceeded, segment, simulated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      // Generate unique simulation_id: timestamp+user+random
      `sim_${req.user?.user_id || 'anon'}_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      r.profile?.profile_id || r.profile_id || null,
      r.offer?.offer_id || r.offer_id || null,
      req.user?.user_id || null,
      r.base_cost || 0,
      r.overage_cost || 0,
      r.roaming_cost || 0,
      r.total_cost || 0,
      r.satisfaction_score || 0,
      r.recommendation || null,
      // budget_ratio
      (r.total_cost / (r.profile?.budget_max || 1)) || null,
      // overage breakdown (need to recalculate or extract from nested calc)
      // For batch mode we have these; for single/recommend we need to compute from profile/offer
      // Option: recompute here or pass through
      // Simplification: compute on read from fact table joins later
      0, 0, 0,  -- populate in separate step or compute on read
      r.offer?.options?.length || 0,
      (r.profile?.data_avg_gb > r.offer?.fair_use_gb) || false,
      r.offer?.segment || r.segment || 'POSTPAID'
    ]);
  }
} catch (err) {
  console.error('Failed to log to fact_simulations:', err.message);
  // Don't throw — simulation already succeeded, BI logging is best-effort
}
```

**Pros:** Immediate availability, no cron needed.  
**Cons:** Adds ~50-100ms per simulation (acceptable). Duplicate simulation_id risk? Use UUID.

---

#### Option B: Batch ETL (DAILY, OFF-PEAK)

Run nightly job to copy from `audit_logs` or `scenario_results` into `fact_simulations`.

**Where:** `backend/jobs/etl.js` run via `node jobs/etl.js` or system cron.

```javascript
// jobs/etl.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runETL() {
  const db = mysql.createPool({ ... });
  
  // Get simulations from last 24h from audit_logs where action = 'SIMULATE_*'
  const [logs] = await db.query(`
    SELECT * FROM audit_logs 
    WHERE action IN ('SIMULATE_SINGLE','SIMULATE_RECOMMEND','SIMULATE_COMPARE','SIMULATE_BATCH')
      AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY created_at DESC
  `);
  
  // Parse details JSON and insert into fact_simulations
  // (omitted — complex due to varying log formats)
  
  // Or simpler: recompute from scenario_results if they saved results
  const [saved] = await db.query(`
    INSERT INTO fact_simulations 
    (profile_id, offer_id, user_id, base_cost, overage_cost, roaming_cost, 
     total_cost, satisfaction_score, recommendation, simulated_at)
    SELECT 
      sr.profile_id, sr.offer_id, 
      (SELECT user_id FROM scenarios WHERE scenario_id = sr.scenario_id) as user_id,
      sr.base_cost, sr.overage_cost, sr.roaming_cost, sr.total_cost,
      sr.satisfaction_score, sr.recommendation, NOW()
    FROM scenario_results sr
    WHERE sr.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ON DUPLICATE KEY UPDATE simulated_at = NOW()  -- skip if already exists
  `);
  
  console.log(`[ETL] Inserted ${saved.affectedRows} rows into fact_simulations`);
}

runETL().catch(console.error);
```

**Schedule:** `0 2 * * * node /path/to/etl.js` (daily at 2 AM)

**Pros:** No impact on simulation response time.  
**Cons:** Data up to 24h stale; complexity; duplicates if simulation_id not unique.

---

#### Recommendation: Use Option A (trigger-based logging)

Modify simulation routes to INSERT directly. Simpler, immediate data availability for Power BI refresh. Acceptable performance overhead (~70ms per simulation).

**Implementation:**
1. Create `fact_simulations` table (SQL above)
2. Modify `simulation.js` routes to log every result
3. Ensure indexes added
4. Test with batch of 100 simulations → verify row count

**Expected row rate:** With 10 simulations/day average → ~3000 rows/year (small, fine for Power BI Import mode)

---

### 3.3 Foreign Key Constraints

**Currently missing** — must be added:

```sql
-- 1. offer_options
ALTER TABLE offer_options 
  ADD CONSTRAINT fk_oo_offer 
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_oo_option 
    FOREIGN KEY (option_id) REFERENCES options(option_id) ON DELETE CASCADE;

-- 2. scenario_results
ALTER TABLE scenario_results
  ADD CONSTRAINT fk_sr_scenario 
    FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_sr_profile 
    FOREIGN KEY (profile_id) REFERENCES customer_profiles(profile_id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_sr_offer 
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE SET NULL;

-- 3. fact_simulations (already defined with FKs above)
-- But need to add ON DELETE actions if desired:
ALTER TABLE fact_simulations
  DROP FOREIGN KEY IF EXISTS fk_fact_profile,
  DROP FOREIGN KEY IF EXISTS fk_fact_offer,
  DROP FOREIGN KEY IF EXISTS fk_fact_user;
-- Then re-add with ON DELETE SET NULL (simulations preserved if profile/offer deleted)
```

**⚠️ Caution:** Adding FKs to existing tables with data may fail if orphaned rows exist. Clean first:

```sql
-- Find orphaned scenario_results
SELECT sr.* FROM scenario_results sr
LEFT JOIN offers o ON sr.offer_id = o.offer_id WHERE o.offer_id IS NULL;
-- Delete or fix these before adding FK
```

---

## 4. BI API Endpoints

Create new file: `backend/routes/bi.js`

**Security:** All endpoints require at least `requireAuth`; some require `requireAdmin` (e.g., data export)

```javascript
const express = require('express');
const db = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { logAction } = require('./audit');
const router = express.Router();

/**
 * @swagger
 * /api/bi/indicators:
 *   get:
 *     summary: Get key BI indicators for dashboard KPI cards
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: BI metrics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 arpu:
 *                   type: number
 *                   description: Average Revenue Per User (simulated)
 *                 overage_pct:
 *                   type: number
 *                   description: Percentage of simulations with overage costs
 *                 recommended_share_pct:
 *                   type: number
 *                   description: % of simulations with good_match recommendation
 *                 top_option_id:
 *                   type: integer
 *                   description: ID of most frequently used option
 *                 top_option_name:
 *                   type: string
 *                 total_simulations_30d:
 *                   type: integer
 *                 avg_satisfaction_30d:
 *                   type: number
 */
router.get('/indicators', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        -- ARPU: average total_cost across distinct profiles (weighted)
        AVG(total_cost) as arpu,
        
        -- Overage %: simulations where overage_cost > 0
        SUM(CASE WHEN overage_cost > 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as overage_pct,
        
        -- Recommended share: good_match percentage
        SUM(CASE WHEN recommendation = 'good_match' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as recommended_share_pct,
        
        -- Top option: most common option_id across all simulations
        (SELECT oo.option_id 
         FROM fact_simulations fs2
         JOIN offer_options oo ON fs2.offer_id = oo.offer_id
         WHERE DATE(fs2.simulated_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY oo.option_id 
         ORDER BY COUNT(*) DESC 
         LIMTO 1) as top_option_id,
        
        -- Top option name (subquery)
        (SELECT opt.name 
         FROM fact_simulations fs2
         JOIN offer_options oo ON fs2.offer_id = oo.offer_id
         JOIN options opt ON oo.option_id = opt.option_id
         WHERE DATE(fs2.simulated_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY opt.option_id 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as top_option_name,
        
        -- 30-day totals
        COUNT(*) as total_simulations_30d,
        AVG(satisfaction_score) as avg_satisfaction_30d
        
      FROM fact_simulations
      WHERE simulated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const indicators = rows[0] || {};
    res.json({
      arpu: parseFloat(indicators.arpu || 0).toFixed(2),
      overage_pct: parseFloat(indicators.overage_pct || 0).toFixed(1),
      recommended_share_pct: parseFloat(indicators.recommended_share_pct || 0).toFixed(1),
      top_option_id: indicators.top_option_id || null,
      top_option_name: indicators.top_option_name || null,
      total_simulations_30d: indicators.total_simulations_30d || 0,
      avg_satisfaction_30d: parseFloat(indicators.avg_satisfaction_30d || 0).toFixed(1)
    });
  } catch (error) {
    console.error('BI indicators error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/bi/reports/segment:
 *   get:
 *     summary: Performance by customer segment
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Segment comparison data
 */
router.get('/reports/segment', requireAuth, async (req, res) => {
  // Group by segment: avg cost, avg satisfaction, recommendation rate, simulation count
});

/**
 * @swagger
 * /api/bi/reports/offers:
 *   get:
 *     summary: Offer performance metrics
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top offers by simulation volume or revenue
 */
router.get('/reports/offers', requireAuth, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  // Get top N offers by simulation count + avg scores
});

/**
 * @swagger
 * /api/bi/reports/churn-risk:
 *   get:
 *     summary: Profiles at risk of churn (low satisfaction + over budget)
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: High-risk profiles with stats
 */
router.get('/reports/churn-risk', requireAuth, async (req, res) => {
  // Identify profiles with satisfaction < 40 OR total_cost > budget_max by >20%
});

/**
 * @swagger
 * /api/bi/dataset:
 *   get:
 *     summary: Export full star schema for Power BI import (Admin only)
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: JSON dataset with simulation fact + dimensions
 */
router.get('/dataset', requireAdmin, async (req, res) => {
  // Join fact_simulations with dimension tables (profiles, offers, date)
  // Return large JSON for Power BI to import
});

/**
 * @swagger
 * /api/bi/refresh:
 *   post:
 *     summary: Manually trigger Power BI dataset refresh (Admin only)
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Refresh triggered
 */
router.post('/refresh', requireAdmin, async (req, res) => {
  // Call Power BI REST API to refresh dataset (requires service principal)
  // Or simply signal that new data available (for scheduled refresh)
});

module.exports = router;
```

**Add to server.js:**
```javascript
const biRoutes = require('./routes/bi');
app.use('/api/bi', biRoutes);
```

---

## 5. Power BI Desktop Development

### 5.1 Prerequisites

1. **Install Power BI Desktop** (free from Microsoft Store or https://powerbi.microsoft.com/desktop/)
   - ~500MB download
   - Windows only (not macOS natively; VM or Parallels if on Mac)

2. **Create Microsoft Account** (free) if you don't have one

3. **MySQL ODBC Driver** (for DirectQuery) or just use Import mode (simpler)

### 5.2 Connecting to Data

**Option A: Import Mode** (RECOMMENDED for small dataset < 1M rows)
1. Open Power BI Desktop
2. "Get Data" → "MySQL database"
3. Server: `localhost` (or remote IP), Database: `bd_pfe`
4. Import these tables:
   - `fact_simulations` (fact)
   - `customer_profiles` (dimension)
   - `offers` (dimension)
   - `dim_date` (dimension) — optional for time intelligence
   - `options` + `offer_options` (if showing option breakdown)
5. Power BI detects relationships — create them manually:
   ```
   fact_simulations[profile_id] → customer_profiles[profile_id]
   fact_simulations[offer_id] → offers[offer_id]
   fact_simulations[date_key] → dim_date[date_key] (if using dim_date)
   ```

**Option B: DirectQuery** (not recommended — requires on-premise gateway permanently)

---

### 5.3 Data Modeling in Power BI

#### Step 1: Relationships (Model View)

```
customer_profiles (dim)
     profile_id (PK)
     label
     minutes_avg
     data_avg_gb
     budget_max
     segment
     └───────┐
             │ 1
           fact_simulations (fact)
             │ *
             ├── profile_id
             ├── offer_id ──────────┐
             ├── user_id            │
             ├── total_cost          │
             ├── satisfaction_score  │
             └── simulated_at        │
                                    │ 1
offers (dim) ──────────────────────┘
     offer_id (PK)
     name
     segment
     monthly_price
     quota_data_gb
     ...

options (dim) ←─── offer_options (bridge) ───→ offers (if analyzing option-level)
```

**Cardinality:**
- customer_profiles 1 → ∞ fact_simulations
- offers 1 → ∞ fact_simulations

---

#### Step 2: Calculated Columns (in dimension tables)

In `customer_profiles` table in Power BI (right-click → New Column):

```dax
Segment Full Name = 
SWITCH(
    customer_profiles[segment],
    "PREPAID", "Prepaid Mobile",
    "POSTPAID", "Postpaid Mobile",
    "BUSINESS", "Business Plan",
    "DATA_ONLY", "Data-Only Plan",
    "Unknown"
)
```

In `offers` table:

```dax
Price Tier = 
SWITCH(
    TRUE(),
    offers[monthly_price] < 30, "Budget (<30 TND)",
    offers[monthly_price] < 60, "Mid-Range (30-60 TND)",
    offers[monthly_price] < 100, "Premium (60-100 TND)",
    "Enterprise (≥100 TND)"
)
```

---

#### Step 3: Measures (DAX Formulas)

Create a dedicated "Measures" table or add to relevant tables.

**Basic KPIs:**
```dax
Total Simulations = COUNTROWS(fact_simulations)

Total Revenue = SUM(fact_simulations[total_cost])

Average Cost = AVERAGE(fact_simulations[total_cost])

Average Satisfaction = 
AVERAGE(fact_simulations[satisfaction_score])

Active Profiles Count = 
DISTINCTCOUNT(fact_simulations[profile_id])

Offers Simulated Count = 
DISTINCTCOUNT(fact_simulations[offer_id])
```

**BI-Specific Indicators:**

1. **ARPU Simulated** (Average Revenue Per User — distinct profiles)
```dax
ARPU Simulated = 
VAR TotalRevenue = [Total Revenue]
VAR DistinctProfiles = [Active Profiles Count]
RETURN DIVIDE(TotalRevenue, DistinctProfiles)
```

2. **Recommended Offer Share %**
```dax
Recommended Share % = 
VAR GoodMatches = 
    COUNTROWS(
        FILTER(
            fact_simulations,
            fact_simulations[satisfaction_score] >= 70 
            && fact_simulations[total_cost] <= 
                RELATED(customer_profiles[budget_max])
        )
    )
VAR Total = [Total Simulations]
RETURN DIVIDE(GoodMatches, Total) * 100
```

3. **Overage Occurrence %**
```dax
Overage % = 
VAR WithOverage = COUNTROWS(
    FILTER(fact_simulations, fact_simulations[overage_cost] > 0)
)
VAR Total = [Total Simulations]
RETURN DIVIDE(WithOverage, Total) * 100
```

4. **Average Overage Cost**
```dax
Avg Overage Cost = 
AVERAGEX(
    FILTER(fact_simulations, fact_simulations[overage_cost] > 0),
    fact_simulations[overage_cost]
)
```

5. **Top Options (by frequency)**
First create a bridge table (if analyzing option-level):

```dax
-- In a new table 'OptionUsage' calculated table:
OptionUsage = 
SUMMARIZE(
    fact_simulations,
    options[option_id],
    options[name],
    "UsageCount", COUNTROWS(fact_simulations)
)

-- Then measure:
Top Option Name = 
TOPNSELECTED(
    OptionUsage[option_name], 
    1, 
    [UsageCount], 
    DESC
)
```

Simpler (single measure):

```dax
Most Used Option = 
VAR TopOption = TOPN(
    1,
    SUMMARIZE(
        fact_simulations,
        options[name],
        "Count", COUNT(fact_simulations[offer_id])
    ),
    [Count], DESC
)
RETURN 
    IF(
        NOT(ISBLANK(TopOption)),
        VALUES(options[name]),
        "N/A"
    )
```

---

**Time Intelligence** (if `dim_date` table exists):

```dax
-- Previous month simulations
Simulations Previous Month = 
CALCULATE(
    [Total Simulations],
    DATEADD(dim_date[date], -1, MONTH)
)

-- Month-over-month growth
Simulations MoM Growth = 
VAR Current = [Total Simulations]
VAR Previous = [Simulations Previous Month]
RETURN DIVIDE(Current - Previous, Previous)

-- Year-to-date
Simulations YTD = 
TOTALYTD([Total Simulations], dim_date[date])
```

---

### 5.4 Dashboard 1: Marketing View

**Size:** 1680×900 (16:9)  
**Visuals:** 8-10

| Visual | Type | Data | Purpose |
|--------|------|------|---------|
| 1 | **KPI Card** | Total Simulations (30d) | Volume metric |
| 2 | **KPI Card** | Overage % | Pain point identification |
| 3 | **KPI Card** | Avg Satisfaction | Customer happiness |
| 4 | **KPI Card** | Recommended Share % | Conversion potential |
| 5 | **Clustered Bar Chart** | Segment vs Overage % | Which segments overuse? |
| 6 | **Heatmap** | Segment × Offer Type with color = avg satisfaction | Spot underserved combos |
| 7 | **Scatter** | X: Cost, Y: Satisfaction, size: simulation count, color: segment | Offer positioning |
| 8 | **Line Chart** | Simulations over time (last 30d) | Trend |
| 9 | **Table** | Top 10 offers by simulation count + avg cost/score | Popularity ranking |
| 10 | **Donut** | Share by segment (PREPAID/POSTPAID/BUSINESS) | Market penetration |

**Slicers (filters):**
- Date range (last 7/30/90 days)
- Segment
- Offer status (PUBLISHED/DRAFT)

---

### 5.5 Dashboard 2: Product View

| Visual | Type | Data | Purpose |
|--------|------|------|---------|
| 1 | **KPI Card** | Avg Overage Cost | Hidden cost exposure |
| 2 | **KPI Card** | Most Used Option Name | Popularity |
| 3 | **Stacked Bar** | Top 10 offers × options usage frequency | Bundle effectiveness |
| 4 | **Line Chart** | Fair use violations over time | Plan compliance |
| 5 | **Table** | All offers with columns: simulations, avg cost, avg score, % good_match, overage % | Performance matrix |
| 6 | **Bar** | Options by total selections (sum across all simulations) | Upsell opportunities |
| 7 | **Scatter** | X: monthly_price, Y: satisfaction, size: quota_data_gb | Price-value analysis |
| 8 | **Donut** | Recommendation distribution (good/okay/not) | Overall health |

**Slicers:**
- Offer segment
- Date range
- Budget tier

---

### 5.6 Dashboard 3: Direction View

| Visual | Type | Data | Purpose |
|--------|------|------|---------|
| 1 | **KPI Card** | Total Simulated Revenue | Top-line |
| 2 | **KPI Card** | ARPU Simulated | Per-customer value |
| 3 | **KPI Card** | Potential Savings (cheapest viable alternative) | Cost optimization |
| 4 | **KPI Card** | Churn Risk % (score<40) | At-risk population |
| 5 | **Area Chart** | Monthly revenue trend (30d rolling) | Growth trajectory |
| 6 | **Funnel** | Simulations → good_match → budget_within | Conversion funnel |
| 7 | **Treemap** | Revenue by segment hierarchy | Business mix |
| 8 | **Table** | High-value segments with ARPU, cost, satisfaction | Strategic targets |
| 9 | **Gauge** | % of simulations where overage cost > 20% of base | Overspend risk |

**Slicers:**
- Date range
- Segment
- Priority (PRICE/QUALITY/BALANCED)

---

### 5.7 DAX Measures Checklist

**Must implement all 15 measures listed in sections 5.3–5.6.**  
Save as `dax_measures.txt` in docs for reference.

---

## 6. Embedding in React Frontend

### 6.1 Power BI Embed Options

| Method | Pros | Cons | Recommendation |
|--------|------|------|---------------|
| **iframe embed** (publish to web) | Simplest; just paste `<iframe src>` URL | Data public (no auth) | ❌ Not for production, only demo if OK with public data |
| **Power BI JavaScript SDK** | Secure; token-based auth; row-level security possible | Requires Azure AD app registration + service principal | ✅ **Recommended** for professional delivery |
| **Static image export** | Zero complexity | Not interactive | ❌ Insufficient |

---

### 6.2 Secure Embed with Power BI JavaScript SDK

#### Step 1: Publish .pbix to Power BI Service

1. In Power BI Desktop: `File → Publish → Select workspace`
2. Requires Power BI Pro account (free 30-day trial available)
3. Report published at `https://app.powerbi.com/groups/me/reports/{reportId}`

#### Step 2: Set Up Azure AD App (Service Principal)

Uses "App owns data" embedding (server-side token generation):

1. Go to Azure Portal → Azure Active Directory → App registrations → New registration
2. Name: `TelecomSim-BI-Embed`
3. Redirect URI: `https://localhost:5173` (your frontend) or backend endpoint
4. Create → Note: `clientId`, `tenantId`
5. Certificates & secrets → New client secret → copy value (`clientSecret`)
6. API permissions → Add `Power BI Service` → `Tenant.Read.All`, `Report.Read.All`, `Dataset.Read.All` → Grant admin consent

**Environment variables to add in `.env`:**
```env
POWER_BI_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWER_BI_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWER_BI_CLIENT_SECRET=your_client_secret_here
POWER_BI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWER_BI_REPORT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

#### Step 3: Generate Embed Token (Backend)

Create new route: `backend/routes/powerbi.js`

```javascript
const { Token } = require('microsoft-adal-node'); // or msal-node
const axios = require('axios');

router.get('/embed-token', requireAuth, async (req, res) => {
  // Get Azure AD access token for Power BI
  const tokenResponse = await axios.post(
    `https://login.microsoftonline.com/${process.env.POWER_BI_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.POWER_BI_CLIENT_ID,
      client_secret: process.env.POWER_BI_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'https://analysis.windows.net/powerbi/api/.default'
    })
  );
  
  const accessToken = tokenResponse.data.access_token;
  
  // Get embed token for specific report
  const reportId = process.env.POWER_BI_REPORT_ID;
  const workspaceId = process.env.POWER_BI_WORKSPACE_ID;
  
  const embedResponse = await axios.post(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
    { accessLevel: 'view' },  // or 'edit' if interactive editing needed
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  const embedToken = embedResponse.data.token;
  
  res.json({ embedToken, embedUrl: embedResponse.data.embedUrl, reportId });
});
```

**Simpler Alternative:** If using "Publish to web" (not secure), just return the public iframe URL:
```javascript
res.json({
  embedUrl: "https://app.powerbi.com/view?r=...",
  // no token needed
});
```

---

#### Step 4: React Power BI Component

Install Power BI client:
```bash
cd frontend
npm install powerbi-client
```

Create `frontend/src/components/PowerBIReport.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react';
import * as pbi from 'powerbi-client';

export default function PowerBIReport({ reportId, embedUrl, accessToken, height = 800 }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const models = pbi.models;
    const config = {
      type: 'report',
      id: reportId,
      embedUrl: embedUrl,
      accessToken: accessToken,
      tokenType: models.TokenType.Embed,
      settings: {
        filterPaneEnabled: true,
        navContentPaneEnabled: true,
        background: models.BackgroundType.Transparent
      }
    };

    const report = new pbi.Report(containerRef.current);
    
    report.on('loaded', () => {
      setLoading(false);
      console.log('Power BI report loaded');
    });
    
    report.on('error', (event) => {
      console.error('Power BI error:', event.detail);
      setError(event.detail.message);
      setLoading(false);
    });

    report.embed(config);

    // Cleanup
    return () => {
      if (report) report.reset();
    };
  }, [reportId, embedUrl, accessToken]);

  return (
    <div style={{ position: 'relative', height }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)', color: 'var(--text-muted)'
        }}>
          Loading Power BI Report...
        </div>
      )}
      {error && (
        <div style={{ color: 'red', padding: 20 }}>
          Failed to load report: {error}
        </div>
      )}
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
```

**Usage in page** (`frontend/src/pages/BI_Dashboard.jsx` new page):
```jsx
import { useEffect, useState } from 'react';
import PowerBIReport from '../components/PowerBIReport';

export default function BIDashboard({ reportName }) {
  const [embedConfig, setEmbedConfig] = useState(null);

  useEffect(() => {
    fetch(`/api/bi/embed-token?report=${reportName}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => r.json())
    .then(setEmbedConfig)
    .catch(console.error);
  }, [reportName]);

  if (!embedConfig) return <div>Loading...</div>;

  return (
    <PowerBIReport
      reportId={embedConfig.reportId}
      embedUrl={embedConfig.embedUrl}
      accessToken={embedConfig.embedToken}
      height={window.innerHeight - 200}
    />
  );
}
```

---

### 6.3 Adding BI Routes to React Router

In `App.jsx`:

```jsx
<Route path="/dashboard/marketing" element={
  <ProtectedRoute><BIDashboard reportName="marketing" /></ProtectedRoute>
} />
<Route path="/dashboard/product" element={
  <ProtectedRoute><BIDashboard reportName="product" /></ProtectedRoute>
} />
<Route path="/dashboard/direction" element={
  <ProtectedRoute><BIDashboard reportName="direction" /></ProtectedRoute>
} />
```

Add sidebar links to these routes in `Layout.jsx`.

---

## 7. Deployment & Refresh Strategy

### 7.1 On-Premise Data Gateway (IF NEEDED)

**Only required if** Power BI Service needs to query your on-premise MySQL database directly (DirectQuery mode).

**But:** With **Import mode** (recommended), gateway **not needed** — you push data via scheduled refresh from Power BI Service to cloud dataset.

**Gateway setup (if DirectQuery):**
1. Download and install "On-premises data gateway" on the MySQL server machine
2. Sign in with Microsoft account
3. Add data source: MySQL, credentials
4. In Power BI Service dataset settings → configure gateway
5. Schedule refresh (e.g., every 4 hours)

**For most PFE demos:** Import mode + daily manual refresh via admin button is simpler.

---

### 7.2 Scheduled Refresh

**Power BI Service:**
1. After publishing .pbix, dataset appears in workspace
2. Dataset settings → Scheduled refresh
3. Set frequency (Daily at 6:00 AM recommended)
4. If using gateway → configure; else Power BI will attempt direct MySQL connection (must be publicly accessible or on same network)

**Refresh triggers:**
- Automatic: Daily at configured time
- Manual: REST API call from backend `/api/bi/refresh` (admin only)

**REST API refresh trigger** (backend calls Power BI):

```javascript
// In routes/bi.js
router.post('/refresh', requireAdmin, async (req, res) => {
  try {
    // Get Azure AD token
    const tokenRes = await axios.post(
      `https://login.microsoftonline.com/${process.env.PBI_TENANT_ID}/oauth2/v2.0/token`,
      // ... same as embed token flow
    );
    
    // Trigger dataset refresh
    const datasetId = process.env.POWER_BI_DATASET_ID;
    await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/refreshes`,
      { notifyOption: 'MailOnCompletion' },
      { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } }
    );
    
    res.json({ message: 'Refresh triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

### 7.3 Row-Level Security (RLS)

**Optional:** If different user roles should see different data.

Example: ANALYST only sees their own simulations.

**In Power BI Desktop:**
1. Modeling → Manage Roles
2. Create role `Analyst` with DAX filter:
   ```
   [user_id] = USERNAME()  -- assuming username = user_id passed as claim
   ```
3. Publish, then in Power BI Service assign users to role

**Frontend pass-through:** When embedding, set `uniqueIdentifier` to `req.user.user_id`.

---

### 7.4 Production Considerations

| Item | Requirement |
|------|-------------|
| Power BI Pro license | Required to publish (≈ $10/month) |
| Gateway | Only for DirectQuery on-premise |
| Static IP/domain | Power BI Service must reach MySQL (VPN or public IP) |
| Refresh limits | 8/day for Pro, 48/day for Premium |
| Storage | 1 GB per user (Pro), 10-100 GB per capacity (Premium) |

**For PFE demo:** Use Import mode + manual refresh button in admin panel. No gateway needed.

---

## 8. Implementation Roadmap (Timeline)

Assuming 15 working days total (can compress to 10 with parallel tracks):

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| **Phase 1: Data Foundation (Days 1-3)** |
| 1 | Create `fact_simulations` table + indexes + FKs | DB Engineer | SQL migration script |
| 1 | Add ETL logging to `simulation.js` all 4 routes | Backend | Modified `simulation.js` |
| 2 | Test: run 100 simulations, verify fact rows inserted | QA | Test verification log |
| 2 | Seed `fact_simulations` with 1000+ synthetic rows | Backend | `seeds/fact_simulations.sql` |
| 3 | Add FKs to `offer_options`, `scenario_results` | DB Engineer | ALTER TABLE scripts |
| 3 | Fix option_id 0 duplicate issue (delete or merge) | DB Engineer | Clean data |
| **Phase 2: BI API Layer (Days 4-5)** |
| 4 | Create `backend/routes/bi.js` with 5 endpoints | Backend | `bi.js` (200 loc) |
| 4 | Implement `/api/bi/indicators` query (test in MySQL Workbench) | Backend | Endpoint returns JSON |
| 5 | Implement `/api/bi/reports/segment` | Backend | Aggregated JSON |
| 5 | Implement `/api/bi/reports/offers` with ranking | Backend | Top offers JSON |
| 5 | Implement `/api/bi/reports/churn-risk` | Backend | At-risk profiles JSON |
| 5 | Document Swagger annotations for BI endpoints | Backend | Swagger UI shows /api/bi |
| **Phase 3: Power BI Desktop (Days 6-10)** |
| 6 | Install Power BI Desktop; connect to MySQL via Import | BI Dev | Connection test |
| 6 | Define relationships (profile→fact, offer→fact) | BI Dev | Model view complete |
| 7 | Create all DAX measures (15+) in measure table | BI Dev | Measures validated |
| 8 | Build Marketing dashboard (10 visuals) | BI Dev | `marketing.pbix` page 1 |
| 9 | Build Product dashboard (8 visuals) | BI Dev | `product.pbix` page 2 |
| 10 | Build Direction dashboard (9 visuals) | BI Dev | `direction.pbix` page 3 |
| 10 | Apply theme (match React app's blue/amber/green palette) | Designer | Consistent visuals |
| **Phase 4: Deployment (Days 11-12)** |
| 11 | Install Power BI Gateway (if DirectQuery) OR configure Import refresh | DevOps | Gateway running |
| 11 | Create Azure AD app for embedding (optional if not embedding) | Backend | App registration |
| 12 | Implement `/api/bi/embed-token` endpoint (if embedding) | Backend | Embed token flow |
| 12 | Create React `<PowerBIReport>` component | Frontend | Component tested |
| **Phase 5: Frontend Integration (Days 13-14)** |
| 13 | Create new BI dashboard pages (3 routes) | Frontend | `/dashboard/marketing`, etc. |
| 13 | Update Dashboard.jsx to use `/api/bi/indicators` (replace hardcoded) | Frontend | Live KPI cards |
| 14 | Add navigation links to BI dashboards in sidebar | Frontend | Nav items visible |
| 14 | Test full flow: simulation → data in Power BI → dashboard updates | QA | End-to-end test passed |
| **Phase 6: Polish & Documentation (Days 15-16)** |
| 15 | RLS configuration (optional) | Backend/BI | Role-based filters |
| 15 | Create `POWER_BI_REQUIREMENTS.md` (this doc) | Docs | Finalized |
| 16 | User guide: how to refresh, interpret dashboards | Docs | `POWER_BI_USER_GUIDE.md` |
| 16 | Final demo rehearsal | Team | Practice presentation |

**Buffer:** +2 days for unexpected issues → **Total 18 days** worst-case.

---

## 9. Cost Estimate

| Item | Cost (USD) | Notes |
|------|------------|-------|
| Power BI Desktop | $0 | Free download |
| Power BI Pro license (publisher) | $10/month | You need one account to publish. Student benefits may cover. |
| Power BI Pro license (viewer, if 2+ people) | $10/user/month | For demo audience? Not needed if presenter-only |
| Power BI Premium (if >1000 users) | $20-47k/year | NOT needed for PFE |
| Azure AD (free tier) | $0 | For app registration |
| Gateway | $0 | Free on-premise data gateway |
| **Total estimated** | **$10-20** | One Pro license for 1 month |

---

## 10. Risks & Mitigations

### Risk 1: Power BI Learning Curve
**Severity:** HIGH  
**Probability:** MEDIUM

**Mitigation:**
- Start with Import mode (easier than DirectQuery)
- Use pre-built templates from Microsoft
- Focus on 3 core dashboards, skip fancy DAX initially
- Practice with sample datasets first

---

### Risk 2: Gateway Configuration Hell
**Severity:** HIGH  
**Probability:** MEDIUM (if DirectQuery required)

**Mitigation:**
- Use **Import mode** → no gateway needed
- If gateway required, install on same machine as MySQL
- Ensure firewall allows outbound to `*.powerbi.com`
- Test connectivity with Power BI Gateway diagnostics

---

### Risk 3: No Real Simulation Data
**Impact:** LOW (but visualization looks empty)

**Current `scenario_results` only has 44 rows.** BI dashboards need 1000+ for meaningful trends.

**Mitigation:**
- Create synthetic data generator script (`scripts/generate-fact-data.js`)
- Generate 5000 rows covering all segments, price points, profiles
- Run before Power BI connection

**Generator sketch:**
```javascript
// Generate 5000 random simulations
for (let i=0; i<5000; i++) {
  const profile = randomProfile();
  const offer = randomOffer();
  const result = simulate(profile, offer);
  // insert into fact_simulations
}
```

---

### Risk 4: MySQL Connection Limits
**Severity:** MEDIUM  
**Scenario:** Power BI refreshes 8×/day × 5000 rows = large query load

**Mitigation:**
- Indexes on `simulated_at`, `profile_id`, `offer_id`
- Materialized view or `daily_kpi` table pre-aggregates
- Keep dataset small (<50k rows) by limiting historical data (retain 2 years)

---

### Risk 5: Azure AD App Overwhelm
**Severity:** MEDIUM  
**Mitigation:**
- Follow Microsoft's step-by-step guide for "app owns data"
- Use existing tutorial videos (YouTube: "Power BI Embedded Node.js")
- If too complex, fallback to "Publish to web" (public link) for demo only

---

### Risk 6: Time Crunch (PFE Deadline)
**Severity:** CRITICAL

**Mitigation:**
- MVP approach: 1 combined dashboard (not 3 separate), 5 key visuals only
- Use Recharts (custom React charts) instead of Power BI if impossible
- Document BI as "Future Work" with clear plan in this document

---

## 📋 Pre-Integration Checklist

Before starting BI work, ensure:

- [ ] `fact_simulations` table created with FKs + indexes
- [ ] Simulation routes (`simulation.js`) logging to `fact_simulations`
- [ ] `fact_simulations` has >1000 rows (synthetic seed completed)
- [ ] `/api/bi/indicators` endpoint returns valid JSON
- [ ] Foreign keys added to `offer_options` and `scenario_results`
- [ ] Dashboard.jsx hardcoded numbers replaced (optional but good)
- [ ] All routes run without errors (check console)
- [ ] Backend stable (no 500 errors on simulation)
- [ ] CORS configured (if embedding in different domain)
- [ ] `.env` includes Power BI secrets (if using secure embed)

---

## 📚 Related Documents

- `PROJECT_OVERVIEW.md` — Complete current state (database, API, frontend)
- `DATABASE_DOCUMENTATION.md` — ERD, column types, sample queries
- `README.md` — Quick start guide (updated)
- This document (`POWER_BI_REQUIREMENTS.md`) — BI implementation spec

---

**Version:** 1.0  
**Last Updated:** 2026-04-20  
**Author:** Kilo (automated audit + BI spec generation)  
**Next Steps:** Review with supervisor, get approval to proceed with Phase 1 (data warehouse creation)
