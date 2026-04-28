// ═══════════════════════════════════════════════════════════
// KRUIDVAT SCRAPER - WITH EAN EXTRACTION
// ═══════════════════════════════════════════════════════════

const cheerio = require('cheerio');
const BaseScraper = require('./base');

class KruidvatScraper extends BaseScraper {
  constructor() {
    super('Kruidvat');
    this.baseUrl = 'https://www.kruidvat.nl';
  }

  async scrapeByName(productName) {
    try {
      // Search by product name
      const searchQuery = encodeURIComponent(productName);
      const searchUrl = `${this.baseUrl}/zoeken?text=${searchQuery}`;
      
      const response = await this.fetchWithRetry(searchUrl);
      const html = response.data;
      const $ = cheerio.load(html);

      // Find first product result
      const firstProduct = $('.product-item').first();
      
      if (!firstProduct.length) {
        console.log(`[${this.name}] Product niet gevonden: ${productName}`);
        return null;
      }

      // Get product page URL
      const productLink = firstProduct.find('a').attr('href');
      const productUrl = productLink?.startsWith('http') 
        ? productLink 
        : `${this.baseUrl}${productLink}`;

      console.log(`[${this.name}] Product gevonden, ophalen details: ${productUrl}`);

      // Fetch product page
      await this.sleep(1000); // Be nice to the server
      const productResponse = await this.fetchWithRetry(productUrl);
      const productHtml = productResponse.data;
      const $product = cheerio.load(productHtml);

      // Extract EAN from product specifications
      let ean = null;
      
      // Method 1: Look in product specifications table
      $product('.product-details__table tr').each((i, row) => {
        const label = $product(row).find('th').text().trim().toLowerCase();
        if (label.includes('ean') || label.includes('barcode')) {
          ean = $product(row).find('td').text().trim();
        }
      });

      // Method 2: Look in meta tags
      if (!ean) {
        ean = $product('meta[property="product:ean"]').attr('content');
      }

      // Method 3: Look in JSON-LD structured data
      if (!ean) {
        const scriptTags = $product('script[type="application/ld+json"]');
        scriptTags.each((i, script) => {
          try {
            const data = JSON.parse($product(script).html());
            if (data.gtin13) ean = data.gtin13;
            if (data.gtin) ean = data.gtin;
          } catch (e) {
            // Ignore parse errors
          }
        });
      }

      console.log(`[${this.name}] EAN gevonden: ${ean || 'NIET GEVONDEN'}`);

      // Extract price
      const priceText = $product('.product-price').first().text().trim();
      const price = this.parsePrice(priceText);

      // Extract old price (if on sale)
      const oldPriceText = $product('.product-price--old, .price__old').first().text().trim();
      const oldPrice = this.parsePrice(oldPriceText);

      // Check stock
      const inStock = this.isInStock(productHtml);

      const result = {
        retailer: this.name,
        price: price,
        oldPrice: oldPrice,
        isDiscount: oldPrice && oldPrice > price,
        inStock: inStock,
        url: productUrl,
        shippingCost: 2.99,
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
    // Keep EAN search as fallback
    try {
      const searchUrl = `${this.baseUrl}/zoeken?text=${productEan}`;
      const response = await this.fetchWithRetry(searchUrl);
      // ... similar logic as before
      console.log(`[${this.name}] EAN search not fully implemented, use name search`);
      return null;
    } catch (error) {
      console.error(`[${this.name}] ✗ EAN search failed:`, error.message);
      return null;
    }
  }
}

module.exports = KruidvatScraper;
