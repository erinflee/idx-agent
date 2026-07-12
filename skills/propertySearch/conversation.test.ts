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
  const session = getSession("u1")

  if (session.property === "Condominium") console.log(`PASS  property: ${session.property}`);
  else {
    failed++;
    console.error(`FAIL  property: expected Condominium, got ${session.property}`);
  }
  if (session.city === "Irvine") console.log(`PASS  city: ${session.city}`);
  else {
    failed++;
    console.error(`FAIL  city: expected Irvine, got ${session.city}`);
  }
  if (session.maxPrice === 1200000) console.log(`PASS  maxPrice: ${session.maxPrice}`);
  else {
    failed++;
    console.error(`FAIL  maxPrice: expected 1200000, got ${session.maxPrice}`);
  }

  if (!failed) console.log(`PASS  conversation flow good`);
  else {
    console.error(`${failed} failed`);
    process.exit(1);
  }
}

main();
