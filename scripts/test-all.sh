#!/bin/sh
# run the full Week 3 test suite, one test per line
# invoked via:  npm test  (see package.json) — or directly:  sh scripts/test-all.sh
set -e   # stop at the first failing test (same short-circuit as &&)

# unit tests first — fast, no DB, so a pure logic bug fails before the slow tests
npx tsx skills/propertySearch/format.test.ts
npx tsx skills/propertySearch/parse.test.ts

# integration tests — hit live MySQL (need .env + the DB running)
npx tsx skills/propertySearch/search.test.ts
npx tsx skills/propertySearch/index.test.ts
npx tsx skills/marketComps/comps.test.ts

echo "ALL SUITES PASSED"
