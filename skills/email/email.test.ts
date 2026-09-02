// prove the approval gate without touching Gmail
//
// the branches worth covering: a fresh draft is born pending_approval and
// nothing sends on creation; sendApprovedEmail throws on an unapproved draft;
// an approved draft goes through (jsonTransport stands in for Gmail — sendMail
// returns the message as JSON instead of hitting the network); approveDraft
// throws on an unknown id; the preview carries the "approve <id>" instruction
//
// run:  npm run test-email
//      (no DB / server / credentials needed)

import nodemailer from "nodemailer";
import { draftEmail, approveDraft, formatDraftPreview } from "./draft";
import { sendApprovedEmail } from "./send";


// errors if false
function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}


// passes only if function throws
async function assertThrows(func: () => Promise<void> | void, message: string) {
  try { await func() } 
  catch { return; }
  throw new Error(message);
}


async function main() {
  const d1 = draftEmail("efl@gmail.com", "this is test subject", "this is the email's body");
  assert(d1.status === "pending_approval", `email status should be "pending_approval", currently ${d1.status}`);

  const mock = nodemailer.createTransport({ jsonTransport: true });
  await assertThrows(() => sendApprovedEmail(d1, mock), "unapproved draft was sent");

  approveDraft(d1.id);
  await sendApprovedEmail(d1, mock);
  assert(d1.status === "sent", `email status should be "sent", currently ${d1.status}`);

  await assertThrows(() => { approveDraft("nope"); }, "bad id was approved");

  const d2 = draftEmail("efl@gmail.com", "hi", "this is a tester");
  assert(formatDraftPreview(d2).includes(`approve ${d2.id}`), `preview missing approve instructions`);
  
  console.log("email: all tests passed");
}


main().catch((err) => {
  console.error(err);
  process.exit(1);
});