// Week 6 — integration test for semanticSearchAgent (thin TS wrapper -> Python semantic service)
//
// free-text query in -> formatted listing cards out
//
// Run:  npm run test-semantic-search
//      (needs the FastAPI server running: uvicorn service:app --reload,
//       and the embeddings built: python scripts/build_embeddings.py)

import { SemanticHit } from "./semanticSearch";
import { formatSemanticHits } from "./format";
