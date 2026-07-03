// Week 3 — active listing search over rets_property
//
// take the PropertyFilter (imported from Week 2's parsePropertyQuery) and turns it
// into a parameterized SQL query against the active listings -> returns the matching rows

import { query } from "./db";
import type { PropertyFilter } from "./propertySearch";

// One row coming back from rets_property -> fields line up with SELECT
export interface ListingRow {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  property: string;
  hoa: number;
  view: string;
  pool: string;
}

// Search active listings matching the filter, with pagination.
// page starts at 1; limit caps rows (handbook rule: never return > 50).
export async function searchActiveListings(filter: PropertyFilter, page = 1, limit = 10): Promise<ListingRow[]> {
  let sql = `SELECT 
      L_ListingID as id,
      L_Address as address,
      L_City as city, 
      L_SystemPrice as price,
      L_Keyword2 as beds, 
      LM_DEC_3 as baths, 
      LM_Int2_3 as sqft,
      L_Type_ as property,
      AssociationFee as hoa,
      ViewYN as view,
      PoolPrivateYN as pool
    FROM rets_property
    WHERE L_Status = 'Active'
    `;

  const params: any[] = []; // what to be matched on
  const offset = (page - 1) * limit; // how many rows to skip before starting

  if (filter.city) {sql += " AND L_CITY = ?"; params.push(filter.city)};
  if (filter.maxPrice) {sql += " AND L_SystemPrice <= ?"; params.push(filter.maxPrice)};
  if (filter.beds) {sql += " AND L_Keyword2 >= ?"; params.push(filter.beds)};
  if (filter.baths) {sql += " AND LM_DEC_3 >= ?"; params.push(filter.baths)};
  if (filter.sqft) {sql += " AND LM_Int2_3 >= ?"; params.push(filter.sqft)};
  if (filter.type) {sql += " AND L_Type_ = ?"; params.push(filter.type)};
  if (filter.pool) {sql += " AND PoolPrivateYN = ?"; params.push(filter.pool)};
  if (filter.hasView) {sql += " AND ViewYN = ?"; params.push(filter.hasView)};
  if (filter.maxHoa) {sql += " AND AssociationFee <= ?"; params.push(filter.maxHoa)};
}
