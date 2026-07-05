"""The grader: pass/fail scoring of an agent's output against the answer key.

This defines end-to-end task success NOW (Week 1) even though no agent exists
yet. Later weeks plug a real system in; Week 12 reports the aggregate rate.

A "system under test" is any callable: query (str) -> output (dict) shaped like
    {"intent": str, "filters": dict, "errored": bool, "results": list}
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from .dataset import EvalCase, load_cases

SystemFn = Callable[[str], dict]


@dataclass
class CaseResult:
    case: EvalCase
    passed: bool
    reasons: list[str]  # why it failed (empty when passed)


def score_case(expected: EvalCase, actual: dict) -> CaseResult:
    """Decide pass/fail for one case. This is THE definition of task success.

    Rules:
      - for search/recommend: fail if expected filters are not all present
        in actual["filters"] (subset match).
      - if expected.expect has "min_results": fail if too few results.
    Collect failure reasons into CaseResult.reasons.
    """
    reasons = []
    if expected.must_error:
        if not actual.get("errored"):
            reasons.append("expected to fail, but none was raised")
        return CaseResult(expected, passed=not reasons, reasons=reasons)

    if actual.get("errored"):
        reasons.append("system errored on a valid case")
        return CaseResult(expected, passed=not reasons, reasons=reasons)

    if actual.get("intent") != expected.intent:
        reasons.append(f"intent {actual.get('intent')!r} != expected {expected.intent!r}")
        return CaseResult(expected, passed=not reasons, reasons=reasons)

    if expected.intent in ("search", "recommend"):
        actual_filters = actual.get("filters", {})
        for key, want in expected.filters.items():
            if actual_filters.get(key) != want:
                reasons.append(f"filter {key}: expected {want!r}, got {actual_filters.get(key)!r}")


    return CaseResult(expected, passed=not reasons, reasons=reasons)



def run_suite(system: SystemFn, cases: Optional[list[EvalCase]] = None) -> list[CaseResult]:
    """Run every case through `system` and score it."""
    raise NotImplementedError


def task_success_rate(results: list[CaseResult]) -> float:
    """Fraction of cases that passed (0.0 .. 1.0). The headline Week-12 number."""
    raise NotImplementedError


def oracle_system(validator) -> SystemFn:
    """A perfect test-double used to sanity-check the GRADER itself.

    It looks up each query's gold labels and returns them, but still runs the
    real SchemaValidator so bad-input cases come back errored=True. With this
    system, task_success_rate(...) must be 1.0 — if it isn't, the scorer or
    validator has a bug (not the agent, since there is no agent yet).
    """
    raise NotImplementedError
