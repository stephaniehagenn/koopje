// ═══════════════════════════════════════════════════════════
// BASE SCRAPER CLASS
// Alle retailers erven van deze class
// ═══════════════════════════════════════════════════════════

const axios = require('axios');

class BaseScraper {
  constructor(retailerName) {
    this.name = retailerName;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ];
  }

  // Random user agent om detectie te vermijden
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // Sleep functie voor rate limiting
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry mechanisme
  async fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[${this.name}] Fetching: ${url} (attempt ${i + 1}/${maxRetries})`);
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
          },
          timeout: 10000, // 10 seconden timeout
        });
        
        console.log(`[${this.name}] ✓ Success (${response.status})`);
        return response;
      } catch (error) {
        console.error(`[${this.name}] ✗ Attempt ${i + 1} failed:`, error.message);
        
        if (i === maxRetries - 1) {
          throw error; // Laatste poging gefaald
        }
        
        // Exponential backoff: wacht langer na elke poging
        await this.sleep(1000 * (i + 1));
      }
    }
  }

  // Parse prijs string naar number
  parsePrice(priceString) {
    if (!priceString) return null;
    
    // Verwijder alles behalve cijfers, komma en punt
    const cleaned = priceString.replace(/[^\d,.-]/g, '');
    
    // Vervang komma met punt (Nederlands formaat)
    const normalized = cleaned.replace(',', '.');
    
    const price = parseFloat(normalized);
    return isNaN(price) ? null : price;
  }

  // Check of product op voorraad is
  isInStock(html) {
    const outOfStockPhrases = [
      'niet op voorraad',
      'tijdelijk uitverkocht',
      'niet leverbaar',
      'niet beschikbaar',
      'out of stock',
      'uitverkocht',
    ];
    
    const lowercaseHtml = html.toLowerCase();
    return !outOfStockPhrases.some(phrase => lowercaseHtml.includes(phrase));
  }

  // Abstract methode - moet geïmplementeerd worden door child classes
  async scrape(productEan) {
    throw new Error(`scrape() method must be implemented by ${this.name}`);
  }
}

module.exports = BaseScraper;
