// CLI demo of the semantic-search skill (Week 6)
//
// Pass a free-text description as an argument -> prints the top 5 similar listings
// Data comes from the Python FastAPI service via semanticSearchAgent
//
// Run:   npm run demo-semantic -- "charming craftsman with mountain views"
//       (needs the FastAPI server running: uvicorn service:app --reload)


import { semanticSearchAgent } from "./semanticSearch";


async function main() {
    const query = process.argv[2]
    if (!query || query.length === 0) {
        console.error('query empty, try: npx tsx skills/semanticSearch/semanticSearch.cli.ts "charming craftsman with mountain views"')
        process.exit(1)
    }

    const output = await semanticSearchAgent(query);
    console.log(output);
}


main().catch((err) => {
    console.error(err);
    process.exit(1);
});
