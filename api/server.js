// ═══════════════════════════════════════════════════════════
// BABY PRICE TRACKER API SERVER
// Version: 2.0 - Met scraping functionaliteit
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// Root - Show available endpoints
// ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Baby Price Tracker API',
    version: '2.0',
    availableEndpoints: [
      'GET /health - Health check',
      'GET /api/products - Get all products with prices',
      'GET /api/products/:productId - Get single product',
      'GET /api/products/:productId/cheapest - Get cheapest retailer for product',
      'GET /api/products/:productId/history - Get price history',
      'POST /api/scrape - Trigger manual scrape (background)',
      'POST /api/track - Track analytics event'
    ]
  });
});

// ────────────────────────────────────────────────────────────
// Health check
// ────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────
// Get all products with latest prices
// ────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Products requested');

    const query = `
      SELECT 
        p.id, p.name, p.brand, p.category, p.size, p.maat, p.emoji,
        r.id as retailer_id, r.name as retailer_name, r.logo as retailer_logo,
        ph.price, ph.old_price, ph.is_discount, ph.in_stock, 
        ph.shipping_cost, ph.timestamp,
        ph.total_price, ph.price_per_unit, ph.promo_quantity,
        ph.promo_type, ph.original_price, ph.discount_amount
      FROM products p
      LEFT JOIN LATERAL (
        SELECT DISTINCT ON (retailer_id) *
        FROM price_history
        WHERE product_id = p.id
        ORDER BY retailer_id, timestamp DESC
      ) ph ON true
      LEFT JOIN retailers r ON ph.retailer_id = r.id
      WHERE p.is_active = true
      ORDER BY p.category, p.name, r.name
    `;

    const result = await pool.query(query);
    
    // Group by product
    const products = {};
    result.rows.forEach(row => {
      if (!products[row.id]) {
        products[row.id] = {
          id: row.id,
          name: row.name,
          brand: row.brand,
          category: row.category,
          size: row.size,
          maat: row.maat,  // NEW!
          emoji: row.emoji,
          retailers: []
        };
      }
      
      if (row.retailer_id) {
        products[row.id].retailers.push({
          name: row.retailer_name,
          logo: row.retailer_logo,
          price: parseFloat(row.price),
          oldPrice: row.old_price ? parseFloat(row.old_price) : null,
          discount: row.is_discount,
          inStock: row.in_stock,
          shippingCost: parseFloat(row.shipping_cost),
          lastChecked: row.timestamp,
          // NEW FIELDS:
          totalPrice: row.total_price ? parseFloat(row.total_price) : null,
          pricePerUnit: row.price_per_unit ? parseFloat(row.price_per_unit) : null,
          promoQuantity: row.promo_quantity,
          promoType: row.promo_type,
          originalPrice: row.original_price ? parseFloat(row.original_price) : null,
          discountAmount: row.discount_amount ? parseFloat(row.discount_amount) : null
        });
      }
    });

    console.log(`✅ Returned ${Object.keys(products).length} products`);
    res.json({ products });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ────────────────────────────────────────────────────────────
