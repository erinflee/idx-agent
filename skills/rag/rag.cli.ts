// CLI demo of the RAG knowledge skill (Week 8)
//
// Pass a real-estate question as the argument -> prints a grounded answer with
// its source; off-corpus questions get a fixed "not covered" reply
// Data comes from the Python FastAPI service via ragAgent
//
// Run:   npm run demo-rag -- "What does DOM mean?"
//       (needs the FastAPI server running: uvicorn service:app --reload)
