// Week 9 — orchestrator: one entry point routing queries across the five skills
//
// free-text query in -> classifyIntent() -> route to skill(s) -> formatted reply
// mixed intent fans out to two skills in parallel and merges their replies
//
// composes the existing agents (propertySearch, marketComps, semanticSearch,
// recommendations, rag) — adds routing only, no new capability
