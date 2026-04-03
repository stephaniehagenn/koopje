const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Baby Price Tracker API'
  });
});

// Get all products with prices
app.get('/api/products', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'products.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const products = JSON.parse(data);
    
    res.json({
      success: true,
      ...products
    });
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// Get specific product by ID
app.get('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const dataPath = path.join(__dirname, 'data', 'products.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const allData = JSON.parse(data);
    
    const product = allData.products[productId];
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error reading product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Get cheapest price for a product
app.get('/api/products/:productId/cheapest', async (req, res) => {
  try {
    const { productId } = req.params;
    const dataPath = path.join(__dirname, 'data', 'products.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const allData = JSON.parse(data);
    
    const product = allData.products[productId];
    
    if (!product || !product.retailers || product.retailers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or has no retailers'
      });
    }
    
    const cheapest = product.retailers.reduce((min, retailer) => 
      retailer.price < min.price ? retailer : min
    );
    
    res.json({
      success: true,
      cheapest
    });
  } catch (error) {
    console.error('Error finding cheapest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find cheapest price'
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/products',
      'GET /api/products/:productId',
      'GET /api/products/:productId/cheapest'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Baby Price Tracker API running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Products: http://localhost:${PORT}/api/products`);
});
