// Interactive CLI demo of the multi-turn conversation layer (Week 4).
//
// Type one message per line; the agent asks follow-ups (city -> budget -> type),
// remembers your answers across turns, and prints listings once it has enough.
// Type "quit" or "exit" (or Ctrl+D) to leave. Say "start over" to reset the search.
//
// Run:   npm run demo-conversation


import { handleTurn } from "./conversation";
import { closePool } from "../shared/db";
import * as readline from 'readline/promises';

async function main() {
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