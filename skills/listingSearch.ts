// Week 3 — active listing search over rets_property
//
// take the PropertyFilter (imported from Week 2's parsePropertyQuery) and turns it
// into a parameterized SQL query against the active listings -> returns the matching rows

import { query } from "./db";
import type { PropertyFilter } from "./propertySearch";

// One row coming back from rets_property -> fields line up with SELECT
export interface ListingRow {
  L_ListingID: string;
  L_Address: string;
  L_City: string;
  price: number; // aliased from L_SystemPrice in the SQL
  beds: number; // aliased from L_Keyword2
  bath: number; // aliased from LM_Dec_3
  propertyType: string; // aliased from L_Type_
  sqft: number; // sqft
  PoolPrivateYN: string;
  ViewYN: string;
  AssociationFee: number;
}
