// Week 4 — per-user session memory for the conversational property search
//
// Typed slots your code fills as the user talks -> checked to decide the next follow-up question

import * as fs from "fs";
import type { ListingRow } from "./search"; 

export interface UserSession {
  city?: string;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  property?: string;
  pool?: string;
  hasView?: string;
  maxHoa?: number;
  page?: number;
  lastResults?: ListingRow[];
  conversationStep: number;
}

const SESSION_DIR = `${process.env.HOME}/.openclaw/property-sessions`;

function sessionFile(userId: string): string {
  return `${SESSION_DIR}/${userId}.json`;
}

export function getSession(userId: string): UserSession {
  try {
    return JSON.parse(fs.readFileSync(sessionFile(userId), "utf8"));
  } catch {
    return { conversationStep: 0 };
  }
}

export function updateSession(userId: string, updates: Partial<UserSession>): void {
  const session = { ...getSession(userId), ...updates };
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  fs.writeFileSync(sessionFile(userId), JSON.stringify(session));
}

export function clearSession(userId: string): void {
  fs.rmSync(sessionFile(userId), { force: true });
}
