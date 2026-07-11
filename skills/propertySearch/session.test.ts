// Week 4 — tests for the session memory store
//
// create a session -> update a slot -> confirm it stuck -> clear it -> confirm it's gone

// Run:  npm run test-property-session
import { getSession } from "./session";

function main() {
  let failed = 0
  const a = getSession("u1");
  const b = getSession("u1");
  if (a != b) {
    failed++;
    console.error(`New session created for same userId`);
  }
  if (a.conversationStep !== 0) {
    failed++;
    console.error(`New session step should be 0, got ${a.conversationStep}`);
  }
  
  if (!failed) console.log("PASS getSession returns same session at step 0");
  else {
    console.error(`\n${failed} failed`);
    process.exit(1);
  }
}

main();