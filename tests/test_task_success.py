"""End-to-end task success of the REAL pipeline, scored by the grader.

evals/dump_system.ts records what the TS router -> parser -> search actually
produced for every case; evals/replay_system.py feeds that recording to the
grader. The floors below are the rates measured on 2026-09-08 — a pipeline
change that drops below them fails this test, so regressions are caught.

Regenerate the recordings after a pipeline change (needs the DB running):
    npm run dump-system
    npm run dump-system -- evals/heldout.jsonl evals/system_outputs_heldout.jsonl
Then:  python3 -m pytest tests/test_task_success.py -q
"""

from pathlib import Path
import pytest

from evals.grader import run_suite, task_success_rate
from evals.load_answers import load_cases
from evals.replay_system import replay_system
from evals.rulebook import SchemaValidator

EVALS = Path(__file__).parent.parent / "evals"
ANSWERS_OUTPUTS = EVALS / "system_outputs.jsonl"
HELDOUT_CASES = EVALS / "heldout.jsonl"
HELDOUT_OUTPUTS = EVALS / "system_outputs_heldout.jsonl"

# measured 2026-09-08: answers 96/118, heldout 30/30
ANSWERS_FLOOR = 0.81
HELDOUT_FLOOR = 1.0


def failing_ids(results):
    ids = []
    for result in results:
        if not result.passed:
            ids.append(f"{result.expected.id}: {result.reasons[0]}")
    return ids


@pytest.mark.skipif(not ANSWERS_OUTPUTS.exists(), reason="run `npm run dump-system` first")
def test_real_system_task_success_on_answers():
    results = run_suite(replay_system(SchemaValidator(), ANSWERS_OUTPUTS))
    rate = task_success_rate(results)
    assert rate >= ANSWERS_FLOOR, f"task success {rate:.3f} < floor {ANSWERS_FLOOR}\n" + "\n".join(failing_ids(results))


@pytest.mark.skipif(not HELDOUT_OUTPUTS.exists(), reason="run `npm run dump-system -- evals/heldout.jsonl evals/system_outputs_heldout.jsonl` first")
def test_real_system_task_success_on_heldout():
    cases = load_cases(HELDOUT_CASES)
    results = run_suite(replay_system(SchemaValidator(), HELDOUT_OUTPUTS), cases)
    rate = task_success_rate(results)
    assert rate >= HELDOUT_FLOOR, f"task success {rate:.3f} < floor {HELDOUT_FLOOR}\n" + "\n".join(failing_ids(results))
