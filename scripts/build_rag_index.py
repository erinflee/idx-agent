"""Week 8 — one-time build: source docs in -> chunks + vectors out

Reads the Primer + Trestle PDFs and the markdown in docs/, chunks each, embeds
with the same local model as Week 6, and writes chunks.jsonl + doc_embeddings.npy
(aligned by row). rag.py loads both at query time.

Two loaders, one return type: PDFs via pypdf, markdown via read_text().

Run:  python -m scripts.build_rag_index   (no DB; reads off disk)
      -m, not a path -> otherwise the repo root isn't on sys.path.
"""
