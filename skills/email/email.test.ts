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
