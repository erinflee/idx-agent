// Week 5 — integration test for marketStatsAgent (thin TS wrapper -> Python market service)
//
// city in -> formatted summary + trend string out
//
// Run:  npx tsx skills/marketComps/marketStats.test.ts
//      (needs the FastAPI server running: uvicorn service:app --reload)


import { marketStatsAgent } from "./marketStats"


function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}


async function main() {
  const la = await marketStatsAgent("Los Angeles");
  assert(typeof la === "string" && la.length > 0, "should return a non-empty string");
  assert(la.includes("Los Angeles"), "should mention Los Angeles");
  assert(la.includes("sales"), "should include the summary line");
  assert(la.includes("Price trend"), "should include the trend section");
  assert(/\d{4}-\d{2}/.test(la), "should include month buckets like 2026-01");
  assert(la.includes("n/a"), "first trend row should render the null pct as n/a");

  const fake = await marketStatsAgent("Boston");
  assert(fake.includes("No recent sales data") || fake.includes("No trends data"), "Boston should return a friendly no-data message");
  console.log("marketStatsAgent passed");
}

main();