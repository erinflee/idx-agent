// Week 11 — email content builders: compose existing skills into drafts
//
// buildWeeklyReport pulls per-city market stats (california_sold, via the
// FastAPI service) and buildListingAlert reuses the property search pipeline
// (rets_property, already capped at 50 rows). Both return a pending_approval
// draft via draftEmail() — report content never touches the transporter.
