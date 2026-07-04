// Week 3 — smoke test for searchActiveListings against the live DB
//
// Run from repo root:  npx tsx skills/propertySearch/search.test.ts
// (This hits the real MySQL, so it needs your .env + the DB running.)

import { searchActiveListings } from "./search";
import { formatResults } from "./format";
import { propertySearchSkill } from "./index";
import { closePool } from "../shared/db";


function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  // TODO: build a filter by hand (or import parsePropertyQuery and parse a
  //       sentence like "3 bed houses in Irvine under 1.2m").
  const query = "at least 3 bed condo in Irvine under 1.2m";
  const filter = { city: "Irvine", maxPrice: 1200000, beds: 3, property: "Condominium" };
  const rows = await searchActiveListings(filter, 1, 5);
  const cards = await propertySearchSkill(query);

  assert(rows.length <= 5, `expected <= 5 rows, got ${rows.length}`);
  for (const r of rows) {
    assert(r.city === "Irvine", `${r.id}: city ${r.city} is not Irvine`)
    assert(r.price <= 1200000, `${r.id}: price $${r.price.toLocaleString()} exceeds max`);
    assert(r.beds !== null && r.beds >= 3, `${r.id}: ${r.beds} beds, want >= 3`);
    assert(r.property == "Condominium", `${r.id}: ${r.property} is not Condominium`)
  }
  assert(typeof cards === "string" && cards.length > 0, "skill returned empty");
  console.log("PASS - all checks passed");
  // Always close the pool at the end so the script can exit (see db.ts).
  await closePool();
}

main();
