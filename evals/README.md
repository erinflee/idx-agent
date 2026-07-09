# Week 1 — Answer Key + Grader

The answer key + auto-grader for every agent built in later weeks. Defined now,
before any agent exists, so metrics come for free.

## Files

| File | What it is | Source |
| --- | --- | --- |
| `answers.jsonl` | **The answer key** — labeled query → correct intent + filters. | hand-labeled (~100–200 lines) |
| `ca_cities.txt` | Valid CA cities for the validator. | generated from DB via `generate_cities.py` |
| `rulebook.py` | `PropertyFilters` + `SchemaValidator` (rejects bad input). | hand-written |
| `load_answers.py` | Loads `answers.jsonl` into `EvalCase` objects. | hand-written |
| `grader.py` | The grader: `score_case`, `run_suite`, `task_success_rate`. | hand-written |
| `../tests/` | pytest checks for the validator, the dataset, and the grader. | hand-written |

## How to run

```bash
pip install -r requirements.txt   # installs pytest
pytest                            # from the repo root
```
