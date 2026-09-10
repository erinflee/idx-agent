"""Week 8 follow-up — calibrate the groundedness judge

1. Perturbation test (automatic). For every answered case, judge the clean
   answer, then append one plausible-sounding sentence the excerpts do NOT
   support and judge again. A good judge says grounded -> not grounded. The
   "catch rate" is the fraction of padded answers it flags. If padded answers
   pass, the groundedness rate is meaningless.

2. Human agreement (you). The same run writes evals/groundedness_labels.jsonl
   with the answer, the excerpts, and the judge's verdict. Fill in "human"
   (true/false) for ~20 rows, then rerun with --agreement to get % agreement.

Run:  TOKENIZERS_PARALLELISM=false python -m evals.judge_calibration
        (~80 flash calls: one answer + two judgments per answered case)
      python -m evals.judge_calibration --agreement
        (offline; scores the human labels you filled in)
"""

import sys
import json
from pathlib import Path
from rag import retrieve, rag_answer
from .rag_evals import load_rag_cases, judge_groundedness

LABELS = Path(__file__).parent / "groundedness_labels.jsonl"

# plausible in a real-estate answer, absent from every indexed document.
# rotated across cases so no single sentence carries the whole result.
PADDING = [
  "Under California law this must be disclosed to the buyer in writing within three business days.",
  "Most CRMLS agents treat any value above the county median as a red flag.",
  "The MLS refreshes this field automatically every night at 2 a.m.",
  "Industry surveys show roughly 70% of transactions are affected by this.",
  "Lenders typically require this to be verified by a licensed appraiser.",
]


def strip_source_line(answer):
  # the pipeline ends answers with "Source: <name>"; keep the padding inside the
  # body so the judge reads it as a claim, not a footer
  lines = answer.strip().split("\n")
  if lines and lines[-1].startswith("Source:"):
    return "\n".join(lines[:-1]).strip(), lines[-1]
  return answer.strip(), ""


def run_perturbation():
  cases = load_rag_cases()
  rows = []
  clean_grounded = 0
  padded_caught = 0
  judged = 0

  for index, case in enumerate(load_rag_cases()):
    if not case["answerable"]:
      continue
    answer = rag_answer(case["query"])
    if "isn't covered in my source documents" in answer:
      print(case["id"], "refused, skipped")
      continue

    hits = retrieve(case["query"], 4)
    body, source_line = strip_source_line(answer)
    padding = PADDING[index % len(PADDING)]
    padded = body + " " + padding + ("\n" + source_line if source_line else "")

    clean = judge_groundedness(case["query"], answer, hits)
    dirty = judge_groundedness(case["query"], padded, hits)
    if clean.get("grounded") is None or dirty.get("grounded") is None:
      print(case["id"], "judge failure, skipped")
      continue

    judged += 1
    if clean["grounded"]:
      clean_grounded += 1
    if not dirty["grounded"]:
      padded_caught += 1
    print(case["id"], "clean:", "grounded" if clean["grounded"] else "NOT grounded",
          "| padded:", "caught" if not dirty["grounded"] else "MISSED")

    rows.append({
      "id": case["id"],
      "query": case["query"],
      "answer": answer,
      "excerpts": [h["chunk"] for h in hits],
      "judge_grounded": clean["grounded"],
      "judge_reason": clean.get("reason", ""),
      "human": None,
    })

  with open(LABELS, "w", encoding="utf-8") as file:
    file.write("# fill in \"human\": true/false for ~20 rows (is every claim in the answer supported by the excerpts?), then run --agreement\n")
    for row in rows:
      file.write(json.dumps(row, ensure_ascii=False) + "\n")

  print()
  print(f"judged {judged} answered cases")
  print(f"clean groundedness rate: {clean_grounded / judged:.2f}")
  print(f"perturbation catch rate: {padded_caught / judged:.2f}  ({padded_caught}/{judged} padded answers flagged)")
  print(f"labels sheet written to {LABELS.name} — fill in 'human' and rerun with --agreement")


def run_agreement():
  labeled = []
  for line in open(LABELS, encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("#"):
      continue
    row = json.loads(line)
    if row.get("human") is not None:
      labeled.append(row)

  if not labeled:
    print("no human labels filled in yet")
    return

  agree = 0
  for row in labeled:
    if bool(row["human"]) == bool(row["judge_grounded"]):
      agree += 1
    else:
      print("DISAGREE", row["id"], "judge:", row["judge_grounded"], "human:", row["human"])

  print(f"human-judge agreement: {agree / len(labeled):.2f}  ({agree}/{len(labeled)} labeled cases)")


if __name__ == "__main__":
  if "--agreement" in sys.argv:
    run_agreement()
  else:
    run_perturbation()
