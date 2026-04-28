// ═══════════════════════════════════════════════════════════
// TEST SCRAPER
// Run dit om de scraper te testen
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const ScraperManager = require('./scrapers/scraper');

async function test() {
  console.log('🧪 Testing scraper...\n');
  
  const manager = new ScraperManager();
  await manager.scrapeAllProducts();
  
  process.exit(0);
}

test();