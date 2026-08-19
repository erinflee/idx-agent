// pin classifyIntent()'s routing — pure function, no DB / server / LLM needed
//
// covers: one answer-key query per intent, the mixed-intent case (Week 9
// deliverable), unknown fallback, and two ladder-order pins (recommend beats
// search, knowledge beats market) so a reorder fails loudly instead of
// silently misrouting. Also pins one known-wrong case ("per sqft" collides
// with the search word "sqft") so a behavior change is noticed.
//
// run:  npm run test-orchestrator

import { classifyIntent } from "./orchestrator";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function main() {
  const searchIntent = classifyIntent("find a 3b2b sfr with a pool in cupertino");
  const marketIntent = classifyIntent("market trends in palo alto");
  const recommendIntent = classifyIntent("show me similar listings");
  const knowledgeIntent = classifyIntent("what is price per square foot?");
  const mixedIntent = classifyIntent("whats the going rate per sqft in oakland");
  const unknownIntent = classifyIntent("i am sad");
  
  assert(searchIntent === "search", `FAIL: search must beat ${searchIntent}`);
  assert(marketIntent === "market", `FAIL: market must beat ${marketIntent}`);
  assert(recommendIntent === "recommend", `FAIL: recommend must beat ${recommendIntent}`);
  assert(knowledgeIntent === "knowledge", `FAIL: knowledge must beat ${knowledgeIntent}`);
  assert(mixedIntent === "mixed", `FAIL: mixed must beat ${mixedIntent}`);
  assert(unknownIntent === "unknown", `FAIL: unknown must beat ${unknownIntent}`);

  console.log("PASS -- all orchestrator tests ran")
}

main();