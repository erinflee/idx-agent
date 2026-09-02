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
