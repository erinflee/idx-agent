"""Loader for the labeled query dataset (the "answer key")

Turns each line of cases.jsonl into an EvalCase object the harness can grade against
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field, fields
from pathlib import Path
from .schema import INTENTS, PropertyFilters, SchemaValidator

CASES_FILE = Path(__file__).with_name("cases.jsonl")


@dataclass
class EvalCase:
    """One labeled example. Mirrors one JSON line in cases.jsonl.
    ...docstring...
    """

    id: str
    query: str
    intent: str
    filters: dict = field(default_factory=dict)
    expect: dict = field(default_factory=dict)
    note: str = ""

    @property
    def must_error(self) -> bool:
        return bool(self.expect.get("must_error", False))


def load_cases(path: Path = CASES_FILE) -> list[EvalCase]:
    """Read cases.jsonl into a list of EvalCase"""

    errors = []
    cases = []
    ids = set()
    known_keys = {f.name for f in fields(PropertyFilters)}
    validator = SchemaValidator()
    with open(path, 'r', encoding='utf-8') as file:
        for n, line in enumerate(file, start=1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                d = json.loads(line)
            except json.JSONDecodeError as e:
                errors.append(f"line {n}: invalid JSON ({e.msg})")
                continue
            if d["id"] in ids:
                errors.append(f"line {n} ({d.get('id')!r}): duplicate id")
                continue
            if d['intent'] not in INTENTS:
                errors.append(f"line {n} ({d['id']}): bad intent {d['intent']!r}")
                continue

            filters = d.get('filters', {})
            bad_keys = set(filters) - known_keys
            if bad_keys:
                errors.append(f"line {n} ({d['id']!r}): unknown filter keys {bad_keys}")
                continue

            # Semantic checks only for cases meant to be valid. must_error cases
            # (e.g. unknown city + negative price) are *supposed* to fail these.
            if not d.get('expect', {}).get('must_error'):
                for msg in validator.validate(filters):
                    errors.append(f"line {n} ({d['id']!r}): {msg}")

            ids.add(d["id"])
            cases.append(EvalCase(
                id=d['id'],
                query=d['query'], 
                intent=d['intent'],
                filters=d.get('filters', {}), 
                expect=d.get('expect', {}),
                note=d.get('note', ""),
            ))
    
    if errors:
        raise ValueError("\n".join(errors))
    return cases