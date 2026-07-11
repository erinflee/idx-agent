// Scores the TS parser against the labeled answer key, so parser quality is a
// measured number. Re-run after each parser change to track it.
//
// Grades filter EXTRACTION using the same SUBSET-match rule as the Python grader
// (evals/grader.py score_case), so the TS and Python numbers agree. must_error
// cases are skipped — rejecting bad input is the validator's job, not the parser's.
//
// Run:  npx tsx evals/score_parser.ts

import { parsePropertyQuery } from "../skills/propertySearch/parse";
import * as fs from "fs";
import * as path from "path";

// default to answers.jsonl; pass a path to score a different set, e.g. heldout.jsonl
const file = process.argv[2] ?? path.join(import.meta.dirname, "answers.jsonl");
const answers = fs
  .readFileSync(file, "utf-8")
  .split("\n")
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => JSON.parse(l));

let evaluated = 0;
let passed = 0;
const fails: { id: string; query: string; missed: string[] }[] = [];

for (const a of answers) {
  if (a.expect?.must_error) continue; // validator rejects bad input, not the parser
  const expected = a.filters ?? {};
  if (Object.keys(expected).length === 0) continue; // no filters to extract
  evaluated++;

  const actual: any = parsePropertyQuery(a.query);
  const missed: string[] = [];
  for (const [k, v] of Object.entries(expected)) {
    if (actual[k] !== v) missed.push(`${k}: want ${JSON.stringify(v)} got ${JSON.stringify(actual[k])}`);
  }
  if (missed.length === 0) passed++;
  else fails.push({ id: a.id, query: a.query, missed });
}

const pct = ((100 * passed) / evaluated).toFixed(1);
console.log(`\nparser filter-extraction: ${passed}/${evaluated} = ${pct}%   (${fails.length} failing)\n`);
for (const f of fails) console.log(`  FAIL ${f.id}  "${f.query}"\n       ${f.missed.join("  |  ")}`);
