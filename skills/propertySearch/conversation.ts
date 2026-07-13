// Week 4 — conversation layer: merge each message into the session, drive follow-ups
//
// parse a message -> fold new filters into the session -> decide ask vs. search

import { parsePropertyQuery } from "./parse";
import { getSession, updateSession, type UserSession } from "./session";

export function mergeMessage(userId: string, query: string): void {
  const filtered = parsePropertyQuery(query);
  updateSession(userId, filtered);
}

const QUESTIONS: { slot: keyof UserSession, question: string }[] = [
  {slot: "city", question: "Which city?"},
  {slot: "maxPrice", question: "What is your budget?"},
  {slot: "property", question: "Any preferences –– condo, townhouse, or single family?"}
];

export function nextQuestion(session: UserSession): string | null {
  
  for (const entry of QUESTIONS) {
    if (session[entry.slot] === undefined) return entry.question;
  }

  return null
}