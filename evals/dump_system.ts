// Runs the REAL pipeline (router -> parser -> search) over an answer key and
// records what it produced, one JSON line per case, so the Python grader can
// score end-to-end task success (evals/grader.py via evals/replay_system.py).
//
// Output shape per line: { id, query, intent, filters, errored, results }
//   results is a COUNT — the grader only checks how many rows came back.
//   errored is true only when the pipeline threw; schema validation happens
//   on the Python side so the existing SchemaValidator stays the gate.
//
// The search arm hits live MySQL (needs .env + the DB running; read-only).
//
// Run:  npm run dump-system                       -> evals/system_outputs.jsonl
//       npm run dump-system -- evals/heldout.jsonl evals/system_outputs_heldout.jsonl

import * as fs from "fs";
import * as path from "path";
import { classifyIntent } from "../skills/orchestrator/orchestrator";
import { parsePropertyQuery } from "../skills/propertySearch/parse";
import { searchActiveListings } from "../skills/propertySearch/search";
import { closePool } from "../skills/shared/db";

const casesFile = process.argv[2] ?? path.join(import.meta.dirname, "answers.jsonl");
const outFile = process.argv[3] ?? path.join(import.meta.dirname, "system_outputs.jsonl");

const cases = fs
  .readFileSync(casesFile, "utf-8")
  .split("\n")
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => JSON.parse(l));

async function runOne(query: string) {
  const intent = classifyIntent(query);
  let filters: Record<string, unknown> = {};
  let results = 0;
  let errored = false;

  if (intent === "search" || intent === "recommend") {
    filters = parsePropertyQuery(query);
  }

  if (intent === "search") {
    try {
      const rows = await searchActiveListings(filters);
      results = rows.length;
    } catch (err) {
      errored = true;
    }
  }

  return { intent, filters, errored, results };
}

async function main() {
  const lines: string[] = [];
  let errored = 0;

  for (const c of cases) {
    const out = await runOne(c.query);
    if (out.errored) errored++;
    lines.push(JSON.stringify({ id: c.id, query: c.query, ...out }));
  }

  fs.writeFileSync(outFile, lines.join("\n") + "\n");
  console.log(`wrote ${lines.length} outputs to ${outFile} (${errored} errored)`);
  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
