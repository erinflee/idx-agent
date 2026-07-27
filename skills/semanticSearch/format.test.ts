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


