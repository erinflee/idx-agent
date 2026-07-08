// Week 3 — integration test for getSoldComps against the live california_sold table
//
// city + look-back window in -> recent CLOSED SFR sales out
//
// Run:  npm run test-market-comps
//      (needs .env + DB running)


import { getSoldComps } from "./comps";
import { closePool } from "../shared/db";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  const city = "Irvine";
  const rows = await getSoldComps(city, 12);

  // CloseDate is stored as a 'YYYY-MM-DD' string, so a string compare to today works
  // catches future-dated rows
  const today = new Date().toISOString().slice(0, 10);

  assert(rows.length > 0, "no comps returned - query matched nothing");
  assert(rows.length <= 50, `expected <= 50 rows, got ${rows.length}`);
  for (const r of rows) {
    assert(r.city === city, `${r.address}: city ${r.city} is not ${city}`);
    assert(r.property === "SingleFamilyResidence", `${r.address}: ${r.property} is not SFR`);
    assert(r.closeDate <= today, `${r.address}: future close date ${r.closeDate}`);
  }

  console.log(`PASS - getSoldComps returned ${rows.length} valid SFR comps in ${city}`);
  await closePool();
}

main();
