// CLI entry for multi-turn property search (Week 4).
//
// OpenClaw / WhatsApp (one message per invocation):
//   bin/property-conversation "<userId>" "<message>"
//   npx tsx skills/propertySearch/conversation.cli.ts "<userId>" "<message>"
//   userId = stable sender id (e.g. WhatsApp phone). Same id across messages.
//
// Local demo (multi-turn in one process):
//   npm run demo-conversation
//   Type one message per line at ">"; quit/exit to leave. "start over" resets.


import { handleTurn } from "./conversation";
import { closePool } from "../shared/db";
import * as readline from "readline/promises";

async function main() {
  const userId = process.argv[2]?.trim();
  const message = process.argv.slice(3).join(" ").trim();

  if (userId && message) {
    console.log(await handleTurn(userId, message));
    await closePool();
    return;
  }

  if (userId) {
    console.error(
      'Usage: npx tsx skills/propertySearch/conversation.cli.ts "<userId>" "<message>"'
    );
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  while (true) {
    const line = await rl.question("> ");
    const query = line.trim();
    if (query === "quit" || query === "exit") break;
    console.log(await handleTurn("user1", query));
  }

  rl.close();
  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
