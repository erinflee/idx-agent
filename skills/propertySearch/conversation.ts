// Week 4 — conversation layer: merge each message into the session, drive follow-ups
//
// parse a message -> fold new filters into the session -> decide ask vs. search

import { parsePropertyQuery } from "./parse";
import { getSession, updateSession, type UserSession } from "./session";

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
  mergeMessage(userId, message);
  const nq = nextQuestion(getSession(userId));
  if (nq !== null) return nq;
  return "PLACEHOLDER"
}