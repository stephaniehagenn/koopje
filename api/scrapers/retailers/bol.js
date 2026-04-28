// ═══════════════════════════════════════════════════════════
// BOL.COM SCRAPER - WITH EAN EXTRACTION
// ═══════════════════════════════════════════════════════════

const cheerio = require('cheerio');
const BaseScraper = require('./base');

class BolScraper extends BaseScraper {
  constructor() {
    super('Bol.com');
    this.baseUrl = 'https://www.bol.com';
  }

  async scrapeByName(productName) {
    try {
      // Search by product name
      const searchQuery = encodeURIComponent(productName);
      const searchUrl = `${this.baseUrl}/nl/nl/s/?searchtext=${searchQuery}`;
      
      const response = await this.fetchWithRetry(searchUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      // Find first product result
      const firstProduct = $('a[data-test="product-item"]').first();
      
      if (!firstProduct.length) {
        console.log(`[${this.name}] Product niet gevonden: ${productName}`);
        return null;
      }

      // Get product page URL
      const productLink = firstProduct.attr('href');
      const productUrl = productLink?.startsWith('http') 
        ? productLink 
        : `${this.baseUrl}${productLink}`;

      console.log(`[${this.name}] Product gevonden, ophalen details: ${productUrl}`);

      // Fetch product page
      await this.sleep(1000);
      const productResponse = await this.fetchWithRetry(productUrl);
      const productHtml = productResponse.data;
      const $product = cheerio.load(productHtml);

      // Extract EAN from product specifications
      let ean = null;
      
      // Method 1: Look in specifications table
      $product('[data-test="specifications"] dt').each((i, elem) => {
        const label = $product(elem).text().trim().toLowerCase();
        if (label.includes('ean') || label.includes('barcode')) {
          ean = $product(elem).next('dd').text().trim();
        }
      });

      // Method 2: Look in specs list (alternative structure)
      $product('.specs__item').each((i, elem) => {
        const label = $product(elem).find('.specs__label').text().trim().toLowerCase();
        if (label.includes('ean')) {
          ean = $product(elem).find('.specs__value').text().trim();
        }
      });

      // Method 3: JSON-LD structured data
      if (!ean) {
        const scriptTags = $product('script[type="application/ld+json"]');
        scriptTags.each((i, script) => {
          try {
            const data = JSON.parse($product(script).html());
            if (data.gtin13) ean = data.gtin13;
            if (data.gtin) ean = data.gtin;
          } catch (e) {
            // Ignore
          }
        });
      }

      console.log(`[${this.name}] EAN gevonden: ${ean || 'NIET GEVONDEN'}`);

      // Extract price
      const priceText = $product('[data-test="price"]').first().text().trim();
      const price = this.parsePrice(priceText);

      // Check stock
      const inStock = this.isInStock(productHtml);

      const result = {
        retailer: this.name,
        price: price,
        oldPrice: null,
        isDiscount: false,
        inStock: inStock,
        url: productUrl,
        shippingCost: 0, // Bol.com often has free shipping
        scrapedAt: new Date(),
        ean: ean, // ⭐ NEW: Return scraped EAN!
      };

      console.log(`[${this.name}] ✓ Scraped:`, result);
      return result;

    } catch (error) {
      console.error(`[${this.name}] ✗ Scraping failed:`, error.message);
      return null;
    }
  }

  async scrapeByEAN(productEan) {
    // Keep as fallback
    console.log(`[${this.name}] EAN search not fully implemented, use name search`);
    return null;
  }
}

module.exports = BolScraper;
