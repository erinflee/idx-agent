// Week 4 — conversation layer: merge each message into the session, drive follow-ups
//
// parse a message -> fold new filters into the session -> decide ask vs. search


import { parsePropertyQuery, type PropertyFilter } from "./parse";
import { searchActiveListings } from "./search";
import { formatResults } from "./format";
import { getSession, updateSession, type UserSession, clearSession } from "./session";



// ---- config / setup ----

// asked in array order, for the first empty field
const QUESTIONS: { key: keyof UserSession, question: string }[] = [
  {key: "city", question: "Which city?"},
  {key: "maxPrice", question: "What is your budget?"},
  {key: "property", question: "Any preferences –– condo, townhouse, or single family?"}
];

// prepended to a bare answer ("500k" -> "under 500k")
// unmapped fields get no rescue
const ANSWER_PREFIX: Partial<Record<keyof PropertyFilter, string>> = {
  maxPrice: "under ",
  city: "in "
};

// says a corrected field back ("Got it — under $2,000,000.")
const DESCRIBE_FIELD: Partial<Record<keyof PropertyFilter, (value: any) => string>> = {
  city: (value) => `A place in ${String(value)}`,
  maxPrice: (value) => `under $${Number(value).toLocaleString()}`,
  property: (value) => String(value)
};



// ---- helpers ----

// merges parsed fields into the session; returns only what a later turn
// corrected (already set -> different value)
export function mergeMessage(userId: string, query: string): Partial<PropertyFilter> {
  const previousFilters = getSession(userId);
  const filters = parsePropertyQuery(query);

  // updateSession swaps in a new object rather than mutating, so
  // `previousFilters` stays a valid pre-merge snapshot
  const corrections: Partial<PropertyFilter> = {};
  for (const key of Object.keys(filters) as (keyof PropertyFilter)[]) {
    if (previousFilters[key] !== undefined && previousFilters[key] !== filters[key]) {
      corrections[key] = filters[key] as any;
    }
  }

  updateSession(userId, filters);
  return corrections;
}

// first empty field, or null when all filled
export function nextQuestion(session: UserSession): { key: keyof UserSession, question: string } | null {
  for (const followUp of QUESTIONS) {
    if (session[followUp.key] === undefined) return followUp;
  }
  return null
}

// retry the awaited field alone, using its prefix as a hint
function fillAwaitedField(userId: string, message: string) {
  const nq = nextQuestion(getSession(userId));
  if (nq === null) return;

  const prefix = ANSWER_PREFIX[nq.key as keyof PropertyFilter];
  if (prefix === undefined) return;

  const retryFilters = parsePropertyQuery(prefix + message);
  const value = retryFilters[nq.key as keyof PropertyFilter];
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

  const s = getSession(userId);
  if (/\b(more|next|show more|see more)\b/.test(m) && nextQuestion(s) === null) {
    const nextPage = (s.page ?? 1) + 1;
    const rows = await searchActiveListings(s, nextPage);
    if (rows.length === 0) return "No more available listings for your search!";   
    updateSession(userId, { page: nextPage, lastResults: rows });
    return formatResults(rows);
  }

  const corrections = mergeMessage(userId, message);
  fillAwaitedField(userId, message);
  const session = getSession(userId)

  // names every switch, or the user keeps answering for the filters they first typed
  const correctionPhrases = (Object.keys(corrections) as (keyof PropertyFilter)[])
    .map((key) => DESCRIBE_FIELD[key]?.(corrections[key]))
    .filter((phrase): phrase is string => phrase !== undefined);
  const acknowledgment = correctionPhrases.length > 0
    ? `Okok! ${correctionPhrases.join(", ")}. `
    : "";

  const nq = nextQuestion(session);
  if (nq !== null) return acknowledgment + nq.question;

  const rows = await searchActiveListings(session);
  updateSession(userId, { lastResults: rows });
  return acknowledgment + formatResults(rows);
}
