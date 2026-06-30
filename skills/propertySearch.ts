// natural language property search

import cities from "./cities.json";

// structured filter we extract -> each variable maps to a real rets_property field
export interface PropertyFilter {
  city?: string;
  maxPrice?: number;
  minBed?: number;
  minBath?: number;
  minSqft?: number;
  property?: string;
  pool?: string;
  view?: string;
  maxHoa?: number;
}

function replaceAsLiteral(s: string): string {
  return s.replace(/[.*+?^${}()|[\][\\]]/g, "\\$&");
}

function findCity(query: string): string | undefined {
  return cities.find((c) => new RegExp(`\\b${replaceAsLiteral(c)}\\b`, "i").test(query));
}

// turn free-text query into structured filter object
export function parsePropertyQuery(query: string): PropertyFilter {
  const filter: PropertyFilter = {};

  // define patterns to be used for extracting info
  const city = findCity(query);
  const priceMatch = query.match(/(?:under|below|less\s+than|no\s+more\s+than|max|up\s+to|within|≤|cheaper\s+than)\s*\$?([\d,.]+)(k|m)?/i);
  const bedMatch = query.match(/\b(\d+)[\s-]*(?:room|rooms|bed|beds|bedroom|bedrooms)/i);
  const bathMatch = query.match(/\b(\d+(?:\.\d+)?)[\s-]*(?:bath|baths|bathroom|bathrooms)/i);
  const sqftMatch = query.match(/\b(\d[\d,]*)[\s-]*(?:sqft|sq\s+ft|square\s+feet|sq\.\s+ft\.|sf)/i);
  const poolMatch = query.match(/\b(?:swimming\s+)?pools?\b/i);
  const viewMatch = query.match(/\bviews?\b/i);
  const hoaBefore = query.match(/\b\$?(\d[\d,]*)\D{0,15}(?:hoa|dues?|fees?|association\s+fees?)/i);
  const hoaAfter = query.match(/\b(?:hoa|dues?|fees?|association\s+fees?)\D{0,15}\$?(\d[\d,]*)/i);
  const hoaMatch = hoaBefore ?? hoaAfter;

  const propertyMap: Record<string, string> = {
    condo: "Condominium",
    condominium: "Condominium",
    townhome: "Townhouse",
    townhouse: "Townhouse",
    "single family residence": "SingleFamilyResidence",
    "single family": "SingleFamilyResidence",
    sfr: "SingleFamilyResidence",
    house: "SingleFamilyResidence",
  };

  const propertyMatch = Object.keys(propertyMap).find((k) => query.toLowerCase().includes(k));

  // use patterns from above and find all matches with query
  if (city) filter.city = city;
  if (priceMatch) {
    let maxPrice = Number(priceMatch[1].replace(/,/g, ""));
    const suffix = priceMatch[2]?.toLowerCase();
    if (suffix === "k") maxPrice *= 1000;
    if (suffix === "m") maxPrice *= 1000000;
    filter.maxPrice = maxPrice;
  }
  if (bedMatch) filter.minBed = Number(bedMatch[1]);
  if (bathMatch) filter.minBath = Number(bathMatch[1]);
  if (sqftMatch) filter.minSqft = Number(sqftMatch[1].replace(/,/g, ""));
  if (poolMatch) filter.pool = "1";
  if (viewMatch) filter.view = "1";
  if (hoaMatch) filter.maxHoa = Number(hoaMatch[1].replace(/,/g, ""));
  if (propertyMatch) filter.property = propertyMap[propertyMatch];

  return filter;
}

// quick test
function main() {
  const testQueries = [
    // single field
    "place in Stanford",
    "home under 900k",
    "2.5 bath listings",
    "1,800 sq ft properties",
    "home with a pool",

    // multiple field
    "3 bed 2.5 bath single family in Pasadena under $1.2M with a pool",
    "2 bedroom condo in Long Beach under $600k",
    "condo in San Francisco under $1.2M with pool and view",

    // no match -> should return {}
    "hello there",
    "show me something nice",

    // weak spots
    "homes in Walnut Creek below $500k",
    "warehouse loft in Santa Cruz",
    "condo in Berkeley with HOA under $500",
    "condo without a pool",
    "$1,200,000 home in Irvine",
  ];

  console.log("=== NLP Parser Test Results ===\n");
  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    console.log("Parsed:", JSON.stringify(parsePropertyQuery(query), null, 2));
    console.log("---");
  }
}

main();
