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
    photoCount: 20,
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

