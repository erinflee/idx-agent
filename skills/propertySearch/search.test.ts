// Week 3 — integration test for searchActiveListings against the live DB

// SEARCH layer ONLY: filter goes in -> correct rows come out
// (full parse -> search -> format chain is tested in index.test.ts)

// Run:  npm run test-property-search
//      (needs .env + DB running)


import { searchActiveListings } from "./search";
import { closePool } from "../shared/db";


async function main() {
  let failed = 0;
  function check(condition: boolean, label: string): void {
    if (condition) console.log(`PASS  ${label}`);
    else {
      console.error(`FAIL  ${label}`);
      failed++;
    }
  }

  const filter = { city: "Irvine", maxPrice: 1_200_000, beds: 3, property: "Condominium" };
  const rows = await searchActiveListings(filter, 1, 5);
  // huge limit must still be clamped to 50 (handbook rule, see search.ts)
  const many = await searchActiveListings({ city: "Irvine" }, 1, 1000);

  // rows.length > 0 is the key guard: [].every(...) is vacuously true, so without it
  // an empty result would pass every per-row check below without checking anything.
  check(rows.length > 0,  "query returned rows");
  check(rows.length <= 5, "respects limit of 5");
  check(rows.every(r => r.city === "Irvine"),            "all rows in Irvine");
  check(rows.every(r => r.price <= 1_200_000),           "all rows ≤ $1.2M");
  check(rows.every(r => r.beds !== null && r.beds >= 3), "all rows ≥ 3 beds");
  check(rows.every(r => r.property === "Condominium"),   "all rows are Condominium");
  check(many.length <= 50,                               "clamps 1000 → ≤ 50");

  await closePool();
  if (failed) { console.error(`\n${failed} failed`); process.exit(1); }
}

main();
