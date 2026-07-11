// Week 4 — tests for the session memory store
//
// create a session -> update a slot -> confirm it stuck -> clear it -> confirm it's gone

// Run:  npm run test-property-session


import { getSession, updateSession } from "./session";

function main() {
  let failed = 0
  const a = getSession("u1");
  const b = getSession("u1");
  updateSession("u2", { city: "Concord", beds: 3 });
  updateSession("u2", { city: "Berkeley", property: "Condominium" });
  const c = getSession("u2");

  if (a !== b) {
    failed++;
    console.error(`New session created for same userId`);
  }
  if (a.conversationStep !== 0) {
    failed++;
    console.error(`New session step should be 0, got ${a.conversationStep}`);
  }
  if (c.city !== "Berkeley" || c.beds !== 3 || c.property !== "Condominium") {
    failed++;
    console.error(`Session update failed`);
  }  
  if (!failed) console.log("PASS  session store: getSession identity + updateSession merge");
  else {
    console.error(`\n${failed} failed`);
    process.exit(1);
  }
}

main();

