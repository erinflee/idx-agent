// Week 4 — tests for the conversation layer (mergeMessage)
//
// parse each message -> fold filters into the session -> confirm they accumulate across turns

// Run:  npm run test-property-conversation

import { mergeMessage, nextQuestion } from "./conversation";
import { getSession, updateSession } from "./session";


function testMergeMessage() {
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
  return failed;
}

function testNextQuestion() {
  let failed = 0;
  const nq1 = nextQuestion(getSession("nq1"));
  updateSession("u2", { city: "Palo Alto" });
  const nq2 = nextQuestion(getSession("u2"));
  updateSession("u3", { city: "Palo Alto", maxPrice: 2000000 });
  const nq3 = nextQuestion(getSession("u3"));
  updateSession("u4", { city: "Palo Alto", maxPrice: 2000000, property: "Single Family Residence" });
  const nq4 = nextQuestion(getSession("u4"));
  
  if (nq1?.includes("city")) console.log(`PASS  next question: city`)
  else {
    failed++;
    console.error(`FAIL  next question: ${nq1}, expected question: city`)
  }
  if (nq2?.includes("budget")) console.log(`PASS  next question: budget`)
  else {
    failed++;
    console.error(`FAIL  next question: ${nq2}, expected question: budget`)
  }
  if (nq3?.includes("condo")) console.log(`PASS  next question: property`)
  else {
    failed++;
    console.error(`FAIL  next question: ${nq3}, expected question: property`)
  }
  if (nq4 === null) console.log(`PASS  no next question`)
  else {
    failed++;
    console.error(`FAIL  next question: ${nq4}, expected null`)
  }

  return failed;
}

function main() {
  let failed = 0;
  failed += testMergeMessage();
  console.log("\n");
  failed += testNextQuestion();
  if (failed) {
    console.error(`${failed} failed`);
    process.exit(1)
  }
}

main();






