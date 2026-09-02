// Week 11 — draft side of the email agent: create, preview, approve
//
// Deliberately imports no transporter — nothing in this file CAN send.
// Drafts live in an in-memory Map (same pattern as propertySearch/session.ts),
// so approve/send must happen in the same process; fine for the CLI demo.

import { EmailDraft } from "./types"
const drafts = new Map<string, EmailDraft>(); // keys: string, values: interface


export function getDraft(id: string): EmailDraft | undefined {
  return drafts.get(id)
}



