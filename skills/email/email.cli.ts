// Week 11 — CLI demo of the email agent: draft -> preview -> approve -> send
//
// Builds a draft (weekly market report or listing alert), prints the preview,
// then waits for a human to type "approve <id>" before anything goes to the
// wire. Any other input discards the draft — nothing sends without approval.
// --dry-run swaps Gmail for nodemailer's jsonTransport so the full flow can be
// rehearsed with no credentials (same stand-in email.test.ts uses).
//
// Run:   npx tsx skills/email/email.cli.ts report "Irvine" "Tustin" [--dry-run]
//        npx tsx skills/email/email.cli.ts alert "3 bed under 900k in Irvine" [--dry-run]
//       (report needs the FastAPI service: uvicorn service:app --reload;
//        alert needs MySQL; real send needs EMAIL_USER / EMAIL_PASSWORD in .env)

import nodemailer from "nodemailer";
import * as readline from "readline/promises";
import { getDraft, approveDraft, formatDraftPreview } from "./draft";
import { sendApprovedEmail, makeTransport } from "./send";
import { closePool } from "../shared/db";
import { buildListingAlert, buildWeeklyReport } from "./report";
import type { EmailDraft } from "./types";


async function main() {
  const mode = process.argv[2];
  const args = process.argv.slice(3).filter((a) => a !== "--dry-run");
  const dryRun = process.argv.includes("--dry-run");
  const to = process.env.EMAIL_USER ?? "demo@gmail.com";
  const transport = dryRun ? nodemailer.createTransport({ jsonTransport: true }) : makeTransport();

  let draft: EmailDraft;
  if (mode === "report") {
    draft = await buildWeeklyReport(to, args);
  }

  else if (mode === "alert") {
    draft = await buildListingAlert(to, args.join(" "));
  }

  else if (mode === "send") {
    const d = getDraft(args[0]);
    if (!d) {
      console.error(`no draft with id ${args[0]}`);
      process.exit(1);
    }
    approveDraft(d.id);
    await sendApprovedEmail(d, transport);
    await closePool();
    return;
  }
  
  else {
    console.error(
      `Usage:\n` +
      `  npx tsx skills/email/email.cli.ts report "<city>" ["<city>" ...] [--dry-run]\n` +
      `  npx tsx skills/email/email.cli.ts alert "<search query>" [--dry-run]`
    );
    process.exit(1);
  }

  console.log(formatDraftPreview(draft));
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});

  try {
    const answer = await rl.question("> ");
    if (answer.trim() === `approve ${draft.id}`) {
      approveDraft(draft.id);
      await sendApprovedEmail(draft, transport);
    }
    else {
      console.log(`Draft ${draft.id} - not sent`)
    }
  } 
  finally {
    rl.close();
    await closePool();
  }
}


main().catch((err) => {
  console.log(err);
  process.exit(1);
})