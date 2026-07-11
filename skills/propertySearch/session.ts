// Week 4 — per-user session memory for the conversational property search
//
// Typed slots your code fills as the user talks -> checked to decide the next follow-up question

import type { ListingRow } from "./search"; 

interface UserSession {
  city?: string;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  property?: string;
  pool?: string;
  hasView?: string;
  maxHoa?: number;
  lastResults?: ListingRow[];
  conversationStep: number;
}

const sessions = new Map<string, UserSession>();

export function getSession(userId: string): UserSession {
  if (!sessions.has(userId)) { sessions.set(userId, { conversationStep: 0 }); }

  return sessions.get(userId)!;
}

export function updateSession(userId: string, updates: Partial<UserSession>) {
  const session = getSession(userId);
  return sessions.set(userId, { ...session, ...updates });
}