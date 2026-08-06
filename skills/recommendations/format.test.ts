// feed sample recommendations to the formatter to output cards
//
// the branches worth covering: comp null (line disappears entirely) and the
// signed delta (above / below, magnitude only)
//
// run:  npm run test-recommend-format
//       (no DB / server needed)


import { formatRecommendations } from "./format";
import type { Recommendation, CompCheck } from "./recommend";

const hits: Recommendation[] = [
	{
		id: "10428422",
        address: "2143 Haste Way",
        propertyType: "SingleFamilyResidence",
        city: "Berkeley",
        beds: 3,
        baths: 2,
        sqft: 1640,
        year: 1948,
        price: 1150000,
        description: "Modern looking home with two floors and a front yard.",
        score: 80.6,
        comp,
	},
	{
        id: "10428999",
        address: "77 Shattuck Pl",
        propertyType: "SingleFamilyResidence",
        city: "Berkeley",
        beds: 3,
        baths: 1,
        sqft: 1490,
        year: null,
        price: 780000,
        description: null,
        score: 64.2,
        comp: null,		
	}
];

const comp: CompCheck = {
    price: 1150000,
    compPrice: 1000000,
    compCount: 18,
    deltaPercentage: 15.0,
};

