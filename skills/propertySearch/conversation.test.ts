// Week 4 — tests for the conversation layer (mergeMessage)
//
// parse each message -> fold filters into the session -> confirm they accumulate across turns

// Run:  npm run test-property-conversation

import { mergeMessage } from "./conversation";
import { getSession } from "./session";


function main() {
  let failed = 0;
  mergeMessage("u1", "condos in irvine");
  mergeMessage("u1", "under 1.2 mil");
  mergeMessage("u1", "actually, i want to live in San Diego with a nice view");
  mergeMessage("u1", "this is empty message");
  const session = getSession("u1")

  if (session.property === "Condominium") console.log(`PASS  property: ${session.property}`);
  else {
    failed++;
    console.error(`FAIL  property: expected Condominium, got ${session.property}`);
  }
  if (session.city === "San Diego") console.log(`PASS  city: ${session.city} (turn 3 overrode Irvine)`);
  else {
    failed++;
    console.error(`FAIL  city: expected San Diego, got ${session.city}`);
  }
  if (session.maxPrice === 1200000) console.log(`PASS  maxPrice: ${session.maxPrice}`);
  else {
    failed++;
    console.error(`FAIL  maxPrice: expected 1200000, got ${session.maxPrice}`);
  }
  if (session.hasView === "1") console.log(`PASS  hasView: ${session.hasView}`);
  else {
    failed++;
    console.error(`FAIL  hasView: expected 1, got ${session.hasView}`);
  }

  if (!failed) console.log(`PASS  session merges across turns: accumulate + override + no-wipe`);
  else {
    console.error(`${failed} failed`);
    process.exit(1);
  }
}

main();






