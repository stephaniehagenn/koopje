// ═══════════════════════════════════════════════════════════
// KRUIDVAT SCRAPER
// ═══════════════════════════════════════════════════════════

const cheerio = require('cheerio');
const BaseScraper = require('./base');

class KruidvatScraper extends BaseScraper {
  constructor() {
    super('Kruidvat');
    this.baseUrl = 'https://www.kruidvat.nl';
  }

  async scrape(productEan) {
    try {
      // Kruidvat zoek URL (gebruik EAN voor exacte match)
      const searchUrl = `${this.baseUrl}/zoeken?searchType=regular&text=${productEan}`;
      
      const response = await this.fetchWithRetry(searchUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      // Zoek product
      // NOTE: Deze selectors kunnen veranderen! Kruidvat update hun website regelmatig.
      const productCard = $('.product-item').first();
      
      if (!productCard.length) {
        console.log(`[${this.name}] Product niet gevonden voor EAN: ${productEan}`);
        return null;
      }

      // Haal prijs op
      const priceText = productCard.find('.price__value').text().trim();
      const price = this.parsePrice(priceText);

      // Haal oude prijs op (voor korting)
      const oldPriceText = productCard.find('.price__old').text().trim();
      const oldPrice = this.parsePrice(oldPriceText);

      // Check voorraad
      const inStock = this.isInStock(html);

      // Product URL
      const productUrl = productCard.find('a').attr('href');
      const fullUrl = productUrl?.startsWith('http') 
        ? productUrl 
        : `${this.baseUrl}${productUrl}`;

      // Verzendkosten (meestal €2,99 bij Kruidvat)
      const shippingCost = 2.99;

      const result = {
        retailer: this.name,
        price: price,
        oldPrice: oldPrice,
        isDiscount: oldPrice && oldPrice > price,
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

module.exports = KruidvatScraper;