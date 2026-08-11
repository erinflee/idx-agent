// feed sample answers to the formatter — the RAG answer is already prose, so
// this only checks the edge guards
//
// the branches worth covering: whitespace gets trimmed, an empty answer falls
// back to a fixed message, and a normal answer passes through untouched
//
// run:  npm run test-rag-format
//       (no DB / server needed)
