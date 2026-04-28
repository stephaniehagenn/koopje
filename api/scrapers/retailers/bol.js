// ═══════════════════════════════════════════════════════════
// BOL.COM SCRAPER
// NOTE: Bol.com heeft een Partner API - dit is beter dan scrapen!
// Zie: https://partnerprogramma.bol.com/
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
      // Bol.com zoek URL
      const searchUrl = `${this.baseUrl}/nl/nl/s/?searchtext=${productEan}`;
      
      const response = await this.fetchWithRetry(searchUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      // Zoek eerste product resultaat
      // NOTE: Bol.com gebruikt vaak JavaScript, dus dit werkt misschien niet altijd
      const productCard = $('a[data-test="product-item"]').first();
      
      if (!productCard.length) {
        console.log(`[${this.name}] Product niet gevonden voor EAN: ${productEan}`);
        return null;
      }

      // Prijs ophalen
      const priceText = productCard.find('[data-test="price"]').text().trim();
      const price = this.parsePrice(priceText);

      // Check voorraad
      const inStock = this.isInStock(html);

      // Product URL
      const productUrl = productCard.attr('href');
      const fullUrl = productUrl?.startsWith('http') 
        ? productUrl 
        : `${this.baseUrl}${productUrl}`;

      // Verzendkosten (vaak gratis bij Bol.com)
      const shippingCost = 0;

      const result = {
        retailer: this.name,
        price: price,
        oldPrice: null, // Bol.com toont oude prijs niet altijd in search
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