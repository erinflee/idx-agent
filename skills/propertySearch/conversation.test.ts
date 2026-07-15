// Week 4 — tests for the conversation layer (mergeMessage)
//
// parse each message -> fold filters into the session -> confirm they accumulate across turns

// Run:  npm run test-property-conversation

import { mergeMessage, nextQuestion, handleTurn } from "./conversation";
import { getSession, updateSession } from "./session";
import { closePool } from "../shared/db";

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
  updateSession("nq2", { city: "Palo Alto" });
  const nq2 = nextQuestion(getSession("nq2"));
  updateSession("nq3", { city: "Palo Alto", maxPrice: 2000000 });
  const nq3 = nextQuestion(getSession("nq3"));
  updateSession("nq4", { city: "Palo Alto", maxPrice: 2000000, property: "Single Family Residence" });
  const nq4 = nextQuestion(getSession("nq4"));
  
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

async function testHandleTurn() {
  let failed = 0
  const ht1 = await handleTurn("ht1", "find something");
  const ht2 = await handleTurn("ht2", "find something in berkeley");
  const ht3 = await handleTurn("ht3", "find something in berkeley under 1 mil");
  const ht4 = await handleTurn("ht4", "find a condo in berkeley under 1 mil");

  if (ht1?.includes("city")) console.log(`PASS  next question: city`); 
  else {
    failed++;
    console.error(`FAIL  got ${ht1}, expected: city question`)
  }
  if (ht2?.includes("budget")) console.log(`PASS  next question: budget`); 
  else {
    failed++;
    console.error(`FAIL  got ${ht2}, expected: budget question`)
  }
  if (ht3?.includes("condo")) console.log(`PASS  next question: property`); 
  else {
    failed++;
    console.error(`FAIL  got ${ht3}, expected: property question`)
  }
  if (getSession("ht4").lastResults?.length) console.log(`PASS  successful search`); 
  else {
    failed++;
    console.error(`FAIL  search came back empty`)
  }
  return failed
}

async function testReset() {
  let failed = 0;
  const tr1 = await handleTurn("tr1", "i want to live in malibu");
  if (getSession("tr1").city === "Malibu") console.log(`PASS  city set`);
  else {
    failed++;
    console.error(`FAIL  expected city "Malibu" after turn 1, got ${getSession("tr1").city}`);
  }

  const tr2 = await handleTurn("tr1", "actuall, start over");
  if (getSession("tr1").city === undefined) console.log(`PASS  city wiped`);
  else {
    failed++;
    console.error(`FAIL  expected city undefined after reset, got ${getSession("tr1").city}`);
  }

  if (tr2 === "Which city?") console.log(`PASS  reply restarted`);
  else {
    failed++;
    console.error(`FAIL  expected "Which city?" reply after reset, got ${tr2}`);
  }

  return failed;
}

async function testEmptyTurn() {
  let failed = 0;
  const tet1 = await handleTurn("tet1", "asdf");
  if (nextQuestion(getSession("tet1")) === "Which city?") console.log(`PASS  correct expected question`);
  else {
    failed++;
    console.error(`FAIL  incorrect expected next question`);
  }

  if (getSession("tet1").lastResults === undefined) console.log(`PASS  expected last results good`);
  else {
    failed++;
    console.error(`FAIL  incorrect last results`);
  }
  return failed;
}

async function main() {
  let failed = 0;
  failed += testMergeMessage();
  console.log("\n");
  failed += testNextQuestion();
  console.log("\n");
  failed += await testHandleTurn();
  console.log("\n");
  failed += await testReset();
  console.log("\n");
  failed += await testEmptyTurn();
  await closePool();

  if (failed) {
    console.error(`${failed} failed`);
    process.exit(1)
  }
}

main();






