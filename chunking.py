"""Week 8 — chunking for the RAG index, document text in -> list of chunks out

Structural first (split markdown on ## headers), fixed-size sliding window as
fallback. Pure functions, no I/O — build_rag_index.py calls these.
CAP: all-MiniLM truncates at 256 word-pieces, so oversized sections must be
re-chunked or they embed silently incomplete.
"""
