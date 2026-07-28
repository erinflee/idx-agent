// Week 6 — integration test for semanticSearchAgent (thin TS wrapper -> Python semantic service)
//
// free-text query in -> formatted listing cards out
//
// Run:  npm run test-semantic-search
//      (needs the FastAPI server running: uvicorn service:app --reload,
//       and the embeddings built: python scripts/build_embeddings.py)

import { semanticSearchAgent } from "./semanticSearch";


function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}


async function main() {
  const query = "city views in a nice highrise for myself";
  const out = await semanticSearchAgent(query);

  assert(typeof out === "string" && out.length > 0, "should return a non-empty string");
  assert(out.includes(`Matches for "${query}"`), "header should include the query");
  assert(/\d\.\d{3}/.test(out), "should include a 3-decimal similarity score");
  assert(out.includes("$"), "should include a price");
  assert(out.includes("bd") && out.includes("ba"), "should include beds/baths");
  assert(out.includes("sqft"), "should include sqft");
  assert(out.includes("\n\n"), "should separate header/cards with blank lines");

  console.log("semanticSearchAgent passed");
}

