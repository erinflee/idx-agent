// Week 3 — integration test for the propertySearch SKILL
//
// WHOLE chain wired together — parse -> search -> format
// natural-language query goes in -> formatted cards come out
//
// Run:  npm run test-property-index
//      (needs .env + DB running)


import { propertySearchSkill } from "./index";
import { parsePropertyQuery } from "./parse";
import { closePool } from "../shared/db";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  const query = "at least 3 bed condo in Irvine under 1.2m";

  // check the parse step the skill depends on
  const filter = parsePropertyQuery(query);
  assert(filter.city === "Irvine", `parsed city ${filter.city} != Irvine`);
  assert(filter.beds === 3, `parsed beds ${filter.beds} != 3`);
  assert(filter.property === "Condominium", `parsed type ${filter.property} != Condominium`);

  // run the full skill and check real cards come back
  const cards = await propertySearchSkill(query);
  
  // empty-result message must NOT count as a pass
  assert(cards !== "No matching listings found", "skill returned the no-matches message");
  assert(cards.includes("Irvine"), "cards missing expected city Irvine");
  assert(cards.includes("Condominium"), "cards missing expected property type");

  console.log(cards);
  console.log("PASS - propertySearchSkill returned valid cards end-to-end");
  await closePool();
}

main();
