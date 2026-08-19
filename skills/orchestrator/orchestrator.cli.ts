// CLI demo of the orchestrator (Week 9)
//
// Pass any free-text question as the argument -> classifyIntent() picks the
// skill(s) -> prints the routed reply. One entry point for search, market,
// recommend, knowledge, and mixed queries.
//
// Run:   npm run demo-orchestrator -- "find homes in oroville and are prices rising"
//       (market/knowledge/recommend arms need the FastAPI service running;
//        search hits MySQL directly)
