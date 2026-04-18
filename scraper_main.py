"""
Baby Price Tracker - Main Scraper
Automated daily price scraping from Dutch retailers
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
import sys

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Product configuration
PRODUCTS = [
    {
        'id': 'pampers-newborn-74',
        'name': 'Pampers Premium Protection Newborn',
        'category': 'Luiers',
        'size': '74 stuks',
        'icon': '👶',
        'search_terms': {
            'bol': 'pampers premium protection newborn 74',
            'kruidvat': 'pampers newborn',
            'ah': 'pampers premium newborn',
        }
    },
    {
        'id': 'pampers-pants-s4-44',
        'name': 'Pampers Baby-Dry Pants Maat 4',
        'category': 'Luiers',
        'size': '44 stuks',
        'icon': '🍼',
        'search_terms': {
            'bol': 'pampers baby dry pants maat 4',
            'kruidvat': 'pampers pants 4',
            'ah': 'pampers pants maat 4',
        }
    },
    {
        'id': 'kruidvat-wipes-168',
        'name': 'Kruidvat Sensitive Billendoekjes',
        'category': 'Billendoekjes',
        'size': '168 stuks',
        'icon': '🧻',
        'search_terms': {
            'kruidvat': 'kruidvat billendoekjes sensitive',
            'bol': 'billendoekjes sensitive 168',
        }
    },
]

# Retailer configurations
RETAILERS = {
    'bol': {
        'name': 'Bol.com',
        'type': 'online',
        'base_url': 'https://www.bol.com',
        'rating': 4.6,
    },
    'kruidvat': {
        'name': 'Kruidvat',
        'type': 'physical',
        'base_url': 'https://www.kruidvat.nl',
        'rating': 4.5,
    },
    'ah': {
        'name': 'Albert Heijn',
        'type': 'both',
        'base_url': 'https://www.ah.nl',
        'rating': 4.3,
    },
    'jumbo': {
        'name': 'Jumbo',
        'type': 'both',
        'base_url': 'https://www.jumbo.com',
        'rating': 4.2,
    },
    'etos': {
        'name': 'Etos',
        'type': 'both',
        'base_url': 'https://www.etos.nl',
        'rating': 4.4,
    },
}

# Scraping configuration
CONFIG = {
    'delay_between_requests': 3,  # seconds
    'max_retries': 3,
    'timeout': 30,
    'output_file': '/api/data/products.json',
}


class MockScraper:
    """
    Mock scraper for testing - returns realistic prices
    Replace this with real scrapers in production
    """
    
    def __init__(self, retailer_id, retailer_config):
        self.retailer_id = retailer_id
        self.config = retailer_config
        
    def scrape_product(self, product_id, search_term):
        """Generate mock data for testing"""
        import random
        
        logger.info(f"  → Scraping {self.config['name']}")
        
        # Simulate network delay
        time.sleep(CONFIG['delay_between_requests'])
        
        # Generate realistic prices based on product
        base_prices = {
            'pampers-newborn-74': 13.00,
            'pampers-pants-s4-44': 19.00,
            'kruidvat-wipes-168': 3.50,
        }
        
        base_price = base_prices.get(product_id, 15.00)
        
        # Add retailer-specific variation
        price_variation = {
            'bol': 0.5,
            'kruidvat': -1.0,
            'ah': 1.5,
            'jumbo': 0.8,
            'etos': 2.0,
        }
        
        price = base_price + price_variation.get(self.retailer_id, 0)
        price = round(price + random.uniform(-0.5, 0.5), 2)
        
        # Delivery costs
        delivery_costs = {
            'bol': 0,
            'kruidvat': 2.99,
            'ah': 3.95,
            'jumbo': 3.50,
            'etos': 3.49,
        }
        
        # Random promos
        promos = [None, None, None, '1+1 gratis', '2e halve prijs', 'Bulk deal', '25% korting']
        
        result = {
            'price': price,
            'deliveryCost': delivery_costs.get(self.retailer_id, 3.00),
            'stock': random.choice([True, True, True, False]),  # 75% in stock
            'promo': random.choice(promos),
            'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        logger.info(f"    ✓ €{result['price']:.2f} | Stock: {result['stock']} | Promo: {result['promo'] or 'None'}")
        
        return result


class PriceTrackerOrchestrator:
    """Main orchestrator for scraping all products from all retailers"""
    
    def __init__(self):
        self.results = {}
        self.scrapers = {}
        
        # Initialize scrapers for each retailer
        for retailer_id, retailer_config in RETAILERS.items():
            # TODO: Replace MockScraper with real scrapers
            self.scrapers[retailer_id] = MockScraper(retailer_id, retailer_config)
    
    def scrape_all_products(self):
        """Scrape all configured products from all retailers"""
        logger.info("="*70)
        logger.info(f"Starting price scrape run at {datetime.now()}")
        logger.info("="*70)
        
        for product in PRODUCTS:
            self._scrape_product(product)
        
        logger.info("="*70)
        logger.info(f"Scrape run completed at {datetime.now()}")
        logger.info("="*70)
        
        return self.results
    
    def _scrape_product(self, product):
        """Scrape a single product from all retailers"""
        product_id = product['id']
        
        logger.info(f"\n📦 Scraping: {product['name']}")
        logger.info("-" * 70)
        
        self.results[product_id] = {
            'name': product['name'],
            'category': product['category'],
            'size': product['size'],
            'icon': product['icon'],
            'retailers': []
        }
        
        # Scrape from each retailer
        for retailer_id, scraper in self.scrapers.items():
            # Check if this product has a search term for this retailer
            search_term = product['search_terms'].get(retailer_id)
            if not search_term:
                continue
            
            try:
                data = scraper.scrape_product(product_id, search_term)
                
                if data and data.get('price'):
                    retailer_data = {
                        'id': len(self.results[product_id]['retailers']) + 1,
                        'name': RETAILERS[retailer_id]['name'],
                        'price': data['price'],
                        'deliveryCost': data['deliveryCost'],
                        'type': RETAILERS[retailer_id]['type'],
                        'rating': RETAILERS[retailer_id]['rating'],
                        'stock': data['stock'],
                        'promo': data['promo'],
                        'lastUpdated': data['lastUpdated']
                    }
                    
                    self.results[product_id]['retailers'].append(retailer_data)
                    
            except Exception as e:
                logger.error(f"  ✗ Error scraping {RETAILERS[retailer_id]['name']}: {e}")
    
    def save_results(self, filename=None):
        """Save results to JSON file"""
        if not filename:
            filename = CONFIG['output_file']
        
        # Ensure directory exists
        Path(filename).parent.mkdir(parents=True, exist_ok=True)
        
        # Prepare output
        output = {
            'lastUpdated': datetime.now().isoformat(),
            'products': self.results,
            'metadata': {
                'totalProducts': len(self.results),
                'totalPrices': sum(len(p['retailers']) for p in self.results.values()),
                'scrapeDate': datetime.now().strftime('%Y-%m-%d'),
                'scrapeTime': datetime.now().strftime('%H:%M:%S'),
            }
        }
        
        # Save to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        logger.info(f"\n✅ Results saved to: {filename}")
        logger.info(f"   Products: {output['metadata']['totalProducts']}")
        logger.info(f"   Total prices: {output['metadata']['totalPrices']}")
        logger.info(f"   Avg retailers/product: {output['metadata']['totalPrices']/output['metadata']['totalProducts']:.1f}")


def main():
    """Main entry point"""
    try:
        orchestrator = PriceTrackerOrchestrator()
        orchestrator.scrape_all_products()
        orchestrator.save_results()
        
        logger.info("\n🎉 Scraping completed successfully!")
        
    except KeyboardInterrupt:
        logger.info("\n⚠️  Scraping interrupted by user")
        sys.exit(1)
        
    except Exception as e:
        logger.error(f"\n❌ Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
