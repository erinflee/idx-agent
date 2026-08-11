// Week 8 — RAG knowledge assistant over the indexed real estate docs
//
// free-text question in -> grounded prose answer out, with a Source line ->
// agents can answer "what does DOM mean?" from the docs instead of guessing
//
// thin HTTP wrapper over rag.py 

import { formatRAG } from "./format";

const BASE = "http://127.0.0.1:8000";


