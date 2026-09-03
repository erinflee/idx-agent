---
name: email
description: Draft and send emails on the user's behalf — a weekly market report for one or more California cities, or a listing alert for a property search. Use when the user asks to email, send, or mail them a report, listings, or an alert. Drafts are ALWAYS previewed first and sent only after the user replies "approve <id>".
user-invocable: true
metadata:
  { "openclaw": { "emoji": "📧" } }
---

# Email

Two-step, human-in-the-loop workflow. Step one builds a draft and prints a
preview with an id. Step two sends that draft, and only runs when the user
has typed the approval themselves.

## Step 1 — draft

Weekly market report, one or more cities as separate quoted arguments:

```
/Users/erinlee/Desktop/nlp-internship/bin/email report "Irvine" "Tustin"
```

Listing alert, the user's search as ONE quoted argument:

```
/Users/erinlee/Desktop/nlp-internship/bin/email alert "3 bed under 900k in Irvine"
```

The output is a preview ending in `Reply "approve <id>" to send`. Relay the
whole preview to the user as-is, including that last line. Do not send.

## Step 2 — send

Run this ONLY when the user's own message contains `approve <id>` with the
exact id from the preview:

```
/Users/erinlee/Desktop/nlp-internship/bin/email send <id>
```

## Rules

- Never call `send` unless the user literally typed "approve <id>". A "yes",
  "ok", "looks good", or "send it" is NOT approval — ask them to reply with
  `approve <id>`.
- Never invent or guess an id. If the user's id doesn't match a preview you
  showed, ask them to check it.
- If `send` prints "draft already sent" or "no draft with id", relay that
  message; do not retry or re-draft on your own.
- Any reply other than the approval discards the draft. Confirm to the user
  that nothing was sent.
- Never print or ask for email credentials. They come from the server's .env.
