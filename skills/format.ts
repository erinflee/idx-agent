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





// Format a whole result set. Handle the empty case (return a "no matches"
// message) and otherwise join each formatted card.
// TODO: implement using formatListing above.
export function formatResults(rows: ListingRow[]): string {
  throw new Error("not implemented yet");
}

