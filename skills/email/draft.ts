// Week 11 — draft side of the email agent: create, preview, approve
//
// Deliberately imports no transporter — nothing in this file CAN send.
// Drafts live in an in-memory Map (same pattern as propertySearch/session.ts),
// so approve/send must happen in the same process; fine for the CLI demo.

import * as fs from "fs";
import * as path from "path";
import { EmailDraft } from "./types"

const DRAFT_FILES = path.join(import.meta.dirname, ".drafts.json");
const drafts = new Map(Object.entries(loadDrafts())); // keys: string, values: interface


function loadDrafts(): Record<string, EmailDraft> {
  if (!fs.existsSync(DRAFT_FILES)) return {};
  const text = fs.readFileSync(DRAFT_FILES, "utf8");
  return JSON.parse(text);
}


export function getDraft(id: string): EmailDraft | undefined {
  return drafts.get(id)
}


export function draftEmail(to: string, subject: string, body: string) {
  const draft: EmailDraft = {
    id: Date.now().toString(),
    to,
    subject,
    body,
    status: "pending_approval",
    createdAt: new Date(),
  };
  drafts.set(draft.id, draft);
  saveDrafts(Object.fromEntries(drafts));
  return draft
}


export function formatDraftPreview(draft: EmailDraft): string {
  return `[DRAFT - not sent]
To: ${draft.to}
Subject: ${draft.subject}
  
${draft.body}
  
Reply "approve ${draft.id}" to send`;
}


export function approveDraft(id: string) {
  const d = drafts.get(id);
  if (!d) throw new Error("draft doesn't exist");
  d.status = "approved";
  saveDrafts(Object.fromEntries(drafts));
  return d;
}


export function saveDrafts(all: Record<string, EmailDraft>) {
  fs.writeFileSync(DRAFT_FILES, JSON.stringify(all, null, 2));
}