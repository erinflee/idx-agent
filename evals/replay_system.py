"""Replay the real pipeline's recorded outputs as a grader `SystemFn`

evals/dump_system.ts runs the TS router -> parser -> search over an answer key
and writes evals/system_outputs.jsonl. This module turns that file into the
callable the grader expects, so `run_suite(replay_system(...))` scores the
ACTUAL system end-to-end instead of the oracle test-double.

The SchemaValidator is applied here, on the recorded filters, so the same gate
that turns bad input into `errored=True` for the oracle also guards the real
outputs (the TS side has no validator of its own).

Regenerate the recording after any pipeline change:  npm run dump-system
"""

import json
from pathlib import Path
from .grader import SystemFn
from .rulebook import SchemaValidator

OUTPUTS_FILE = Path(__file__).parent / "system_outputs.jsonl"


def load_outputs(path: Path = OUTPUTS_FILE):
    """query -> recorded output dict"""
    outputs = {}
    with open(path, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            record = json.loads(line)
            outputs[record["query"]] = record
    return outputs


def replay_system(validator: SchemaValidator, path: Path = OUTPUTS_FILE):
    outputs = load_outputs(path)

    def run(query: str):
        record = outputs.get(query)
        if record is None:
            return {"errored": True, "intent": None, "filters": {}, "results": []}

        filters = record.get("filters", {})
        errored = record.get("errored", False)
        if validator.validate(filters):
            errored = True

        results = []
        for _ in range(record.get("results", 0)):
            results.append({})

        return {
            "intent": record.get("intent"),
            "filters": filters,
            "errored": errored,
            "results": results,
        }

    return run
