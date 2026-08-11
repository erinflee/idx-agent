// feed sample answers to the formatter — the RAG answer is already prose, so
// this only checks the edge guards
//
// the branches worth covering: whitespace gets trimmed, an empty answer falls
// back to a fixed message, and a normal answer passes through untouched
//
// run:  npm run test-rag-format
//       (no DB / server needed)

import { formatRAG } from "./format"


function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}


function main() {
  const answer = "Days on Market (DOM) measures how long a property has been listed.\n\nSource: Real Estate Data Analyst Primer";

  // a normal answer passes through untouched
  assert(formatRAG(answer) === answer, "clean answer changed");

  // whitespace gets trimmed off the edges, not the middle
  assert(formatRAG("  " + answer + "\n\n") === answer, "edges not trimmed");
  assert(formatRAG("a  b").includes("a  b"), "interior whitespace changed");

  // empty and whitespace-only fall back to the fixed message
  assert(formatRAG("") === "No answer returned.", "empty: no fallback");
  assert(formatRAG("   \n  ") === "No answer returned.", "whitespace-only: no fallback");

  // the refusal string is a normal answer, not an error
  assert(formatRAG("That isn't covered in my source documents.") === "That isn't covered in my source documents.", "refusal string changed");

  console.log("PASS - formatRAG covers edge cases");
}


main();
