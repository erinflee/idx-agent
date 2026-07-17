// Week 3 — active listing search over rets_property
//
// take the PropertyFilter (imported from Week 2's parsePropertyQuery) and turns it
// into a parameterized SQL query against the active listings -> returns the matching rows

import { query } from "../shared/db";
import type { PropertyFilter } from "./parse";

// One row coming back from rets_property -> fields line up with SELECT
export interface ListingRow {
  id: string;
  address: string;
  city: string;
  zip: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property: string | null;
  hoa: number | null;
  view: string | null;
  pool: string | null;
  dom: number | null;
  yearBuilt: number | null;
  lotSqft: number | null;
  halfBaths: number | null;
  hoaFreq: string | null;
  prevPrice: number | null;
  priceChange: string | null;
  photoCount: number | null;
}

// Search active listings matching the filter, with pagination.
// page starts at 1; limit caps rows (handbook rule: never return > 50).
export async function searchActiveListings(filter: PropertyFilter, page = 1, limit = 10): Promise<ListingRow[]> {
  let sql = `SELECT 
      L_ListingID as id,
      L_Address as address,
      L_City as city, 
      L_Zip as zip, 
      L_SystemPrice as price,
      L_Keyword2 as beds, 
      LM_DEC_3 as baths, 
      LM_Int2_3 as sqft,
      L_Type_ as property,
      AssociationFee as hoa,
      ViewYN as view,
      PoolPrivateYN as pool,
      DaysOnMarket as dom,
      YearBuilt as yearBuilt,
      LotSizeSquareFeet as lotSqft,
      BathroomsHalf as halfBaths,
      AssociationFeeFrequency as hoaFreq,
      PreviousListPrice as prevPrice,
      PriceChangeTimestamp as priceChange,
      PhotoCount as photoCount
    FROM rets_property
    WHERE L_Status = 'Active'
    `;

  limit = Math.min(Number(limit), 50) // clamp off max 50
  const params: any[] = []; // what to be matched on
  const offset = (page - 1) * limit; // how many rows to skip before starting

  if (filter.city) {sql += " AND L_CITY = ?"; params.push(filter.city)};
  if (filter.maxPrice) {sql += " AND L_SystemPrice <= ?"; params.push(filter.maxPrice)};
  if (filter.beds) {sql += " AND L_Keyword2 >= ?"; params.push(filter.beds)};
  if (filter.baths) {sql += " AND (LM_DEC_3 + 0.5 * COALESCE(BathroomsHalf, 0)) >= ?"; params.push(filter.baths)};
  if (filter.sqft) {sql += " AND LM_Int2_3 >= ?"; params.push(filter.sqft)};
  if (filter.property) {sql += " AND L_Type_ = ?"; params.push(filter.property)};
  if (filter.pool) {sql += " AND PoolPrivateYN = ?"; params.push(filter.pool)};
  if (filter.hasView) {sql += " AND ViewYN = ?"; params.push(filter.hasView)};
  if (filter.maxHoa) {sql += ` AND (CASE AssociationFeeFrequency
      WHEN 'Annually'     THEN AssociationFee / 12
      WHEN 'SemiAnnually' THEN AssociationFee / 6
      WHEN 'Quarterly'    THEN AssociationFee / 3
      ELSE AssociationFee
    END) <= ?`; params.push(filter.maxHoa)}; // normalize fee to monthly before comparing
  sql += ` AND L_SystemPrice >= 10000`;
  sql += ` ORDER BY L_SystemPrice DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`; // can't add limit/offset into params

  return query<ListingRow>(sql, params);
}
