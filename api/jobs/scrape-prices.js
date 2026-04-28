// ═══════════════════════════════════════════════════════════
// CRON JOB: Scrape prijzen elke 6 uur
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const cron = require('node-cron');
const ScraperManager = require('../scrapers/scraper');

// Run elke 6 uur (0 */6 * * *)
// Of test: elke minuut (* * * * *)
const schedule = '0 */6 * * *';

console.log(`📅 Cron job scheduled: ${schedule}`);
console.log(`   = Every 6 hours\n`);

cron.schedule(schedule, async () => {
  console.log(`\n⏰ Cron triggered at ${new Date().toISOString()}`);
  
  const manager = new ScraperManager();
  await manager.scrapeAllProducts();
});

// Keep process alive
console.log('✓ Cron job is running...\n');
