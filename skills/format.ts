// Week 3 — turn ListingRow results into readable property cards
//
// DB layer returns raw rows -> this is presentation step the agent uses
// before sending results back to the user

import type { ListingRow } from "./listingSearch";

// format a single listing into a one-block string card
export function formatListing(row: ListingRow): string {

  return `${row.address}, ${row.city}, CA ${row.zip}
$${row.price.toLocaleString()} • ${row.beds} bd / ${row.baths} ba • ${row.sqft.toLocaleString()} sqft
${row.property}`;
  
}


// format entire result set and handle the empty case 
// otherwise join each formatted card
export function formatResults(rows: ListingRow[]): string {
  if (rows.length == 0) {return "No matching listings found"};
  return rows.map(formatListing).join("\n\n");
}

