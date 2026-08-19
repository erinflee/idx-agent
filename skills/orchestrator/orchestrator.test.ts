// pin classifyIntent()'s routing — pure function, no DB / server / LLM needed
//
// covers: one answer-key query per intent, the mixed-intent case (Week 9
// deliverable), unknown fallback, and two ladder-order pins (recommend beats
// search, knowledge beats market) so a reorder fails loudly instead of
// silently misrouting. Also pins one known-wrong case ("per sqft" collides
// with the search word "sqft") so a behavior change is noticed.
//
// run:  npm run test-orchestrator
