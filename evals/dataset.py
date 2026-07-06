"""Loader for the labeled query dataset (the "answer key")

Turns each line of cases.jsonl into an EvalCase object the harness can grade against
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

CASES_FILE = Path(__file__).with_name("cases.jsonl")