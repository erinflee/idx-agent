// Week 11 — draft side of the email agent: create, preview, approve
//
// Deliberately imports no transporter — nothing in this file CAN send.
// Drafts live in an in-memory Map (same pattern as propertySearch/session.ts),
// so approve/send must happen in the same process; fine for the CLI demo.
