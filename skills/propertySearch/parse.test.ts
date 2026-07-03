// validation for parsePropertyQuery —> run directly to check the parser against known queries
import { parsePropertyQuery, type PropertyFilter } from "./parse.ts";

// each query paired with the filter parsePropertyQuery must produce
const testCases: [string, PropertyFilter][] = [
  // single field
  ["place in Stanford", { city: "Stanford" }],
  ["home under 900k", { maxPrice: 900000 }],
  ["2.5 bath listings", { baths: 2.5 }],
  ["1,800 sq ft properties", { sqft: 1800 }],
  ["home with a pool", { pool: "1" }],

  // multiple field
  ["3 bed 2.5 bath single family in Pasadena under $1.2M with a pool", { city: "Pasadena", maxPrice: 1200000, beds: 3, baths: 2.5, pool: "1", type: "SingleFamilyResidence" }],
  ["2 bedroom townhouse in Long Beach under $600k", { city: "Long Beach", maxPrice: 600000, beds: 2, type: "Townhouse" }],
  ["condo in San Francisco under $1.2M with pool and view", { city: "San Francisco", maxPrice: 1200000, pool: "1", hasView: "1", type: "Condominium" }],

  // no match -> should return {}
  ["hello there", {}],
  ["show me something nice", {}],

  // weak spots
  ["homes in Walnut Creek below $500k", { city: "Walnut Creek", maxPrice: 500000 }],
  ["warehouse loft in Santa Cruz", { city: "Santa Cruz" }],
  ["condo in Berkeley under 300k with HOA under $500", { city: "Berkeley", maxPrice: 300000, maxHoa: 500, type: "Condominium" }],
  ["condo without a pool", { type: "Condominium" }],
  ["$1,200,000 home in Irvine", { city: "Irvine", maxPrice: 1200000 }],
];

// compare by stringifying: parser adds keys in interface order, so expected must too
function main() {
  for (const [query, expected] of testCases) {
    const actual = JSON.stringify(parsePropertyQuery(query));
    const want = JSON.stringify(expected);
    if (actual !== want) throw new Error(`FAIL "${query}"\n  expected ${want}\n  got      ${actual}`);
    console.log(`PASS  ${query}`);
  }
  console.log(`All ${testCases.length} cases passed`);
}

main();
