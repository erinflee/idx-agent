// CLI demo of the semantic-search skill (Week 6)
//
// Pass a free-text description as an argument -> prints the top 5 similar listings
// Data comes from the Python FastAPI service via semanticSearchAgent
//
// Run:   npx tsx skills/semanticSearch/semanticSearch.cli.ts "charming craftsman with mountain views"
//       (needs the FastAPI server running: uvicorn service:app --reload)


import { semanticSearchAgent } from "./semanticSearch";


