// ═══════════════════════════════════════════════════════════
// BOL.COM SCRAPER
// ═══════════════════════════════════════════════════════════

const cheerio = require('cheerio');
const BaseScraper = require('./base');

class BolScraper extends BaseScraper {
  constructor() {
    super('Bol.com');
    this.baseUrl = 'https://www.bol.com';
  }

  async scrape(productEan) {
    try {
      const searchUrl = `${this.baseUrl}/nl/nl/s/?searchtext=${productEan}`;
      
      const response = await this.fetchWithRetry(searchUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      const productCard = $('a[data-test="product-item"]').first();
      
      if (!productCard.length) {
        console.log(`[${this.name}] Product niet gevonden voor EAN: ${productEan}`);
        return null;
      }

      const priceText = productCard.find('[data-test="price"]').text().trim();
      const price = this.parsePrice(priceText);

      const inStock = this.isInStock(html);

      const productUrl = productCard.attr('href');
      const fullUrl = productUrl?.startsWith('http') 
        ? productUrl 
        : `${this.baseUrl}${productUrl}`;

      const shippingCost = 0;

      const result = {
        retailer: this.name,
        price: price,
        oldPrice: null,
        isDiscount: false,
        inStock: inStock,
        url: fullUrl,
        shippingCost: shippingCost,
        scrapedAt: new Date(),
      };

      console.log(`[${this.name}] ✓ Scraped:`, result);
      return result;

    } catch (error) {
      console.error(`[${this.name}] ✗ Scraping failed:`, error.message);
      return null;
    }
  }
}

module.exports = BolScraper;
