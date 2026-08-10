"""Week 8 — one-time build: source docs in -> chunks + vectors out

Reads the Primer + Trestle PDFs and the markdown in docs/, chunks each, embeds
with the same local model as Week 6, and writes chunks.jsonl + doc_embeddings.npy
(aligned by row). rag.py loads both at query time.

Two loaders, one return type: PDFs via pypdf, markdown via read_text().

Run:  python -m scripts.build_rag_index   (no DB; reads off disk)
      -m, not a path -> otherwise the repo root isn't on sys.path.
"""

from pathlib import Path
from pypdf import PdfReader
import re

ROOT = Path(__file__).parent.parent

SOURCES = [
  (ROOT / "rag_docs" / "Real_Estate_Primer.pdf", "Real Estate Data Analyst Primer"),
  (ROOT / "rag_docs" / "Trestle Property MetaData.pdf", "Trestle Property Metadata"),
  (ROOT / "rag_docs" / "market_summaries.md", "Market Summaries Data"),
  (ROOT / "rag_docs" / "schema_reference.md", "MLS Schema Reference")
]

def load_pdf(path):
  reader = PdfReader(path)
  full_text = []

  for page in reader.pages:
    pattern = r"\d+/\d+/\d+,\s+\d+:\d+\s+[AP]MProperty\s+Page\s+\d+\s+of\s+\d+https://api-trestle.corelogic.com/trestle/Documentation/MetaData/Resource/Property"
    text = page.extract_text() or ""
    text = re.sub(pattern, " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    full_text.append(text)

  return "\n".join(full_text)


def load_markdown(path):
  text = path.read_text(encoding="utf-8")
  return text


def main():
  LOADERS = {".pdf": load_pdf, ".md": load_markdown}

  for path, title in SOURCES:
    suffix = path.suffix
    loader = LOADERS[suffix]
    document = loader(path)
    print(title, len(document))
    print(document[:300])


if __name__ == "__main__":
  main()