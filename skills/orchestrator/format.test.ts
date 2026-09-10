// feed sample data to the mixed-intent formatters
//
// the branches worth covering: trendVerdict's direction thresholds (rising above +2%,
// falling below -2%, flat between), the explicit "+" on gains, and the too-few-months
// fallback; formatMixed's header (count comes from rows, price note only when a cap
// was given), card numbering, the divider, and the stats block landing at the end
//
// run:  npm run test-orchestrator-format
//      (no DB / server needed)
