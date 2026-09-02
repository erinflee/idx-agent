// Week 11 — send side of the email agent: the approval gate
//
// sendApprovedEmail() is the ONLY path to the wire, and it throws unless the
// draft's status is "approved" (set by a human via approveDraft, never here).
// Credentials come from EMAIL_USER / EMAIL_PASSWORD in .env and are never
// logged; the optional transport param lets tests inject jsonTransport
// instead of real Gmail.
