// Week 2 - natural language property search

import cities from "./cities.json" with { type: "json" };

// map user-facing property-type words to rets_property L_Type_ values
const propertyMap: Record<string, string> = {
  condo: "Condominium",
  condos: "Condominium",
  condominium: "Condominium",
  condominiums: "Condominium",
  townhome: "Townhouse",
  townhomes: "Townhouse",
  townhouse: "Townhouse",
  townhouses: "Townhouse",
  "single family residence": "SingleFamilyResidence",
  "single family": "SingleFamilyResidence",
  sfr: "SingleFamilyResidence",
  house: "SingleFamilyResidence",
  land: "UnimprovedLand",
};

const cityAbbreviations: Record<string, string> = {
  sf: "San Francisco",
  "san fran": "San Francisco",
  sd: "San Diego",
  sj: "San Jose",
  slo: "San Luis Obispo",
  sac: "Sacramento",
  bh: "Beverly Hills",
  weho: "West Hollywood",
  noho: "North Hollywood",
}

// structured filter we extract -> each variable maps to a real rets_property field
export interface PropertyFilter {
  city?: string;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  property?: string;
  pool?: string;
  hasView?: string;
  maxHoa?: number;
}

// turn free-text query into structured filter object
export function parsePropertyQuery(query: string): PropertyFilter {
  const filter: PropertyFilter = {};

  const replaceAsLiteral = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cityMatch = cities.find((c) => new RegExp(`\\b(?:in|around|near|nearby|within|close\\s+to)\\s+${replaceAsLiteral(c)}\\b`, "i").test(query));
  const abbrev = Object.keys(cityAbbreviations).find((k) => new RegExp(`\\b${replaceAsLiteral(k)}\\b`, "i").test(query));
  const city = cityMatch ?? (abbrev ? cityAbbreviations[abbrev] : undefined);
  const priceMatch = query.match(/(?:under|below|less\s+than|no\s+more\s+than|max|up\s+to|within|cheaper\s+than|≤|<=|<)\s*\$?([\d,.]+)\s*(million|mil|m|thousand|k|grand)?\b/i);
  const priceFallback = priceMatch ? null : query.match(/\$\s?([\d,]+(?:\.\d+)?)\s*(million|mil|m|thousand|k|grand)?\b/i);
  const priceSource = priceMatch ?? priceFallback;
  const bedMatch = query.match(/\b(\d+)[\s-]*(?:room|rooms|bed|beds|bedroom|bedrooms|bd|bds|bdrm|bdrms|br|brs)/i);
  const bathMatch = query.match(/\b(\d+(?:\.\d+)?)[\s-]*(?:bath|baths|bathroom|bathrooms|ba\b)/i);
  const sqftMatch = query.match(/\b(\d[\d,]*)[\s-]*(?:sqft|sq\s+ft|square\s+(feet|foot)|sq\.\s+ft\.)/i);
  const poolMatch = query.match(/\b(?:swimming\s+)?pools?\b/i);
  const poolNegated = /\b(?:no|without|not|w\/o|sans)\s+(?:a\s+|an\s+)?(?:swimming\s+)?pools?\b/i.test(query);
  const viewMatch = query.match(/\bviews?\b/i);
  const viewNegated = /\b(?:no|without|not|w\/o|sans)\s+(?:a\s+|an\s+)?views?\b/i.test(query);
  const hoaBefore = query.match(/(?:under|below|less\s+than|no\s+more\s+than|max|up\s+to|within|cheaper\s+than|≤|<=|<)\s*\$?(\d[\d,]*)\s*(?:\/\s*mo(?:nth)?)?\s*(?:hoa|association\s+(?:fees?|dues?)|hoa\s+fees?)/i);
  const hoaAfter = query.match(/(?:hoa|association(?:\s+fees?|\s+dues?)?)\s*(?:fees?|dues?)?\s*(?:under|below|less\s+than|no\s+more\s+than|max|up\s+to|within|cheaper\s+than|≤|<=|<)\s*\$?(\d[\d,]*)/i);
  const hoaMatch = hoaBefore ?? hoaAfter;

  const propertyMatch = Object.keys(propertyMap).find((k) => new RegExp(`\\b${replaceAsLiteral(k)}\\b`, "i").test(query));

  // use patterns from above and find all matches with query
  if (city) filter.city = city;
  if (priceSource) {
    let maxPrice = Number(priceSource[1].replace(/,/g, ""));
    const suffix = priceSource[2]?.toLowerCase();
    if (suffix === "thousand" || suffix === "grand" || suffix === "k") maxPrice *= 1000;
    if (suffix === "million" || suffix === "mil" || suffix === "m") maxPrice *= 1000000;
    if (suffix || maxPrice >= 10000) filter.maxPrice = maxPrice;
  }
  if (bedMatch) filter.beds = Number(bedMatch[1]);
  if (bathMatch) filter.baths = Number(bathMatch[1]);
  if (sqftMatch) filter.sqft = Number(sqftMatch[1].replace(/,/g, ""));
  if (poolMatch && !poolNegated) filter.pool = "1";
  if (viewMatch && !viewNegated) filter.hasView = "1";
  if (hoaMatch) filter.maxHoa = Number(hoaMatch[1].replace(/,/g, ""));
  if (propertyMatch) filter.property = propertyMap[propertyMatch];

  return filter;
}
