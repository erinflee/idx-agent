// CLI demo of the RAG knowledge skill (Week 8)
//
// Pass a real-estate question as the argument -> prints a grounded answer with
// its source; off-corpus questions get a fixed "not covered" reply
// Data comes from the Python FastAPI service via ragAgent
//
// Run:   npm run demo-rag -- "What does DOM mean?"
//       (needs the FastAPI server running: uvicorn service:app --reload)

import { ragAgent } from "./rag"
  
async function main() {
  const query = process.argv[2];
  if (!query || typeof query !== "string") {
    console.error("Query must be string");
    process.exit(1);
  }

  const response = await ragAgent(query);
  console.log(response);
}




