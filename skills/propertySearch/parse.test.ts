// Week 3 — unit test for parsePropertyQuery against queries
//
// PARSE layer ONLY: query goes in -> parsed properties come out
// (full parse -> search -> format chain is tested in index.test.ts)
//
// Run:  npm run test-property-parse


import { parsePropertyQuery, type PropertyFilter } from "./parse";

// each query paired with the filter parsePropertyQuery must produce
const testCases: [string, PropertyFilter][] = [
  // single field
  ["place near Stanford", { city: "Stanford" }],
  ["home under 900k", { maxPrice: 900000 }],
  ["2.5 ba listings", { baths: 2.5 }],
  ["1,800 sq ft properties", { sqft: 1800 }],
  ["home that has a pool", { pool: "1" }],

  // multiple field
  ["3 bd 2.5 ba single family in Pasadena under $1.2M with a pool", { city: "Pasadena", maxPrice: 1200000, beds: 3, baths: 2.5, pool: "1", property: "SingleFamilyResidence" }],
  ["2 bedroom townhouse in Long Beach under $600k", { city: "Long Beach", maxPrice: 600000, beds: 2, property: "Townhouse" }],
  ["condo in San Francisco under $1.2M with pool and view", { city: "San Francisco", maxPrice: 1200000, pool: "1", hasView: "1", property: "Condominium" }],
  
  // no match -> should return {}
  ["hello there", {}],
  ["show me something nice", {}],

  // weak spots
  ["homes in walnut creek below $500k", { city: "Walnut Creek", maxPrice: 500000 }],
  ["warehouse loft in santa Cruz", { city: "Santa Cruz" }],
  ["condo in Berkeley under 300k with HOA under $500", { city: "Berkeley", maxPrice: 300000, maxHoa: 500, property: "Condominium" }],
  ["condo w/o a pool", { property: "Condominium" }],
  ["$1,200,000 home in Irvine", { city: "Irvine", maxPrice: 1200000 }],
];

// compare by stringifying: parser adds keys in interface order, so expected must too
function main() {
  let failed = 0
  for (const [query, expected] of testCases) {
    const actual = JSON.stringify(parsePropertyQuery(query));
    if (actual === JSON.stringify(expected)) {
      console.log(`PASS  ${query}`);
    }
    else {
      failed++;
      console.error(`FAIL  ${query}\n\texpected:  ${JSON.stringify(expected)}\n\tgot:\t   ${actual}`);
    }
  } 
  if (failed) { 
    console.error(`\n${failed} failed`);
    process.exit(1);
  }
}

main();
