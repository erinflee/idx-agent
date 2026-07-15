// CLI entry so OpenClaw can invoke the property-search skill by shelling out.
//
// Usage:  npx tsx skills/propertySearch/searchcli.ts "3 bed condos in Irvine under 1.2m"
// Prints the formatted property cards to stdout (what the agent relays to WhatsApp).

import { propertySearchSkill } from "./index";
import { closePool } from "../shared/db";

async function main() {
  const query = process.argv.slice(2).join(" ").trim(); // everything after the script name = the query
  if (!query) {
    console.error('type in terminal: npm tsx skills/propertySearch/search.cli.ts "<natural language property query>"');
    process.exit(1);
  }

  const cards = await propertySearchSkill(query);
  console.log(cards);
  await closePool(); // short-lived script → close so it exits (see db.ts)
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
