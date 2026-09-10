// pin classifyIntent()'s routing — pure function, no DB / server / LLM needed
//
// covers: one answer-key query per intent, the mixed-intent case (Week 9
// deliverable), unknown fallback, and two ladder-order pins (recommend beats
// search, knowledge beats market) so a reorder fails loudly instead of
// silently misrouting. Also pins one known-wrong case ("per sqft" collides
// with the search word "sqft") so a behavior change is noticed.
//
// also pins the single-turn empty-filter guard: a vague search with no city
// and no budget must get a clarifying question, never a statewide search
// (the guard returns before any DB call, so this still needs no server)
//
// run:  npm run test-orchestrator

import { classifyIntent, orchestrate } from "./orchestrator";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  const searchIntent = classifyIntent("find a 3b2b sfr with a pool in cupertino");
  const weakMarketIntent = classifyIntent("whats the going rate per sqft in oakland");
  const marketIntent1 = classifyIntent("market trends in palo alto");
  const marketIntent2 = classifyIntent("should i buy in irvine right now?");
  const recommendIntent = classifyIntent("show me similar listings");
  const knowledgeIntent = classifyIntent("what is price per square foot?");
  const mixedIntent1 = classifyIntent("find homes in san francisco and tell me if prices are rising");
  const mixedIntent2 = classifyIntent("condos in oakland and whats the going rate per sqft");

    const unknownIntent = classifyIntent("i am sad");

  // mixed -> recommend -> knowledge -> search -> market -> unknown
  assert(searchIntent === "search", `FAIL  expected search, got ${searchIntent}`);
  assert(weakMarketIntent === "market", `FAIL  should stay market, got: ${weakMarketIntent}`);
  assert(marketIntent1 === "market", `FAIL  expected market, got ${marketIntent1}`);
  assert(marketIntent2 === "market", `FAIL  expected market, got ${marketIntent2}`);
  assert(recommendIntent === "recommend", `FAIL  recommend must beat ${recommendIntent}`);
  assert(knowledgeIntent === "knowledge", `FAIL  knowledge must beat ${knowledgeIntent}`);
  assert(mixedIntent1 === "mixed", `FAIL  expected: mixed, got: ${mixedIntent1}`);
  assert(mixedIntent2 === "mixed", `FAIL  expected: mixed, got: ${mixedIntent2}`);
  assert(unknownIntent === "unknown", `FAIL  expected: unknown, got: ${unknownIntent}`);

  // empty-filter guard (single-turn path only: no userId)
  const vague = "show me something nice";
  assert(classifyIntent(vague) === "search", `FAIL  guard test query must route to search, got ${classifyIntent(vague)}`);
  const vagueReply = await orchestrate(vague);
  assert(vagueReply === "Which city and what budget are you looking at?", `FAIL  vague search should ask for city/budget, got: ${vagueReply}`);
  assert(!vagueReply.includes("id:"), "FAIL  vague search returned a listing card");

  console.log("PASS -- all orchestrator tests ran")
}

main();