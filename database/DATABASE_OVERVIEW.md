# Telecom Offer Management System - Database Overview

## Quick Summary

This database powers a telecom offer comparison and simulation tool. It stores **60 telecom offers**, **300 customer profiles**, and **40 optional add-ons** to help match the right offer to the right customer.

---

## What's In The Database

### 1. Offers Table (60 records)
The core product catalog - different tariff plans customers can subscribe to.

| Field | What It Means |
|-------|---------------|
| `offer_id` | Unique ID for each offer |
| `name` | Offer name (e.g., "POSTPAID PRO 50GB") |
| `segment` | Customer type: **PREPAID**, **POSTPAID**, or **BUSINESS** |
| `monthly_price` | How much customer pays per month |
| `quota_minutes` | Free minutes included per month |
| `quota_sms` | Free SMS included per month |
| `quota_data_gb` | Free internet data included (in GB) |
| `over_minute_price` | Cost per extra minute after quota runs out |
| `over_data_price` | Cost per extra GB after quota runs out |
| `status` | Is it active? (**PUBLISHED**, DRAFT, or RETIRED) |

**Example Offers:**
- POSTPAID CLASSIC: 39 TND/month, 5GB data, unlimited SMS
- BUSINESS UNLIMITED: 149 TND/month, unlimited everything
- PREPAID BASIC: Pay-as-you-go, no monthly fee

---

### 2. Customer Profiles Table (300 records)
Simulated customer data - represents different types of customers with their usage habits.

| Field | What It Means |
|-------|---------------|
| `profile_id` | Unique ID for each customer profile |
| `label` | Customer name (e.g., "Client 1") |
| `minutes_avg` | Average minutes they use per month |
| `sms_avg` | Average SMS they send per month |
| `data_avg_gb` | Average data they use per month (GB) |
| `budget_max` | Maximum they're willing to pay |
| `priority` | What matters most: **PRICE**, **QUALITY**, or **BALANCED** |
| `night_usage_pct` | % of usage during night hours (off-peak) |
| `roaming_days` | Days spent traveling abroad per year |

**Customer Segments:**
- Light users: 5GB data, 60 minutes, 18-25 TND budget
- Average users: 20-35GB data, 200-500 minutes, 60-90 TND budget
- Heavy users: 45-60GB data, 800+ minutes, 150 TND budget

---

### 3. Options Table (40 records)
Optional add-ons that can be added to any offer.

| Field | What It Means |
|-------|---------------|
| `option_id` | Unique ID for each add-on |
| `name` | Add-on name (e.g., "10GB Extra") |
| `type` | Category: DATA_ADDON, VOICE_ADDON, SMS_ADDON, ROAMING, LOYALTY |
| `price` | Extra cost to add this option |
| `data_gb` | Additional data if it's a data add-on |
| `minutes` | Additional minutes if it's a voice add-on |

**Option Types:**
- **Data Add-ons:** Extra GB for heavy data users
- **Voice Add-ons:** More minutes for heavy callers
- **Roaming Packages:** For customers who travel abroad
- **Loyalty Discounts:** Negative price = discount

---

### 4. Offer Options Table (Junction Table)
Links offers to their available add-ons. This is a **many-to-many** relationship:

- One offer can have multiple options available
- One option can be available on multiple offers

---

### 5. Users Table
System administrators and analysts who can access the system.

| Field | What It Means |
|-------|---------------|
| `user_id` | Unique user ID |
| `username` | Login name |
| `email` | User's email |
| `password_hash` | Encrypted password (BCrypt) |
| `role` | **ADMIN** (full access) or **ANALYST** (view-only) |

**Default Users:**
- Username: `admin` → Role: ADMIN
- Username: `analyst` → Role: ANALYST

---

## How The Tables Work Together

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   OFFERS    │────►│  OFFER_OPTIONS  │◄────│   OPTIONS   │
│  (60 plans) │     │  (links them)   │     │ (40 add-ons)│
└─────────────┘     └─────────────────┘     └─────────────┘
       │
       │ (used in simulation)
       ▼
┌─────────────────────┐
│  CUSTOMER_PROFILES │
│  (300 customers)   │
└─────────────────────┘
```

**Example Flow:**
1. Customer selects an offer (e.g., "POSTPAID PRO 50GB")
2. System checks what add-ons are available for that offer
3. Customer profile is analyzed to see if the offer fits their usage
4. System calculates estimated cost based on their actual usage

---

## Key Numbers

| Metric | Value |
|--------|-------|
| Total Offers | 60 |
| Active Offers (PUBLISHED) | ~40 |
| Business-segment Offers | 3 |
| Customer Profiles | 300 |
| Budget Range | 15 - 150 TND |
| Optional Add-ons | 40 |
| User Roles | 2 (ADMIN, ANALYST) |

---

## Technology

- **Database:** MariaDB 10.4
- **Backend:** Node.js + Express
- **Authentication:** JWT tokens
- **Password Security:** BCrypt hashing

---

## Need More Details?

- Full table schemas: See `database/DATABASE_DOCUMENTATION.md`
- Sample data: See `database/donnees_fictives_offres_telecom_300_clients.sql`
- API documentation: Available via Swagger at `/api/docs` when server is running