// Get single product
// ────────────────────────────────────────────────────────────
app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', r.id,
              'name', r.name,
              'price', ph.price,
              'oldPrice', ph.old_price,
              'discount', ph.is_discount,
              'logo', r.logo,
              'url', r.url,
              'lastChecked', ph.timestamp,
              'stock', ph.in_stock,
              'shippingCost', ph.shipping_cost
            )
          )
          FROM (
            SELECT DISTINCT ON (retailer_id) *
            FROM price_history
            WHERE product_id = p.id
            ORDER BY retailer_id, timestamp DESC
          ) ph
          JOIN retailers r ON ph.retailer_id = r.id
        ) as retailers
      FROM products p
      WHERE p.id = $1 AND p.is_active = true
    `, [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = result.rows[0];

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        size: product.size,
        ean: product.ean,
        imageUrl: product.image_url,
        emoji: product.emoji,
        retailers: product.retailers || [],
        nextDiscount: product.next_discount,
      }
    });
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: err.message
    });
  }
});

// ────────────────────────────────────────────────────────────
// Get cheapest retailer for a product
// ────────────────────────────────────────────────────────────
app.get('/api/products/:productId/cheapest', async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.name,
        r.logo,
        r.url,
        ph.price,
        ph.old_price,
        ph.is_discount,
        ph.in_stock,
        ph.shipping_cost,
        ph.timestamp
      FROM price_history ph
      JOIN retailers r ON ph.retailer_id = r.id
      WHERE ph.product_id = $1
        AND ph.timestamp = (
          SELECT MAX(timestamp) 
          FROM price_history 
          WHERE product_id = $1 AND retailer_id = ph.retailer_id
        )
      ORDER BY ph.price ASC
      LIMIT 1
    `, [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No prices found for this product'
      });
    }

    res.json({
      success: true,
      cheapest: {
        retailer: result.rows[0].name,
        price: result.rows[0].price,
        oldPrice: result.rows[0].old_price,
        discount: result.rows[0].is_discount,
        inStock: result.rows[0].in_stock,
        shippingCost: result.rows[0].shipping_cost,
        url: result.rows[0].url,
        lastChecked: result.rows[0].timestamp
      }
    });
  } catch (err) {
    console.error('❌ Error finding cheapest:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to find cheapest retailer',
      message: err.message
    });
  }
});

// ────────────────────────────────────────────────────────────
// Get price history for a product
// ────────────────────────────────────────────────────────────
app.get('/api/products/:productId/history', async (req, res) => {
  const { productId } = req.params;
  const { days = 30 } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        DATE(timestamp) as date,
        MIN(price) as lowest_price,
        AVG(price) as avg_price,
        r.name as retailer_name,
        r.id as retailer_id
      FROM price_history ph
      JOIN retailers r ON ph.retailer_id = r.id
      WHERE ph.product_id = $1
        AND ph.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE(timestamp), r.id, r.name
      ORDER BY date DESC, lowest_price ASC
    `, [productId]);

    res.json({
      success: true,
      productId: productId,
      days: parseInt(days),
      history: result.rows
    });
  } catch (err) {
    console.error('❌ Error fetching history:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history',
      message: err.message
    });
  }
});

// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
// Manual scraper trigger (runs in background)
// ────────────────────────────────────────────────────────────
app.post('/api/scrape', async (req, res) => {
  console.log('🤖 Manual scrape triggered');

  try {
    // Import ScraperManager
    const ScraperManager = require('./scrapers/scraper');
    
    // Create instance
    const manager = new ScraperManager();

    // Start scraping in background (don't await)
    manager.scrapeAllProducts()
      .then(() => {
        console.log('✅ Background scrape completed successfully');
      })
      .catch(err => {
        console.error('❌ Background scrape failed:', err);
      });

    // Immediately respond to user
    res.json({
      success: true,
      message: 'Scraping started in background',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Scrape trigger failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start scraper',
      message: error.message
    });
  }
});
// ────────────────────────────────────────────────────────────
// Track analytics event
// ────────────────────────────────────────────────────────────
app.post('/api/track', async (req, res) => {
  const { event, productId, retailerId, price, timestamp } = req.body;

  console.log(`📊 Track event: ${event} - Product: ${productId}`);

  try {
    await pool.query(`
      INSERT INTO analytics_events (event_type, product_id, retailer_id, price, timestamp)
      VALUES ($1, $2, $3, $4, $5)
    `, [event, productId, retailerId, price, timestamp || new Date()]);

    res.json({
      success: true,
      message: 'Event tracked'
    });
  } catch (err) {
    console.error('❌ Error tracking event:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to track event',
      message: err.message
    });
  }
});

// ────────────────────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/products',
      'GET /api/products/:productId',
      'GET /api/products/:productId/cheapest',
      'GET /api/products/:productId/history',
      'POST /api/scrape',
      'POST /api/track'
    ]
  });
});

// ────────────────────────────────────────────────────────────
// Error Handler
// ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log('🚀  Baby Price Tracker API Server');
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log(`🚀  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀  Running on: http://localhost:${PORT}`);
  console.log(`🚀  Health check: http://localhost:${PORT}/health`);
  console.log(`🚀  Products: http://localhost:${PORT}/api/products`);
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log('');
});

// ═══════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════

process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
