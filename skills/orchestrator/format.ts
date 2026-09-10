// Week 9 — turn a mixed-intent result (listings + market stats) into one readable reply
//
// the orchestrator is the only place that holds both halves, so the layout that joins
// them lives here rather than in propertySearch/format.ts or marketComps/format.ts

import type { ListingRow } from "../propertySearch/search";
import type { PriceTrendMonth } from "../marketComps/marketStats";
import { formatResults } from "../propertySearch/format";

const DIVIDER = "-----------------------";
