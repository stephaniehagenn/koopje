// ═══════════════════════════════════════════════════════════
// SCRAPER MANAGER
// Runt alle scrapers en slaat prijzen op in database
// ═══════════════════════════════════════════════════════════

const { Pool } = require('pg');
const KruidvatScraper = require('./retailers/kruidvat');
const BolScraper = require('./retailers/bol');

class ScraperManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.scrapers = [
      new KruidvatScraper(),
      new BolScraper(),
    ];
  }

  async scrapeProduct(product) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦 Scraping: ${product.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const results = [];
  let scrapedEan = product.ean; // Start with existing EAN if any

  for (const scraper of this.scrapers) {
    try {
      // Use name search (better than EAN for initial discovery)
      const searchTerm = product.search_query || product.name;
      const result = await scraper.scrapeByName(searchTerm);
      
      if (result && result.price) {
        // If scraper found an EAN, use it!
        if (result.ean && !scrapedEan) {
          scrapedEan = result.ean;
          console.log(`[${scraper.name}] 🎯 Nieuwe EAN ontdekt: ${scrapedEan}`);
          
          // Update product in database with discovered EAN
          await this.pool.query(
            'UPDATE products SET ean = $1 WHERE id = $2',
            [scrapedEan, product.id]
          );
          console.log(`[${scraper.name}] ✓ EAN opgeslagen in database`);
        }

        // Get retailer ID
        const retailerQuery = await this.pool.query(
          'SELECT id FROM retailers WHERE name = $1',
          [result.retailer]
        );

        if (retailerQuery.rows.length > 0) {
          const retailerId = retailerQuery.rows[0].id;

          // Save price to database
          await this.pool.query(`
            INSERT INTO price_history 
            (product_id, retailer_id, price, old_price, is_discount, in_stock, shipping_cost, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `, [
            product.id,
            retailerId,
            result.price,
            result.oldPrice,
            result.isDiscount,
            result.inStock,
            result.shippingCost,
          ]);

          console.log(`[${scraper.name}] ✓ Saved to database: €${result.price}`);
          results.push(result);
        }
      }

      // Wait between retailers
      await scraper.sleep(2000);

    } catch (error) {
      console.error(`[${scraper.name}] ✗ Error:`, error.message);
    }
  }

  return results;
}
  async scrapeAllProducts() {
    console.log('\n🤖 Starting scraper...\n');

    try {
      const productsQuery = await this.pool.query(`
        SELECT id, name, ean 
        FROM products 
        WHERE is_active = true AND ean IS NOT NULL
      `);

      const products = productsQuery.rows;
      console.log(`Found ${products.length} products to scrape\n`);

      for (const product of products) {
        await this.scrapeProduct(product);
        
        console.log('\n⏳ Waiting 5 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      console.log('\n✅ Scraping completed!\n');
    } catch (error) {
      console.error('\n❌ Scraping failed:', error);
    } finally {
      await this.pool.end();
    }
  }
}

module.exports = ScraperManager;
