---
name: property-conversation
description: Multi-turn property search for WhatsApp — remembers city, budget, and property type across messages, asks follow-up questions when filters are missing, and returns MLS listings once enough is known. Use for ANY property search on WhatsApp (including partial asks like "find homes", "under 1M", or "show more").
user-invocable: true
metadata:
  { "openclaw": { "emoji": "💬" } }
---

# Property Conversation (multi-turn search)

Use this skill for **WhatsApp property search**. It keeps per-user session
memory across messages — the agent asks follow-ups ("Which city?", "What is
your budget?", "Condo or single family?") and runs the search once it has
enough filters.

Prefer this over **property-search** on WhatsApp. Reserve **property-search**
for one-shot queries where the user already gave every filter in a single
message and you are not in an ongoing search thread.

## How to run

Pass the **sender's stable user id** (WhatsApp phone number or channel user
id) as the first argument, then the user's message verbatim as the second:

```
/Users/erinlee/Desktop/nlp-internship/bin/property-conversation "<user id>" "<user message>"
```

Examples:

```
.../bin/property-conversation "+15551234567" "find homes in Irvine"
.../bin/property-conversation "+15551234567" "under 1.2M"
.../bin/property-conversation "+15551234567" "single family with 3 beds"
.../bin/property-conversation "+15551234567" "show more"
.../bin/property-conversation "+15551234567" "start over"
```

- **Always reuse the same user id** for the same WhatsApp sender — session
  state is keyed on it.
- Pass the user's message as ONE quoted string (second argument).
- The command prints the agent reply to stdout: a follow-up question, formatted
  property cards, or "No more available listings for your search!".

## Returning results

- Relay stdout to the user as-is.
- If stdout is a question, send only that question — do not run a separate
  property-search command in the same turn.
- If stdout contains property cards, relay them unchanged.
- Saying "start over", "restart", or "new search" clears the user's session
  and begins a fresh search.
- "show more" / "next" paginates the last search when results exist.
- Never invent listings — report only what the command prints.

## Notes

- Read-only search over active `rets_property` listings.
- Session files live in `~/.openclaw/property-sessions/` so state survives
  between shell invocations.
