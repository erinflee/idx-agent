// feed sample recommendations to the formatter to output cards
//
// the branches worth covering: comp null (line disappears entirely) and the
// signed delta (above / below, magnitude only)
//
// run:  npm run test-recommend-format
//       (no DB / server needed)


import { formatRecommendations } from "./format";
import type { Recommendation, CompCheck } from "./recommend";


const compAbove: CompCheck = {
    price: 1150000,
    compPrice: 1000000,
    compCount: 18,
    deltaPercentage: 15.0,
};

const compBelow: CompCheck = {
    price: 780000,
    compPrice: 850000,
    compCount: 9,
    deltaPercentage: -8.2,
};

const compEqual: CompCheck = {
    price: 900000,
    compPrice: 900000,
    compCount: 5,
    deltaPercentage: 0,
};

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
        description: "European-style home with two floors and a front yard. Second floor balcony has a view of the Bay Bridge.",
        score: 80.6,
        comp: compAbove,
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
        comp: compBelow,
	}
];


function assert(condition: boolean, message: string): void {
	if (!condition) throw new Error(message);
}


function main() {
	const listing_id = "32922420";
	const cards = formatRecommendations(listing_id, hits);

	// header, ordering, card count
	assert(cards.includes(`Listings similar to ${listing_id}`), "missing header");
	assert(cards.indexOf("80.6") < cards.indexOf("64.2"), "cards reordered");
	assert(cards.split(" bd").length - 1 === 2, "expected 2 cards");
	assert(cards.includes("\n\n"), "cards not separated");
	assert(!cards.includes("No similar listings"), "empty message on populated hits");

	// number formatting
	assert(cards.includes("80.6"), "score not 1dp");
	assert(cards.includes("$1,150,000"), "price not comma-formatted");
	assert(cards.includes("$780,000"), "second price not comma-formatted");
	assert(cards.includes("$1,000,000"), "compPrice not comma-formatted");
	assert(cards.includes("3 bd / 2 ba"), "beds/baths missing");

	// signed delta: magnitude in the number, direction in the word
	assert(cards.includes("15% above"), "positive delta not 'above'");
	assert(cards.includes("8.2% below"), "negative delta not 'below'");
	assert(!cards.includes("-8.2"), "minus sign kept alongside 'below'");
	assert(!cards.includes("8.2% above"), "negative delta labelled 'above'");

	// comp counts
	assert(cards.includes("from 18 recent sales"), "first compCount missing");
	assert(cards.includes("from 9 recent sales"), "second compCount missing");

	// truncation
	assert(cards.includes("..."), "long description not truncated");
	assert(!cards.includes("view of the Bay Bridge"), "description tail not cut");

	// a null description drops its line rather than printing "null"
	assert(!cards.includes("null"), "null leaked into card");
	assert(!cards.includes("\n\n\n"), "dropped line left a gap");

	// nothing to recommend
	assert(formatRecommendations(listing_id, []).includes("No similar listings"), "empty hits: no message");
	assert(formatRecommendations(listing_id, null).includes("No similar listings"), "null hits: no message");

	console.log("PASS - formatRecommendations produces correct card strings");
}


