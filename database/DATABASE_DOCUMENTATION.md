# Telecom Offer Database Documentation

## Overview

This document provides a comprehensive overview of the `bd_pfe` database used in the PFE (Final Year Project) telecom offer management system. The database is built on **MariaDB 10.4** and contains data about telecom offers, customer profiles, optional add-ons, and user management.

---

## Database: `bd_pfe`

The database consists of **5 main tables** that work together to manage telecom offers and customer profiles.

---

## Table 1: `offers`

The core table containing all telecom tariff plans.

| Column | Type | Description |
|--------|------|-------------|
| `offer_id` | INT (PK) | Unique identifier for each offer |
| `name` | VARCHAR(100) | Name of the offer (e.g., "Offer 1") |
| `segment` | ENUM | Type: `PREPAID`, `POSTPAID`, or `BUSINESS` |
| `monthly_price` | DECIMAL(10,2) | Monthly subscription cost in currency |
| `quota_minutes` | INT | Included voice minutes per month |
| `quota_sms` | INT | Included SMS messages per month |
| `quota_data_gb` | DECIMAL(10,2) | Included data allowance in GB |
| `validity_days` | INT | Contract validity period (default: 30) |
| `fair_use_gb` | DECIMAL(10,2) | Fair usage threshold for data |
| `over_minute_price` | DECIMAL(10,4) | Price per minute after quota exhausted |
| `over_sms_price` | DECIMAL(10,4) | Price per SMS after quota exhausted |
| `over_data_price` | DECIMAL(10,4) | Price per GB after quota exhausted |
| `roaming_included_days` | INT | Days of roaming included |
| `status` | ENUM | Current state: `PUBLISHED`, `DRAFT`, or `RETIRED` |

### Statistics
- **Total Offers:** 60
- **Segments:**
  - PREPAID: Multiple options
  - POSTPAID: Multiple options
  - BUSINESS: 3 premium offers (IDs 17, 32, 60)
- **Status Distribution:** Mix of PUBLISHED, DRAFT, and RETIRED offers

---

## Table 2: `customer_profiles`

Represents individual customer usage patterns and preferences (simulated data for 300 clients).

| Column | Type | Description |
|--------|------|-------------|
| `profile_id` | INT (PK) | Unique customer identifier |
| `label` | VARCHAR(100) | Customer label (e.g., "Client 1") |
| `minutes_avg` | INT | Average monthly voice usage (minutes) |
| `sms_avg` | INT | Average monthly SMS count |
| `data_avg_gb` | DECIMAL(10,2) | Average monthly data consumption (GB) |
| `night_usage_pct` | INT | Percentage of usage during night hours |
| `roaming_days` | INT | Days spent abroad per year |
| `budget_max` | DECIMAL(10,2) | Maximum monthly budget |
| `priority` | ENUM | Customer preference: `PRICE`, `QUALITY`, or `BALANCED` |

### Statistics
- **Total Profiles:** 300 simulated customers
- **Usage Patterns:** Wide range from light users (low minutes/SMS/data) to heavy users
- **Budget Range:** €15 to €150
- **Priorities:** Mix of PRICE-sensitive, QUALITY-focused, and BALANCED customers

---

## Table 3: `options`

Optional add-ons that can be attached to offers.

| Column | Type | Description |
|--------|------|-------------|
| `option_id` | INT (PK) | Unique option identifier |
| `name` | VARCHAR(100) | Option name (e.g., "Option 1") |
| `type` | ENUM | Category: `DATA_ADDON`, `VOICE_ADDON`, `SMS_ADDON`, `ROAMING`, `LOYALTY` |
| `price` | DECIMAL(10,2) | Additional cost |
| `data_gb` | DECIMAL(10,2) | Additional data (GB) |
| `minutes` | INT | Additional voice minutes |
| `sms` | INT | Additional SMS messages |
| `validity_days` | INT | How long the add-on lasts |

### Statistics
- **Total Options:** 40 different add-ons
- **Types:**
  - DATA_ADDON: Extra data packages
  - VOICE_ADDON: Additional voice minutes
  - SMS_ADDON: Additional SMS quota
  - ROAMING: International travel packages
  - LOYALTY: Discounts/loyalty rewards (negative price = discount)

---

## Table 4: `offer_options`

A **junction table** that links offers to their available optional add-ons (many-to-many relationship).

| Column | Type | Description |
|--------|------|-------------|
| `offer_id` | INT (PK, FK) | Reference to offers table |
| `option_id` | INT (PK, FK) | Reference to options table |

**Relationship:**
- Each offer can have multiple options available
- Each option can be available on multiple offers
- Foreign keys enforce referential integrity

---

## Table 5: `users`

Administrative users who can access the system.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | INT (PK) | Unique user identifier |
| `username` | VARCHAR(100) | Login username |
| `email` | VARCHAR(255) | User's email address |
| `password_hash` | VARCHAR(255) | BCrypt encrypted password |
| `role` | ENUM | Authorization level: `ADMIN` or `ANALYST` |
| `created_at` | TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | Last modification date |

### Default Users
| Username | Email | Role | Password |
|----------|-------|------|----------|
| admin | admin@telecom.com | ADMIN | (hashed) |
| analyst | analyst@telecom.com | ANALYST | (hashed) |

---

## Database Schema Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   offers        │       │  offer_options  │       │    options      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ offer_id (PK)   │◄──────│ offer_id (FK)   │       │ option_id (PK)  │
│ name            │       │ option_id (FK)  ├──────►│ name            │
│ segment         │       └─────────────────┘       │ type            │
│ monthly_price   │                                   │ price           │
│ quotas...       │                                   │ data_gb         │
│ status          │                                   │ minutes         │
└─────────────────┘                                   │ sms             │
                                                      └─────────────────┘
            │
            │ (simulation)
            ▼
┌─────────────────┐       ┌─────────────────┐
│ customer_profiles│      │     users       │
├─────────────────┤       ├─────────────────┤
│ profile_id (PK) │       │ user_id (PK)    │
│ label           │       │ username        │
│ minutes_avg     │       │ email           │
│ sms_avg         │       │ password_hash   │
│ data_avg_gb     │       │ role            │
│ budget_max      │       └─────────────────┘
│ priority        │
└─────────────────┘
```

---

## Key Features

1. **Offer Segmentation:** Different offers for PREPAID, POSTPAID, and BUSINESS customers
2. **Flexible Options:** Add-ons can be customized per offer
3. **Customer Insights:** 300 customer profiles with diverse usage patterns
4. **Usage Tracking:** Historical data for simulation and analysis
5. **Role-based Access:** ADMIN and ANALYST roles for user management

---

## Technology Stack

- **Database:** MariaDB 10.4.25
- **Backend:** Node.js with Express
- **Connection:** mysql2/promise pool
- **Authentication:** BCrypt password hashing

---

*Generated for PFE Project - Telecom Offer Management System*