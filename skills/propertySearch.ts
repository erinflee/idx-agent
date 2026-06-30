// natural language property search

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

// turn free-text query into structured filter object
export function parsePropertyQuery(query: string): PropertyFilter {
  const filter: PropertyFilter = {};

  // define patterns to be used for extracting info
  const cityMatch = query.match(/\bin\s+([a-z][a-z\s]*?)(?=\s+(?:under|with|over|and|\$|\d)\b|[,.?!]|$)/i);
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
  if (cityMatch) filter.city = cityMatch[1].trim();
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
console.log(parsePropertyQuery("Show me 3-bedroom condos in Irvine under $1.5M with a pool."));
