"""Week 8 — retrieval + grounded answers over the doc index

query -> top-k chunks by cosine -> Gemini answers from them, with sources.
Thin TS skill calls this over HTTP (same pattern as semantic.py).
"""