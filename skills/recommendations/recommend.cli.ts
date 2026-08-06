// CLI demo of the hybrid-recommendations skill (Week 7)
//
// Pass a listing id as an argument -> prints the top 5 similar listings, each
// stamped with a comp check against recent california_sold sales
// Data comes from the Python FastAPI service via recommendAgent
//
// Run:   npm run demo-recommend -- "1174440876"
//       (needs the FastAPI server running: uvicorn service:app --reload)

import { recommendAgent } from "./recommend";


async function main() {
	const listing_id = process.argv[2];
	if (!listing_id || typeof listing_id !== "string") {
		console.error("Listing id must be a string");
		process.exit(1);
	}
	
	const cards = await recommendAgent(listing_id);
	console.log(cards);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
})