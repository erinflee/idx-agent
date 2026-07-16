// Week 3 — turn ListingRow results into readable property cards
//
// DB layer returns raw rows -> agent uses this step before sending results back to the user

import type { ListingRow } from "./search";

// normalize an HOA fee to a monthly figure using its stated frequency
// (unknown / null frequency is treated as monthly — the dominant case)
function monthlyHoa(fee: number | null, freq: string | null): number | null {
  if (fee == null) return null;
  switch (freq) {
    case "Annually":     return fee / 12;
    case "SemiAnnually": return fee / 6;
    case "Quarterly":    return fee / 3;
    default:             return fee;
  }
}

// format a single listing into a one-block string card
export function formatListing(row: ListingRow): string {
  const hoa = monthlyHoa(row.hoa, row.hoaFreq);
  const lot = row.lotSqft == null ? null : Number(row.lotSqft);

  return `${row.address}, ${row.city}, CA ${row.zip}
$${row.price?.toLocaleString() ?? "N/A"} • ${row.beds ?? "N/A"} bd / ${row.baths != null ? Number(row.baths) + 0.5 * (row.halfBaths ?? 0) : "N/A"} ba • ${row.sqft?.toLocaleString() ?? "N/A"} sqft • ${lot ? lot.toLocaleString() : "N/A"} sqft lot
${row.property ?? "N/A"} • Built ${row.yearBuilt ?? "N/A"} • ${row.dom ?? "N/A"} days on market${hoa != null ? ` • HOA $${Math.round(hoa).toLocaleString()}/mo` : ""} • ${row.photoCount ?? "N/A"} Photos`;

}

// format entire result set and handle the empty case 
// otherwise join each formatted card
export function formatResults(rows: ListingRow[]): string {
  if (rows.length === 0) {return "No matching listings found"};
  return rows.map(formatListing).join("\n\n");
}

