"""Loader for the labeled query dataset (the "answer key")

Turns each line of cases.jsonl into an EvalCase object the harness can grade against
"""

import json
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

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

    cases = []
    with open(path, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            d = json.loads(line)
            cases.append(EvalCase(
                id=d['id'], query=d['query'], intent=d['intent'],
                filters=d.get('filters', {}), expect=d.get('expect', {}),
                note=d.get('note', ""),
            ))
    return cases