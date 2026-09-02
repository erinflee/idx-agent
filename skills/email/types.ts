// Week 11 — email agent types
//
// EmailDraft models the draft-then-approve workflow: every email is born
// "pending_approval" and only an explicit human step ("approve <id>") moves
// it to "approved" — sendApprovedEmail() refuses anything else, so no email
// is ever sent autonomously. "sent" is terminal, set only after a real send.

export type DraftStatus = "pending_approval" | "approved" | "sent";

export interface EmailDraft {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: DraftStatus;
  createdAt: Date;
}