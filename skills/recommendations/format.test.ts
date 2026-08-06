// feed sample recommendations to the formatter to output cards
//
// the branches worth covering: comp null (line disappears entirely) and the
// signed delta (above / below, magnitude only)
//
// run:  npm run test-recommend-format
//       (no DB / server needed)


import { formatRecommendations } from "./format";
import type { Recommendation, CompCheck } from "./recommend";
