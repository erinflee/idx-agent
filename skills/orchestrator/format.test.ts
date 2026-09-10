// feed sample data to the mixed-intent formatters
//
// the branches worth covering: trendVerdict's direction thresholds (rising above +2%,
// falling below -2%, flat between), the explicit "+" on gains, and the too-few-months
// fallback; formatMixed's header (count comes from rows, price note only when a cap
// was given), card numbering, the divider, and the stats block landing at the end
//
// run:  npm run test-orchestrator-format
//      (no DB / server needed)

import { formatMixed, trendVerdict } from "./format";
import type { ListingRow } from "../propertySearch/search";
import type { PriceTrendMonth } from "../marketComps/marketStats";


function makeRow(id: string, address: string, price: number): ListingRow {
  return {
    id,
    address,
    city: "San Diego",
    zip: "92101",
    price,
    beds: 3,
    baths: 2,
    sqft: 1500,
    property: "SingleFamilyResidence",
    hoa: null,
    view: null,
    pool: null,
    dom: 12,
    yearBuilt: 1990,
    lotSqft: 5000,
    halfBaths: 0,
    hoaFreq: null,
    prevPrice: null,
    priceChange: null,
  };
}

const rows: ListingRow[] = [
  makeRow("11111", "1 Main St", 800000),
  makeRow("22222", "2 Oak Ave", 900000),
];

const rising: PriceTrendMonth[] = [
  { month: "2025-12", sales: 90, avgPrice: 900000, priceChangePct: null },
  { month: "2026-01", sales: 95, avgPrice: 920000, priceChangePct: 2.2 },
  { month: "2026-02", sales: 100, avgPrice: 950000, priceChangePct: 3.3 },
];

const falling: PriceTrendMonth[] = [
  { month: "2025-12", sales: 90, avgPrice: 900000, priceChangePct: null },
  { month: "2026-02", sales: 100, avgPrice: 850000, priceChangePct: -5.6 },
];

const flat: PriceTrendMonth[] = [
  { month: "2025-12", sales: 90, avgPrice: 900000, priceChangePct: null },
  { month: "2026-02", sales: 100, avgPrice: 909000, priceChangePct: 1.0 },
];

const oneMonth: PriceTrendMonth[] = [
  { month: "2025-12", sales: 90, avgPrice: 900000, priceChangePct: null },
];

const stats = "San Diego - single family homes, last 7 months\n1,234 sales • 28 days on market";


function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}


function main() {
  // --- trendVerdict ---
  // the verdict is a one-line headline: direction only, no figures
  const up = trendVerdict(rising);
  assert(up.startsWith("Prices are rising"), "rising trend not called rising");
  assert(!up.includes("$"), "verdict should not repeat the dollar figures");

  const down = trendVerdict(falling);
  assert(down.startsWith("Prices are falling"), "falling trend not called falling");

  const steady = trendVerdict(flat);
  assert(steady.startsWith("Prices are flat"), "change inside +/-2% not called flat");

  const fallback = "Not enough monthly sales to call a trend.";
  assert(trendVerdict(null) === fallback, "null trend should hit the fallback");
  assert(trendVerdict([]) === fallback, "empty trend should hit the fallback");
  assert(trendVerdict(oneMonth) === fallback, "one month should hit the fallback");

  // --- formatMixed ---
  const withCap = formatMixed("San Diego", 1000000, rows, rising, stats);
  const lines = withCap.split("\n");

  assert(lines[0] === "Top 2 listings in San Diego under $1,000,000:", "bad header with price cap");
  assert(lines[1] === "", "blank line missing after header");
  assert(lines[2].startsWith("1. 1 Main St, San Diego, CA 92101"), "first card should follow the header directly");
  assert(withCap.includes("2. 2 Oak Ave, San Diego, CA 92101"), "second card not numbered 2");
  assert(withCap.includes("id: 11111") && withCap.includes("id: 22222"), "listing ids missing from cards");
  assert(withCap.split("-----------------------").length === 2, "expected exactly one divider, before the verdict");
  assert(withCap.indexOf("2. 2 Oak Ave") < withCap.indexOf("-----------------------"), "divider should come after the cards");
  assert(withCap.includes("Prices are rising"), "verdict line missing");
  assert(withCap.endsWith(stats), "stats block should be the last thing in the reply");
  assert(withCap.indexOf("1. 1 Main St") < withCap.indexOf("Prices are rising"), "cards should come before the verdict");
  assert(withCap.indexOf("Prices are rising") < withCap.indexOf(stats), "verdict should come before the stats block");

  const noCap = formatMixed("San Diego", undefined, rows, rising, stats);
  assert(noCap.split("\n")[0] === "Top 2 listings in San Diego:", "header should have no price note without a cap");
  assert(!noCap.includes("under $"), "price note leaked without a cap");

  const noRows = formatMixed("San Diego", undefined, [], null, stats);
  assert(noRows.startsWith("Top 0 listings in San Diego"), "count should come from rows, not a fixed 5");
  assert(noRows.includes("No matching listings found"), "empty rows should show the no-results line");
  assert(noRows.includes(fallback), "null trend should show the fallback inside the mixed reply");
  assert(noRows.endsWith(stats), "stats block still last when there are no rows");

  assert(!withCap.includes("null"), "null leaked into mixed reply");
  assert(!withCap.includes("undefined"), "undefined leaked into mixed reply");

  console.log("PASS - mixed-intent formatters produce the expected reply");
}


main();
