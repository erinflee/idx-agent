// Week 8 — light touch-up of RAG answers before the agent relays them
//
// the answer arrives as finished prose with its own Source line, so unlike the
// other skills there are no cards to build — this only guards the edges (empty
// answer, stray whitespace) and keeps the suite's formatter symmetry


export function formatRAG(answer: string): string {
  const trimmed = answer.trim()
  if (!trimmed) return "No answer returned.";
  return trimmed;
} 


