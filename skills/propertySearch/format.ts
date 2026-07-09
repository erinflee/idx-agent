// Week 3 — turn ListingRow results into readable property cards
//
// DB layer returns raw rows -> agent uses this step before sending results back to the user

import type { ListingRow } from "./search";

// format a single listing into a one-block string card
export function formatListing(row: ListingRow): string {

  return `${row.address}, ${row.city}, CA ${row.zip}
$${row.price?.toLocaleString() ?? "N/A"} • ${row.beds ?? "N/A"} bd / ${row.baths ?? "N/A"} ba • ${row.sqft?.toLocaleString() ?? "N/A"} sqft • ${row.lotSqft ? Number(row.lotSqft).toLocaleString() : "N/A"} sqft lot
${row.property ?? "N/A"} • Built ${row.yearBuilt ?? "N/A"} • ${row.dom ?? "N/A"} days on market`;
  
}

// format entire result set and handle the empty case 
// otherwise join each formatted card
export function formatResults(rows: ListingRow[]): string {
  if (rows.length === 0) {return "No matching listings found"};
  return rows.map(formatListing).join("\n\n");
}

