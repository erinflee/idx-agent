// Week 3 — unit test for the card formatters
//
// formatListing / formatResults are PURE functions — no DB needed
// feed hand-made ListingRow objects and check the exact card text
//
// Run:  npm run test-property-format


import { formatListing, formatResults } from "./format";
import type { ListingRow } from "./search";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const sample: ListingRow = {
  id: "PW001", address: "1 Main St", city: "Irvine", zip: "92604",
  price: 750000, beds: 3, baths: 2, sqft: 1500,
  property: "Condominium", hoa: 300, view: "", pool: "",
  dom: 12, yearBuilt: 1998, lotSqft: 6000, halfBaths: 1,
  hoaFreq: "Quarterly", // $300 quarterly -> should render as $100/mo
  prevPrice: 800000, priceChange: "2026-06-01", // carried in the row, not shown on the card
};

function main() {
  // a normal row renders every field, with comma-grouped price + sqft
  const card = formatListing(sample);
  assert(card.includes("1 Main St, Irvine, CA 92604"), "address line wrong");
  assert(card.includes("$750,000"), "price should be comma-formatted");
  assert(card.includes("3 bd / 2.5 ba"), "beds/baths wrong (2 full + 1 half = 2.5)");
  assert(card.includes("1,500 sqft"), "sqft should be comma-formatted");
  assert(card.includes("Condominium"), "property missing");
  assert(card.includes("12 days on market"), "days on market missing");
  assert(card.includes("Built 1998"), "year built missing");
  assert(card.includes("6,000 sqft lot"), "lot size missing");
  assert(card.includes("HOA $100/mo"), "quarterly $300 HOA should normalize to $100/mo");

  // null fields must fall back to N/A, not crash or print "null"
  const partial: ListingRow = { ...sample, beds: null, sqft: null, property: null };
  const partialCard = formatListing(partial);
  assert(partialCard.includes("N/A bd"), "null beds should show N/A");
  assert(partialCard.includes("N/A sqft"), "null sqft should show N/A");
  assert(!partialCard.includes("null"), "null field leaked into the card");

  // empty result set -> the friendly no-matches message
  assert(formatResults([]) === "No matching listings found", "empty case wrong");

  // multiple rows -> two cards separated by a blank line
  const joined = formatResults([sample, sample]);
  assert(joined.includes("\n\n"), "cards should be separated by a blank line");
  assert(joined.split("Condominium").length === 3, "should render exactly two cards");

  console.log("PASS - format functions produce correct card strings");
}

main();
