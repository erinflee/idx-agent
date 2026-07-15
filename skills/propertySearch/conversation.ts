// Week 4 — conversation layer: merge each message into the session, drive follow-ups
//
// parse a message -> fold new filters into the session -> decide ask vs. search

import { parsePropertyQuery } from "./parse";
import { searchActiveListings } from "./search";
import { formatResults } from "./format";
import { getSession, updateSession, type UserSession, clearSession } from "./session";

export function mergeMessage(userId: string, query: string): void {
  const filtered = parsePropertyQuery(query);
  updateSession(userId, filtered);
}

const QUESTIONS: { key: keyof UserSession, question: string }[] = [
  {key: "city", question: "Which city?"},
  {key: "maxPrice", question: "What is your budget?"},
  {key: "property", question: "Any preferences –– condo, townhouse, or single family?"}
];

export function nextQuestion(session: UserSession): string | null {
  for (const entry of QUESTIONS) {
    if (session[entry.key] === undefined) return entry.question;
  }
  return null
}


export async function handleTurn(userId: string, message: string): Promise<string> {
  if (message.toLowerCase().includes("restart") || message.toLowerCase().includes("start over") || message.toLowerCase().includes("new search")) {
    clearSession(userId);
    return nextQuestion(getSession(userId)) ?? "Which city?";
  }

  mergeMessage(userId, message);
  const session = getSession(userId)
  const nq = nextQuestion(session);
  if (nq !== null) return nq;

  const rows = await searchActiveListings(session);
  updateSession(userId, { lastResults: rows });
  return formatResults(rows);
}

