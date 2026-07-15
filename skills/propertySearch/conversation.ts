// Week 4 — conversation layer: merge each message into the session, drive follow-ups
//
// parse a message -> fold new filters into the session -> decide ask vs. search


import { parsePropertyQuery, type PropertyFilter } from "./parse";
import { searchActiveListings } from "./search";
import { formatResults } from "./format";
import { getSession, updateSession, type UserSession, clearSession } from "./session";




// ---- config / setup ----

// follow-ups -> asked in order for the first empty field
const QUESTIONS: { key: keyof UserSession, question: string }[] = [
  {key: "city", question: "Which city?"},
  {key: "maxPrice", question: "What is your budget?"},
  {key: "property", question: "Any preferences –– condo, townhouse, or single family?"}
];

// word to prepend to a bare answer ("500k" -> "under 500k")
// partial: unmapped fields get no rescue
const CONTEXT: Partial<Record<keyof PropertyFilter, string>> = {
  maxPrice: "under ",
};




// ---- helpers ----

// add parsed fields into the session
export function mergeMessage(userId: string, query: string): void {
  const filtered = parsePropertyQuery(query);
  updateSession(userId, filtered);
}

// first empty field, or null when all filled
export function nextQuestion(session: UserSession): { key: keyof UserSession, question: string } | null {
  for (const entry of QUESTIONS) {
    if (session[entry.key] === undefined) return entry;
  }
  return null
}

// retry the awaited field alone, using its context word as a hint
function fillAwaitedField(userId: string, message: string) {
  const nq = nextQuestion(getSession(userId));
  if (nq === null) return;

  const word = CONTEXT[nq.key as keyof PropertyFilter];
  if (word === undefined) return;

  const reparsed = parsePropertyQuery(word + message);
  const value = reparsed[nq.key as keyof PropertyFilter];
  if (value !== undefined) updateSession(userId, { [nq.key]: value });
}




// ---- entry point ----

// one turn: parse -> rescue -> ask next question, else search
export async function handleTurn(userId: string, message: string): Promise<string> {
  const m = message.toLowerCase();
  if (m.includes("restart") || m.includes("start over") || m.includes("new search")) {
    clearSession(userId);
    return nextQuestion(getSession(userId))!.question;
  }

  mergeMessage(userId, message);
  fillAwaitedField(userId, message);
  const session = getSession(userId)
  const nq = nextQuestion(session);
  if (nq !== null) return nq.question;

  const rows = await searchActiveListings(session);
  updateSession(userId, { lastResults: rows });
  return formatResults(rows);
}
