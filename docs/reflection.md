# Reflection — what worked, what I'd change

Week 12 write-up for the IDX Multi-Agent Real Estate Assistant. Numbers below are from the eval runs recorded in `evals/README.md`. Nothing here is estimated.

## What I built

A WhatsApp assistant over two CRMLS tables (`rets_property` and `california_sold`), running on OpenClaw with Gemini 2.5 Flash as the agent model. Market stats and comps filter on `PropertySubType = 'SingleFamilyResidence'` rather than the handbook's `PropertyType = 'Residential'`, so condos and multi-unit sales don't skew a city's averages. Every market header says "single family homes" so the scope is visible in the reply.

Eight skills:

- property search with multi-turn memory
- market stats
- comp validation
- semantic search over `L_Remarks` embeddings
- hybrid recommendations
- RAG over four indexed sources: the Real Estate Data Analyst Primer, the Trestle RESO field metadata, the Week 5 market summaries generated from `california_sold`, and my own schema reference notes for the IDX-named `rets_property` columns the Trestle docs don't cover
- orchestrator
- email agent that drafts, waits for `approve <id>`, and only then sends

Embeddings are local (`all-MiniLM-L6-v2`), so the only paid calls are the agent turns and the LLM judges.

## What worked

**Writing the grader before the agent.**
In Week 1 I defined task success as a pass/fail rule over intent, filters, and result count, with an oracle to prove the grader itself was sound. In Week 12 I pointed that same grader at the real pipeline: 0.81 on the 118-case tuning set and 1.00 on the 30-case held-out search set. Having the definition fixed early meant every later week had a number to move instead of a feeling.

**Benchmarking the router instead of assuming the LLM wins.**
Three candidates on a 55-case held-out set scored once and never tuned against: keyword rules, MiniLM + logistic regression, and Gemini. The first lock (8/20) had the rules at 0.58 F1 and the LLM at 0.98. Splitting the keyword vocabulary into strong and
weak search terms, tuned on the training split only, took the rules to 0.94 F1 on the same held-out set. I shipped the rules: 4 F1 points for sub-millisecond, zero-cost inference, and no network dependency in the hot path.

**Reference-based judging for RAG.**
Every answerable case carries a gold answer in the source's own wording, so the correctness judge compares rather than decides. On the 60-case set: recall@4 1.00, correctness 0.93, groundedness 0.95, and 14 of 15 must-refuse cases refused. The one demo-critical bug the eval caught was a false refusal on "list-to-close ratio" (the primer says "sale-to-list"). An alias line in the system prompt fixed it and the case now passes.

**The approval gate.**
The email agent has a one-way status machine (pending → approved → sent). Re-approving a sent draft throws. Verified live on
WhatsApp: draft, preview relayed, `approve <id>` sent a real email, a second approve got "already sent."

## What the evals caught

- **The parser swallows bad input.**
  14 of 21 must-error cases pass through unrejected: "negative 100k" parses as 100k, a misspelled city is dropped, "dog" routes to unknown. The validator never sees anything invalid because the parser already discarded it. Found only when the real pipeline was scored end-to-end; the oracle could not have shown it.

- **Document-level recall hides chunk-level misses.**
  recall@4 is 1.00 but judged chunk relevance is 0.41. The contingency list in the primer sits across a chunk boundary, so the answer to "common contingencies" named one of three.

- **Short field-name queries fall below the similarity gate.**
  "define LivingArea" scores 0.13 against dense metadata-table chunks and never reaches the model. The gate that stops "book me a flight" also stops legitimate Trestle lookups. The Trestle slice is roughly 10/15 end-to-end versus near-perfect on the primer.

- **Unfiltered search is a data-exposure path.**
  Search orders by price descending on purpose, so "under $1M" opens with the homes closest to that budget instead of the cheapest lots in the state (the handbook's ascending sort). The cost of that choice: 4 of 6 safety slips are queries the router sent to search with an empty filter, which then returns the most expensive listing statewide. Deflection is 0.81 on 32 adversarial cases.

- **Session references defeat every router but the LLM.**
  "That one" and "the first listing" are missed by both the rules and the trained model. It is a context problem, not a vocabulary problem.

## What I'd change

1. **Surface unparseable values instead of dropping them.**
   The parser should return "I saw a price but couldn't read it" so the validator has something to reject. This is the single change that moves the end-to-end number most.

2. **Refuse empty-filter searches in the orchestrator.**
   No city and no price means no query. Expected to lift deflection from 0.81 to about 0.94.

3. **A field-name fast path for RAG.**
   If the query contains a known Trestle or schema column name, pin that field's chunk into the top-k and skip the gate.

4. **Tiered routing.**
   Rules first, escalate to the LLM only on `unknown`. About 20% of queries would pay the latency and buy most of the LLM's wins.

5. **Calibrate the groundedness judge.**
   It is Gemini grading Gemini with no reference. The perturbation test and human-agreement script are written (`evals/judge_calibration.py`) but not yet run; until then the 0.95 is directional.

6. **Report ranges.**
   Refusal accuracy moved 0.78 to 0.93 across runs as the set grew. Three runs and a mean with a range would be more honest than one number.
