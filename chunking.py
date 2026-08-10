"""Week 8 — chunking for the RAG index, document text in -> list of chunks out

Structural first (split markdown on ## headers), fixed-size sliding window as
fallback. Pure functions, no I/O — build_rag_index.py calls these.
CAP: all-MiniLM truncates at 256 word-pieces, so oversized sections must be
re-chunked or they embed silently incomplete.
"""

def chunk_text(text, chunk_size=600, overlap=100):
  chunks = []
  start = 0

  if overlap >= chunk_size:
    raise ValueError("overlap must be smaller than chunk size")
  
  while start < len(text):
    end = min(start + chunk_size, len(text)) 
    chunk = text[start:end]
    chunks.append(chunk)
    start += chunk_size - overlap
    
  return chunks


  