// Week 11 — send side of the email agent: the approval gate
//
// sendApprovedEmail() is the ONLY path to the wire, and it throws unless the
// draft's status is "approved" (set by a human via approveDraft, never here).
// Credentials come from EMAIL_USER / EMAIL_PASSWORD in .env and are never
// logged; the optional transport param lets tests inject jsonTransport
// instead of real Gmail.

import { markSent } from "./draft";
import nodemailer, { Transporter } from "nodemailer";
import type { EmailDraft } from "./types";


export function makeTransport(): Transporter {
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;
  if (!user || !password) throw new Error("EMAIL_USER and EMAIL_PASSWORD must be set")
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: user, pass: password },
  });
}


export async function sendApprovedEmail(draft: EmailDraft, transport?: Transporter): Promise<void> {
  if (draft.status !== "approved") throw new Error("email not approved for sending")
  const t = transport ?? makeTransport();
  await t.sendMail({ from: process.env.EMAIL_USER, to: draft.to, subject: draft.subject, text: draft.body }); 
  markSent(draft.id);
  console.log(`send draft ${draft.id}: ${draft.subject}`)
}

