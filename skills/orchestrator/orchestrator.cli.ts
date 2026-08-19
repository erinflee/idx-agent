// CLI demo of the orchestrator (Week 9)
//
// Pass any free-text question as the argument -> classifyIntent() picks the
// skill(s) -> prints the routed reply. One entry point for search, market,
// recommend, knowledge, and mixed queries.
//
// Run:   npm run demo-orchestrator -- "find homes in oroville and are prices rising"
//       (market/knowledge/recommend arms need the FastAPI service running;
//        search hits MySQL directly)

import { orchestrate } from "./orchestrator";
import { closePool } from "../shared/db";

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('try: npm run demo-orchestrator -- "average price in oakland"');
    process.exit(1);
  }

  const response = await orchestrate(query);
  console.log(response);
  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
})



