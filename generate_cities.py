"""Generate the city gazetteer from the DB — the single source of truth.

One-off utility. READ-ONLY: a single `SELECT DISTINCT L_City`, no writes.
Run:  python3 generate_cities.py

Writes two files from the same query so they never drift:
  - skills/propertySearch/cities.json — the Week 2 parser gazetteer (sorted LONGEST-first so
    the parser prefers multi-word cities like "Long Beach" over substrings)
  - evals/ca_cities.txt  — the SchemaValidator's known-city list (sorted
    alphabetically, one per line, for readability)
"""

import json
from pathlib import Path

from sqlalchemy import text

from db import engine

OUT = Path(__file__).parent / "skills" / "propertySearch" / "cities.json"
CITIES_TXT = Path(__file__).parent / "evals" / "ca_cities.txt"

with engine.connect() as conn:
    rows = (
        conn.execute(
            text(
                "SELECT DISTINCT L_City FROM rets_property "
                "WHERE L_City IS NOT NULL AND TRIM(L_City) <> ''"
            )
        )
        .scalars()
        .all()
    )

# Trim, drop blanks, and dedupe case-insensitively (keep first-seen casing).
seen: dict[str, str] = {}
for raw in rows:
    name = raw.strip()
    if name and name.lower() not in seen:
        seen[name.lower()] = name

# Longest-first: multi-word / longer names take priority during matching.
cities = sorted(seen.values(), key=lambda s: (-len(s), s.lower()))

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(cities, ensure_ascii=False, indent=0))
print(f"Wrote {len(cities)} cities to {OUT}")

# Same cities for the eval validator — alphabetical, one per line.
header = (
    "# Valid California city names for SchemaValidator.\n"
    "# GENERATED from the DB (SELECT DISTINCT L_City FROM rets_property) — the same\n"
    "# source as skills/propertySearch/cities.json. Regenerate both via: python3 generate_cities.py\n"
    "# Blank lines and '#' lines are ignored.\n"
)
CITIES_TXT.parent.mkdir(parents=True, exist_ok=True)
CITIES_TXT.write_text(header + "\n".join(sorted(cities, key=str.lower)) + "\n")
print(f"Wrote {len(cities)} cities to {CITIES_TXT}")
