// WEEK 3 - propertySearch skill
//
// Connect the three building blocks into one callable "skill":
//   parse (Week 2) -> search (Week 3) -> format (Week 3)

import { parsePropertyQuery } from "./parse";
import { searchActiveListings } from "./search";
import { formatResults } from "./format";

// free-text query goes in -> formatted property cards goes out
export async function propertySearchSkill(query: string, page = 1, limit = 10): Promise<string> {
  const filter = parsePropertyQuery(query);
  const rows = await searchActiveListings(filter, page, limit);
  const cards = formatResults(rows);
  return cards; 
}
