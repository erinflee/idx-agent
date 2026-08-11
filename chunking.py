"""Week 8 — chunking for the RAG index, document text in -> list of chunks out

Structural first (split markdown on ## headers), fixed-size sliding window as
fallback. Pure functions, no I/O — build_rag_index.py calls these.
CAP: all-MiniLM truncates at 256 word-pieces, so oversized sections must be
re-chunked or they embed silently incomplete.
"""

import re


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


def split_sections(text):
  sections = re.split(r"(?=^## )", text, flags=re.MULTILINE)
  return [s for s in sections if s.strip()]


def chunk_section(section, max_words=200):
  if len(section.split()) <= max_words:
    return [section]
  
  if "\n" not in section:
    return chunk_text(section)
  
  header, _, body = section.partition("\n") # splits -> before, separator '\n', after
  chunks = chunk_group_lines(body.split("\n"), max_words)

  if header.startswith("## "):
    chunks = [header + "\n" + c for c in chunks]

  return chunks

  
def chunk_group_lines(lines, max_words):
  chunks = []
  bucket = []
  count = 0

  for line in lines:
    words = len(line.split())
    if words > max_words:
      if bucket:
        chunks.append("\n".join(bucket))
        bucket = []
        count = 0
      chunks.extend(chunk_text(line))
      continue
    
    if count + words > max_words:
      chunks.append("\n".join(bucket))
      bucket = []
      count = 0

    bucket.append(line)
    count += words

  if bucket:
    chunks.append("\n".join(bucket))
  return chunks  


def split_trestle_entries(text):
  pattern = r"(?=\b[A-Z]\w+\s[A-Z]\w+\sEnum\b)|(?=\b[A-Z]\w+\s(?:String|Boolean|Decimal|Int32|Int64|DateTime)\b)"
  entries = re.split(pattern, text)
  return [e.strip() for e in entries if e.strip()]