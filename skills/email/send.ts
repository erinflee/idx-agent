// Week 11 — send side of the email agent: the approval gate
//
// sendApprovedEmail() is the ONLY path to the wire, and it throws unless the
// draft's status is "approved" (set by a human via approveDraft, never here).
// Credentials come from EMAIL_USER / EMAIL_PASSWORD in .env and are never
// logged; the optional transport param lets tests inject jsonTransport
// instead of real Gmail.

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


