// CLI demo of the market-stats skill (Week 5).
//
// Pass a city as an argument -> prints its market summary + price-trend card
// Data comes from the Python FastAPI service via marketStatsAgent
//
// Run:   npx tsx skills/marketComps/marketStats.cli.ts "Los Angeles"
//       (needs the FastAPI server running: uvicorn service:app --reload)


import { marketStatsAgent } from "./marketStats"

async function main() {
  const city = process.argv[2];
  if (!city) {
    console.log('Usage: npx tsx skills/marketComps/marketStats.cli.ts "<city>"');
    process.exit(1);
  }

  const card = await marketStatsAgent(city);
  console.log(card)
}


main().catch((err) => {
  console.error(err)
  process.exit(1)
});