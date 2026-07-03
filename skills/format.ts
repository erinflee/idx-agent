// Week 3 — turn ListingRow results into readable property cards
//
// DB layer returns raw rows -> this is presentation step the agent uses
// before sending results back to the user

import type { ListingRow } from "./listingSearch";

// format a single listing into a one-block string card
export function formatListing(row: ListingRow): string {

  return `${row.address}, ${row.city}
$${row.price}, ${row.beds} bd / ${row.baths} ba, ${row.sqft} sqft
${row.property}`;
  
}