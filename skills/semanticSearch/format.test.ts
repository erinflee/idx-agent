// feed sample hits to the formatter to output cards
//
// run:  npm run test-semantic-format
//      (no DB / server needed)

import { formatSemanticHits } from "./format";
import type { SemanticHit } from "./semanticSearch";


function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}


const sample1: SemanticHit = {
  id: "1",
  score: 0.80912,
  address: "2064 Telegraph Ave",
  propertyType: "Condominium",
  city: "Berkeley",
  beds: 2,
  baths: 1,
  sqft: 980,
  year: 2011,
  price: 900830,
  description:
    "Bright New Zealand-inspired condo with mountain views, hardwood floors, and a sunny open kitchen that flows into a cozy living room perfect for entertaining friends and family on weekends.",
};


const sample2: SemanticHit = {
  id: "2",
  score: 0.59,
  address: null,
  propertyType: "SingleFamilyResidence",
  city: "Oakland",
  beds: 3,
  baths: 2,
  sqft: null,
  year: 1918,
  price: 1045000,
  description: null,
};


function main() {
  const card1 = formatSemanticHits("mountain views", [sample1]);
  assert(card1.includes('Matches for "mountain views"'), "header should include the query");
  assert(card1.includes("0.809"), "score should be rounded to 3 decimals");
  assert(card1.includes("2064 Telegraph Ave, Berkeley"), "address/city line wrong");
  assert(card1.includes("$900,830"), "price should be comma-formatted");
  assert(card1.includes("2 bd / 1 ba"), "beds/baths wrong");
  assert(card1.includes("980 sqft"), "sqft missing");
  assert(card1.includes("..."), "long description should be truncated with ...");
  assert(!card1.includes(sample1.description!), "full description should not appear");

  const card2 = formatSemanticHits("oakland house", [sample2]);
  assert(card2.includes("0.590"), "0.59 should render as 0.590");
  assert(card2.includes("N/A, Oakland"), "null address should be N/A");
  assert(card2.includes("N/A sqft"), "null sqft should be N/A");
  assert(card2.includes("$1,045,000"), "price should still format");
  assert(!card2.includes("null"), "null should not leak into the card");

  assert(
    formatSemanticHits("anything", []) === 'No similar listings found for anything' ||
      formatSemanticHits("anything", []).includes("No similar listings found"),
    "empty hits should return the no-results message",
  );
  assert(
    formatSemanticHits("anything", null).includes("No similar listings found"),
    "null hits should return the no-results message",
  );

  const both = formatSemanticHits("two homes", [sample1, sample2]);
  assert(both.includes("\n\n"), "cards should be separated by a blank line");
  assert(both.includes("0.809") && both.includes("0.590"), "both scores should appear");

  console.log("PASS - formatSemanticHits produces correct card strings");
}


main();
