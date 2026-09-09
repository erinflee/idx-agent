# MLS Schema Reference & Field Notes

Field-usage notes for the project's local MySQL database (`idx_exchange`), annotated against the
authoritative **Trestle / CoreLogic RESO Web API "Property" resource** metadata
([source](https://api-trestle.corelogic.com/trestle/Documentation/MetaData/Resource/Property)).

The three local tables are **extracts** derived from that feed. This document maps the columns we
*actually have* (verified against the live DB) to their RESO meaning, and records the gaps between
the official spec and the imported data.

> Schema: `idx_exchange` · verified 2026-06-29

## Tables at a glance

| Table | Rows | Columns | What it is | Naming convention |
|---|---|---|---|---|
| `rets_property` | 53,122 | 126 | **Active** listings — the live search/discovery table | vendor/RETS-style (`L_*`, `LM_*`) + RESO |
| `california_sold` | 87,157 | 46 | **Sold/closed** transactions — historical comps | RESO standard names |

---

## How the tables relate (join keys)

**Important:** the two naming conventions mean the join keys are not symmetric.

| Join | Key(s) | Works? | Notes |
|---|---|---|---|
| `rets_property` → `california_sold` | `L_ListingID` ↔ `ListingKey` | ❌ **No** | Returns **0 rows**. See gotcha #1. |
| `rets_property` ↔ `california_sold` (market-level) | `L_City` = `City`, `L_Zip` = `PostalCode` | ✅ Yes | 1,267 ZIP codes overlap. Use this for comps/analytics. |

Per the RESO spec, `ListingKey` (the unique primary key) and `ListingId` (the human-readable
identifier) are **different fields** — so even by name the handbook's `L_ListingID = ListingKey`
premise is mismatched.

---

## `rets_property` — Active Listings (key columns)

Vendor `L_*` / `LM_*` names are **not** in the RESO dictionary; the "RESO equivalent" column maps
them to the standard field by meaning.

| Local column | Type | RESO equivalent | Meaning |
|---|---|---|---|
| `id` | int | — | Local auto-increment PK |
| `L_ListingID` | varchar(255) | ListingId | MLS listing ID |
| `L_DisplayId` | varchar(255) | — | Human-readable MLS # shown on portals |
| `L_Address` | varchar(100) | UnparsedAddress | Full street address |
| `L_City` | varchar(50) | City | City — **indexed** (`idx_L_City`) |
| `L_Zip` | varchar(20) | PostalCode | ZIP — **indexed** (`idx_L_Zip`) |
| `L_State` | varchar(50) | StateOrProvince | State |
| `L_Class` | varchar(50) | — | Property class (Residential, Land, …) |
| `L_Type_` | varchar(50) | PropertySubType | Subtype — **indexed** (`idx_rets_property_type`) |
| `L_Keyword2` | int | BedroomsTotal | Bedrooms |
| `LM_Dec_3` | decimal(4,1) | BathroomsTotalInteger | Bathrooms (supports half: 2.5) |
| `L_Keyword1` | varchar(50) | LotSizeArea (str) | Lot size (string) |
| `L_SystemPrice` | int | ListPrice | Current list/display price |
| `LM_Int2_3` | int | LivingArea | Finished square footage |
| `L_Status` | varchar(50) | — | Always `Active` (see gotcha #3) |
| `StandardStatus` | varchar(32) | StandardStatus | RESO status — always `Active` here |
| `L_Remarks` | mediumtext | PublicRemarks | Listing description — **FULLTEXT** (`ft_remarks`) |
| `L_Photos` | longtext | — | JSON array of photo URLs |
| `YearBuilt` | int | YearBuilt | Year built |
| `DaysOnMarket` | int | DaysOnMarket | Days on market |
| `AssociationFee` | int | AssociationFee | Monthly HOA fee |
| `PreviousListPrice` | decimal(12,0) | PreviousListPrice | Prior list price |
| `LMD_MP_Latitude` | decimal(18,15) | Latitude | Geo latitude |
| `LMD_MP_Longitude` | decimal(19,15) | Longitude | Geo longitude |
| `PoolPrivateYN` `ViewYN` `FireplaceYN` … | varchar/tinyint | (same) | Feature flags |

*(126 columns total; the rest are agent contact fields, timestamps, and feature lists. Run
`SHOW COLUMNS FROM rets_property;` for the full list.)*

---

## `california_sold` — Sold Transactions (all 46 columns)

Uses RESO standard names directly.

| Column | Type | Meaning |
|---|---|---|
| `ListingKey` | bigint | RESO unique key (primary key in the feed) |
| `ClosePrice` | double | Final sale price |
| `CloseDate` | **varchar(255)** | Close date — *stored as text*, see gotcha #2 |
| `ListPrice` | double | List price at contract |
| `OriginalListPrice` | double | Original asking price |
| `DaysOnMarket` | bigint | Days listing→contract |
| `City` | varchar(255) | City (join to `rets_property.L_City`) |
| `PostalCode` | varchar(255) | ZIP (join to `rets_property.L_Zip`) |
| `StateOrProvince` | varchar(255) | State |
| `UnparsedAddress` | varchar(255) | Full address |
| `PropertyType` | varchar(255) | Residential, Land, … (all rows = `Residential`) |
| `PropertySubType` | varchar(255) | SingleFamilyResidence, Condominium, … |
| `LivingArea` | double | Finished sq ft |
| `LotSizeAcres` / `LotSizeSquareFeet` | double | Lot size |
| `BedroomsTotal` | double | Bedrooms |
| `BathroomsTotalInteger` | double | Bathrooms |
| `YearBuilt` | double | Year built |
| `Stories` / `Levels` / `MainLevelBedrooms` | double/varchar | Structure layout |
| `GarageSpaces` / `ParkingTotal` / `AttachedGarageYN` | double/varchar | Parking |
| `AssociationFee` | double | HOA fee |
| `SubdivisionName` | varchar(255) | Community |
| `HighSchool` / `HighSchoolDistrict` / `MiddleOrJuniorSchool` | varchar(255) | Schools |
| `ViewYN` `WaterfrontYN` `BasementYN` `PoolPrivateYN` `FireplaceYN` `NewConstructionYN` | varchar(255) | Feature flags (True/False/empty) |
| `Latitude` / `Longitude` | double | Coordinates |
| `ListAgentFirstName` / `ListAgentLastName` / `ListAgentFullName` | varchar(255) | Listing agent |
| `BuyerAgentFirstName` / `BuyerAgentLastName` | varchar(255) | Buyer agent |
| `ListOfficeName` / `BuyerOfficeName` | varchar(255) | Brokerages |
| `ListingContractDate` / `PurchaseContractDate` | varchar(255) | Contract dates (also text) |

---

## Type drift (RESO spec → local import)

Where the imported column type differs from the RESO spec. Verified 2026-06-29.

| Column(s) | RESO type | Local type | Consequence |
|---|---|---|---|
| `california_sold.CloseDate` | DateTime | varchar(255) | **Dirty** — 4 impossible future dates (gotcha #2) |
| `*.YN` flags (Pool/View/Fireplace…) | Boolean | varchar / tinyint | **Bug** — values are `1`/empty, not `True`/`False` (gotcha #6) |
| `california_sold` numeric (Bedrooms, YearBuilt, Bathrooms…) | Int32 | double | Harmless — all values are clean whole numbers |
| `california_sold` dates (Listing/PurchaseContractDate) | DateTime | varchar(255) | Harmless — clean `YYYY-MM-DD`, sort/compare OK |
| `rets_property` price/sqft (`L_SystemPrice`, `LM_Int2_3`) | Decimal 14.2 | int | OK for whole-dollar/whole-sqft values |
| `rets_property.LM_Int2_3` (sqft), `YearBuilt` | Int32 | int | 192 sqft and 181 YearBuilt rows are 0/NULL — use `NULLIF(x,0)` |

---

## ⚠️ Data gotchas (spec vs. reality)

These are gaps between the Trestle spec / project handbook and what's actually in the local DB.
All verified against the live database on 2026-06-29.

1. **The active↔sold ID join returns ZERO rows.** The handbook says to join
   `CAST(L_ListingID AS UNSIGNED) = ListingKey`, but `rets_property` (active) and
   `california_sold` (sold) hold **disjoint properties** — a listing is either active *or* sold,
   never both — so no ID is shared. **Relate them by attributes instead** (`City` + `PostalCode` +
   beds/sqft/price), which is what a real estate "comp" is.

2. **`CloseDate` is stored as `VARCHAR`, not `DateTime`.** The RESO spec defines it as `DateTime`;
   the import downgraded it to text, dropping validation. Result: **4 impossible future dates**
   (`2072-06-29`, `2030-…`, `2028-…`). Always filter `WHERE CloseDate <= CURDATE()` before any
   date math or averaging.

3. **`L_Status` / `StandardStatus` are always `Active`.** Correct — `rets_property` is by design
   the active-listings table. But it means you cannot find Pending/Closed/Withdrawn listings here,
   even though those are valid RESO enum values.

4. **Row counts differ from the handbook.** Handbook claims ~228K active / ~439K sold; the actual
   local import is **53,122 active / 87,157 sold**. The local DB is the source of truth.

5. **Two naming conventions.** `rets_property` uses legacy vendor names (`L_*`, `LM_*`);
   `california_sold` uses RESO standard names. Don't assume a column in one table exists by the
   same name in another.

6. **YN flags store `1`/empty, NOT `True`/`False`.** The handbook filters `PoolPrivateYN = 'True'`
   and `ViewYN = 'True'`, but the data uses `'1'` = yes and `''`/`NULL` = no/unknown. So
   `PoolPrivateYN = 'True'` matches **0 rows** (`= '1'` matches 7,324); `ViewYN = 'True'` matches
   **0 rows** (`= '1'` matches 33,446). **Filter `= '1'` (or `IN ('1',1)`), never `= 'True'`.**
   This silently breaks the handbook's pool/view search filters (Weeks 2–3).

7. **`PropertyType = 'Residential'` filters nothing — use `PropertySubType` for SFR.**
   `california_sold.PropertyType` is **100% `Residential`** (and `rets_property.L_Class` is 100%
   `Residential`), so the handbook's `WHERE PropertyType = 'Residential'` (Weeks 5 & 7) is a no-op
   that mixes Single Family + Condo + Townhouse + Duplex into one median. The real type split is in
   **`PropertySubType`** (sold) / **`L_Type_`** (active): SingleFamilyResidence 65,142, Condominium
   14,376, Townhouse 5,086, etc. The Real Estate Primer's #1 rule is to filter by property type
   before any median/price-per-sqft/DOM — so for the SFR benchmark use
   `PropertySubType = 'SingleFamilyResidence'`.

---

## Domain reference (for analytics & RAG)

Business context from the *Real Estate Data Analyst Primer*. Useful for the market-analytics agent
(Week 5) and as RAG knowledge (Week 8). Data originates from **CRMLS** (California Regional MLS).

**Transaction lifecycle:** Listing → Offer/Preapproval → Purchase Agreement & Escrow (status =
Pending) → Close (status = Closed, `ClosePrice`/`CloseDate` recorded). `ClosePrice`/`CloseDate`
**only exist in sold records** — this is the structural reason active and sold tables don't share IDs.

**Sale-to-list ratio** = `ClosePrice / ListPrice` (the handbook's `list_to_close_pct`):
- `> 1.0` → competitive **seller's market** (closed above asking; bidding wars)
- `< 1.0` → **buyer leverage** or an overpriced listing
- Aggregate across ZIP + time for a local market-momentum proxy.

**Days on Market (DOM) interpretation bands:**

| DOM | Reading |
|---|---|
| 1–7 | Extremely competitive — likely multiple offers |
| 8–30 | Healthy demand (normal) |
| 31–60 | Moderate — seasonal slowdown or slight overpricing |
| 60+ | Weak demand — overpriced, condition issues, or low interest |

(`CumulativeDaysOnMarket` = DOM summed across relists; resets only on ownership change.)

**StandardStatus lifecycle codes:** Active (live inventory) · Pending (under contract, no
`ClosePrice` yet) · Closed (sold — use for price/volume) · Back on Market / BOM (deal fell through,
DOM may have reset) · Expired (term ended unsold) · Withdrawn (seller pulled it). **Filter
`StandardStatus = Closed` for price trends, `= Active` for inventory** — never mix statuses.

**Property-type rule:** always filter by type before any median / price-per-sqft / DOM, or the
metric is skewed by what mix sold that month. **SFR is the standard benchmark.** In this data,
filter `PropertySubType = 'SingleFamilyResidence'` (not `PropertyType`, which is all `Residential`).

---

*Authoritative field definitions: Trestle RESO "Property" resource metadata (CoreLogic). Domain
context: Real Estate Data Analyst Primer (CRMLS). This file covers the locally-imported subset; the
full Trestle feed defines 300+ fields.*
