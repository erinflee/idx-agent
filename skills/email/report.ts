// Week 11 — email content builders: compose existing skills into drafts
//
// buildWeeklyReport pulls per-city market stats (california_sold, via the
// FastAPI service) and buildListingAlert reuses the property search pipeline
// (rets_property, already capped at 50 rows). Both return a pending_approval
// draft via draftEmail() — report content never touches the transporter.

import { marketStatsAgent } from "../marketComps/marketStats";
import { propertySearchSkill } from "../propertySearch/index";
import { draftEmail } from "./draft";
import type { EmailDraft } from "./types";


export async function buildWeeklyReport(to: string, cities: string[]): Promise<EmailDraft> {
  const sections: string[] = [];
  for (const city of cities) {
    const stats = await marketStatsAgent(city);
    sections.push(`${city}: ${stats}`)
  }
  const body = sections.join("\n\n---\n\n");
  return draftEmail(to, "Weekly market report", body);
}
