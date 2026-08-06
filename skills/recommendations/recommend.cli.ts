// CLI demo of the hybrid-recommendations skill (Week 7)
//
// Pass a listing id as an argument -> prints the top 5 similar listings, each
// stamped with a comp check against recent california_sold sales
// Data comes from the Python FastAPI service via recommendAgent
//
// Run:   npm run demo-recommend -- "1118422731"
//       (needs the FastAPI server running: uvicorn service:app --reload)
